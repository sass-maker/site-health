import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const DEFAULT_ARTIFACT_DIR = './artifacts/blender';
const BUILDER_PATH = fileURLToPath(new URL('../../scripts/blender/literal_scene_builder.py', import.meta.url));
const BUILDER_VERSION = 'literal-scene-builder-v1';
const SUPPORTED_VERSION = { major: 5, minor: 2 };
const ALLOWED_OBJECTS = new Set(['star', 'diamond', 'world', 'traveller', 'light', 'rain', 'heart', 'road', 'subject']);
const ALLOWED_CAMERAS = new Set(['static', 'slow-push', 'gentle-orbit']);
const ALLOWED_PALETTES = new Set(['midnight-gold', 'blue-silver', 'violet-cyan']);

export class BlenderAdapter {
  constructor(options = {}) {
    this.artifactDir = path.resolve(options.artifactDir ?? DEFAULT_ARTIFACT_DIR);
    this.blenderPath = options.blenderPath ?? null;
    this.commandRunner = options.commandRunner ?? defaultCommandRunner;
    this.now = options.now ?? (() => new Date());
    this.timeoutMs = clampInteger(options.timeoutMs ?? 5 * 60_000, 10_000, 30 * 60_000);
  }

  async capability() {
    return probeBlender({
      blenderPath: this.blenderPath,
      commandRunner: this.commandRunner,
    });
  }

  async createVideo(brief) {
    const scenes = Array.isArray(brief.literalScenes) && brief.literalScenes.length
      ? brief.literalScenes
      : [{
        id: 'scene-1',
        lyric: brief.hook,
        objects: ['subject'],
        camera: 'slow-push',
        palette: 'midnight-gold',
      }];
    return this.renderScenes({
      id: brief.id,
      scenes,
      width: 540,
      height: 960,
      samples: 16,
    });
  }

  async renderScenes(input) {
    const capability = await this.capability();
    if (!capability.ready) throw new Error(capability.blocker);

    const taskId = `blender_${safeSlug(input.id ?? 'literal-scenes')}_${this.now().getTime()}`;
    const runDir = path.join(this.artifactDir, taskId);
    const manifest = normalizeBlenderManifest(input, { runDir });
    const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;
    const manifestHash = sha256(manifestJson);
    const cacheIdentity = sha256(JSON.stringify({
      runtime: capability.version,
      builder: BUILDER_VERSION,
      manifestHash,
    }));
    const manifestPath = path.join(runDir, 'scene-manifest.json');
    const resultPath = path.join(runDir, 'render.json');
    await mkdir(path.join(runDir, 'plates'), { recursive: true });
    await writeFile(manifestPath, manifestJson);

    const args = [
      '--background',
      '--factory-startup',
      '--disable-autoexec',
      '--python',
      BUILDER_PATH,
      '--',
      '--manifest',
      manifestPath,
    ];
    const startedAt = Date.now();
    let processResult;
    try {
      processResult = await this.commandRunner(capability.executable, args, {
        timeout: this.timeoutMs,
        maxBuffer: 64 * 1024 * 1024,
      });
    } catch (error) {
      throw new Error(`Blender render failed: ${sanitizeProcessError(error)}`);
    }
    const processLog = `${processResult?.stdout ?? ''}\n${processResult?.stderr ?? ''}`;
    if (/\bTraceback \(most recent call last\):|Error: Python:/i.test(processLog)) {
      throw new Error(`Blender scene builder failed: ${sanitizeLog(processLog).replace(/\s+/g, ' ').trim()}`);
    }

    const plates = [];
    for (const scene of manifest.scenes) {
      const outputPath = resolveRunPath(runDir, scene.output);
      const info = await stat(outputPath).catch(() => null);
      if (!info?.isFile() || info.size < 8) {
        throw new Error(`Blender render incomplete: missing plate ${scene.output}`);
      }
      plates.push({
        sceneId: scene.id,
        path: outputPath,
        bytes: info.size,
        sha256: sha256(await readFile(outputPath)),
      });
    }

    const durationMs = Date.now() - startedAt;
    const render = {
      provider: 'blender',
      externalTaskId: taskId,
      status: 'completed',
      videos: [],
      artifacts: plates.map((plate) => plate.path),
      durationSeconds: null,
      proofType: 'generated_card',
      captionText: manifest.scenes[0]?.lyric ?? null,
      renderLog: [
        `blenderVersion=${capability.version}`,
        `builderVersion=${BUILDER_VERSION}`,
        `manifestHash=${manifestHash}`,
        `cacheIdentity=${cacheIdentity}`,
        `scenes=${manifest.scenes.length}`,
        `durationMs=${durationMs}`,
      ],
      raw: {
        aspect: `${manifest.width}:${manifest.height}`,
        width: manifest.width,
        height: manifest.height,
        manifestPath,
        manifestHash,
        cacheIdentity,
        builderVersion: BUILDER_VERSION,
        blenderVersion: capability.version,
        blenderExecutable: capability.executable,
        commandPosture: args.filter((argument) => argument !== manifestPath),
        plates,
        stdout: sanitizeLog(processResult?.stdout),
        stderr: sanitizeLog(processResult?.stderr),
      },
    };
    await writeFile(resultPath, `${JSON.stringify({ taskId, render }, null, 2)}\n`);
    return render;
  }

  async getStatus(externalTaskId) {
    const resultPath = resolveRunPath(this.artifactDir, `${externalTaskId}/render.json`);
    return JSON.parse(await readFile(resultPath, 'utf8')).render;
  }
}

export async function probeBlender(options = {}) {
  const candidates = [
    options.blenderPath,
    '/Applications/Blender.app/Contents/MacOS/Blender',
    'blender',
  ].filter(Boolean);
  const commandRunner = options.commandRunner ?? defaultCommandRunner;
  const errors = [];

  for (const executable of [...new Set(candidates)]) {
    try {
      const result = await commandRunner(executable, ['--version'], {
        timeout: 15_000,
        maxBuffer: 1024 * 1024,
      });
      const text = `${result?.stdout ?? ''}\n${result?.stderr ?? ''}`;
      const match = text.match(/\bBlender\s+(\d+)\.(\d+)(?:\.(\d+))?/i);
      if (!match) {
        errors.push(`${executable}: version output was not recognized`);
        continue;
      }
      const version = `${match[1]}.${match[2]}.${match[3] ?? '0'}`;
      const compatible = Number(match[1]) === SUPPORTED_VERSION.major
        && Number(match[2]) === SUPPORTED_VERSION.minor;
      return compatible
        ? { ready: true, executable, version, blocker: null }
        : {
          ready: false,
          executable,
          version,
          blocker: `Blender ${version} is installed; Blender 5.2.x is required.`,
        };
    } catch (error) {
      errors.push(`${executable}: ${error?.code === 'ENOENT' ? 'not found' : sanitizeProcessError(error)}`);
    }
  }

  return {
    ready: false,
    executable: null,
    version: null,
    blocker: `Blender 5.2.x is not ready. Install the Blender cask or set an explicit executable. ${errors.join(' ')}`,
  };
}

export function buildBlenderSceneManifest(input, options = {}) {
  const runDir = path.resolve(options.runDir ?? './tmp/blender-manifest');
  return normalizeBlenderManifest(input, { runDir });
}

function normalizeBlenderManifest(input = {}, options) {
  if (input.python || input.script || input.blendFile || input.addons) {
    throw new Error('Blender requests cannot include Python, scripts, .blend files, or add-ons');
  }
  if (!Array.isArray(input.scenes) || input.scenes.length < 1 || input.scenes.length > 60) {
    throw new Error('Blender manifest scenes must contain 1-60 entries');
  }
  const width = clampInteger(input.width ?? 540, 360, 1080);
  const height = clampInteger(input.height ?? 960, 640, 1920);
  const samples = clampInteger(input.samples ?? 16, 1, 64);
  const runDir = path.resolve(options.runDir);
  const scenes = input.scenes.map((scene, index) => normalizeScene(scene, index, runDir));
  return {
    schema: 'fleet.blender-literal-scenes.v1',
    builderVersion: BUILDER_VERSION,
    width,
    height,
    samples,
    transparent: false,
    scenes,
  };
}

function normalizeScene(scene, index, runDir) {
  if (!scene || typeof scene !== 'object' || Array.isArray(scene)) {
    throw new Error(`Blender scene ${index + 1} must be an object`);
  }
  const id = safeSlug(scene.id ?? `scene-${index + 1}`);
  const output = `plates/${String(index + 1).padStart(3, '0')}-${id}.png`;
  resolveRunPath(runDir, output);
  const rawObjects = Array.isArray(scene.objects) ? scene.objects : ['subject'];
  const objects = [...new Set(rawObjects.flatMap(toAllowedObject))].slice(0, 8);
  if (!objects.length) objects.push('subject');
  const camera = ALLOWED_CAMERAS.has(scene.camera) ? scene.camera : 'static';
  const palette = ALLOWED_PALETTES.has(scene.palette) ? scene.palette : 'midnight-gold';
  return {
    id,
    cueIndex: clampInteger(scene.cueIndex ?? index, 0, 59),
    lyric: requiredString(scene.lyric ?? scene.text ?? 'Literal scene', `Blender scene ${index + 1} lyric`).slice(0, 240),
    objects,
    camera,
    palette,
    seed: stableSeed(`${id}:${scene.lyric ?? ''}`),
    output,
  };
}

function toAllowedObject(value) {
  const text = String(value ?? '').toLowerCase();
  const direct = safeSlug(text);
  if (ALLOWED_OBJECTS.has(direct)) return [direct];
  const mapped = [];
  for (const object of ALLOWED_OBJECTS) {
    if (text.includes(object) || (object === 'traveller' && text.includes('traveler'))) mapped.push(object);
  }
  return mapped;
}

function resolveRunPath(runDir, relativePath) {
  if (typeof relativePath !== 'string' || path.isAbsolute(relativePath)) {
    throw new Error('Blender output path must be relative to the run directory');
  }
  const resolved = path.resolve(runDir, relativePath);
  if (resolved !== runDir && !resolved.startsWith(`${runDir}${path.sep}`)) {
    throw new Error('Blender output path escapes the run directory');
  }
  return resolved;
}

function stableSeed(value) {
  return Number.parseInt(sha256(String(value)).slice(0, 8), 16);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function safeSlug(value) {
  const slug = String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) throw new Error('Blender scene id must contain letters or numbers');
  return slug.slice(0, 80);
}

function clampInteger(value, minimum, maximum) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new Error(`Blender manifest value must be an integer from ${minimum} to ${maximum}`);
  }
  return number;
}

function requiredString(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required`);
  return value.trim();
}

function sanitizeLog(value) {
  return String(value ?? '').replaceAll(process.cwd(), '<repo>').slice(-8000);
}

function sanitizeProcessError(error) {
  return sanitizeLog(error?.stderr || error?.stdout || error?.message || error).replace(/\s+/g, ' ').trim();
}

async function defaultCommandRunner(binary, args, options) {
  return execFileAsync(binary, args, { ...options, shell: false });
}
