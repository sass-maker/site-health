import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, realpath, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const MAX_RECORDING_BYTES = 25 * 1024 * 1024;
const MIME_EXTENSIONS = new Map([
  ['audio/webm', '.webm'],
  ['audio/mp4', '.m4a'],
  ['audio/ogg', '.ogg'],
  ['audio/wav', '.wav'],
  ['audio/x-wav', '.wav'],
]);

export async function saveVoiceRecording(input = {}, options = {}) {
  const encoded = requiredString(input.audioBase64, 'audioBase64').replace(/^data:[^;]+;base64,/, '');
  const bytes = Buffer.from(encoded, 'base64');
  if (!bytes.length) throw new Error('voice recording is empty');
  if (bytes.length > MAX_RECORDING_BYTES) throw new Error('voice recording exceeds 25 MB');
  const mimeType = String(input.mimeType ?? '').split(';')[0].trim().toLowerCase();
  const extension = MIME_EXTENSIONS.get(mimeType);
  if (!extension) throw new Error(`unsupported voice recording type: ${mimeType || 'unknown'}`);
  const root = path.resolve(options.artifactDir ?? './artifacts/studio-voice');
  await mkdir(root, { recursive: true });
  const now = options.now?.() ?? new Date();
  const id = `voice_${now.toISOString().replace(/\D/g, '').slice(0, 14)}_${createHash('sha256').update(bytes).digest('hex').slice(0, 10)}`;
  const recordingPath = path.join(root, `${id}${extension}`);
  await writeFile(recordingPath, bytes, { flag: 'wx' }).catch(async (error) => {
    if (error.code !== 'EEXIST') throw error;
  });
  return {
    id,
    recordingPath,
    mimeType,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    capturedAt: now.toISOString(),
  };
}

export async function probeVoiceTranscription(options = {}) {
  const providers = [];
  const commandRunner = options.commandRunner ?? defaultCommandRunner;
  const uvBinary = await commandPath('uv', commandRunner);
  const whisperKitModel = options.whisperKitModelPath ? path.resolve(options.whisperKitModelPath) : null;
  const whisperKitBinary = await commandPath('whisperkit-cli', commandRunner);
  if (uvBinary && whisperKitBinary && whisperKitModel && await exists(whisperKitModel)) {
    providers.push({ id: 'whisperkit', ready: true, binary: whisperKitBinary, runnerBinary: uvBinary, modelPath: whisperKitModel });
  }

  const mlxModelPath = path.resolve(options.mlxModelPath ?? path.join(
    os.homedir(), '.cache/huggingface/hub/models--mlx-community--whisper-small.en-mlx',
  ));
  let mlxPackageReady = options.mlxPackageReady === true;
  if (!mlxPackageReady && uvBinary) {
    try {
      await commandRunner(uvBinary, [
        'run', '--project', path.resolve(options.editorialDir ?? './editorial'), '--no-sync',
        'python', '-c', 'import mlx_whisper',
      ], { timeout: 20_000 });
      mlxPackageReady = true;
    } catch {
      mlxPackageReady = false;
    }
  }
  if (uvBinary && mlxPackageReady && await exists(mlxModelPath)) {
    providers.push({ id: 'mlx-whisper', ready: true, binary: uvBinary, runnerBinary: uvBinary, modelPath: mlxModelPath });
  }

  return providers.length
    ? { ready: true, provider: providers[0], providers, blocker: null }
    : {
        ready: false,
        provider: null,
        providers: [],
        blocker: 'No fully local transcription runtime and model are ready. The recording is preserved; type the request or preflight WhisperKit/MLX Whisper separately.',
      };
}

export async function transcribeVoiceRecording(recording, options = {}) {
  const recordingPath = path.resolve(requiredString(recording?.recordingPath, 'recordingPath'));
  const roots = (options.artifactRoots ?? [options.artifactDir ?? './artifacts/studio-voice']).map((root) => path.resolve(root));
  const resolved = await realpath(recordingPath).catch(() => null);
  if (!resolved) throw new Error(`voice recording is missing: ${recordingPath}`);
  const resolvedRoots = await Promise.all(roots.map((root) => realpath(root).catch(() => root)));
  if (!resolvedRoots.some((root) => resolved === root || resolved.startsWith(`${root}${path.sep}`))) {
    throw new Error('voice recording must be inside an approved local artifact root');
  }
  const readiness = options.readiness ?? await probeVoiceTranscription(options);
  if (!readiness.ready) throw new Error(readiness.blocker);
  if (typeof options.providerRunner === 'function') {
    const result = await options.providerRunner({ recordingPath: resolved, provider: readiness.provider });
    return normalizeTranscriptionResult(result, recording, readiness.provider);
  }
  const outPath = `${resolved}.srt`;
  const provider = readiness.provider;
  const backend = provider.id === 'whisperkit' ? 'whisperkit' : 'mlx';
  const modelArgument = provider.id === 'whisperkit' ? '' : provider.modelPath;
  const whisperKitArgument = provider.id === 'whisperkit' ? provider.modelPath : '';
  const python = [
    'from pathlib import Path',
    'import sys',
    'from mashup.ingest.transcribe import transcribe',
    'transcribe(Path(sys.argv[1]), Path(sys.argv[2]), model=sys.argv[3] or "mlx-community/whisper-small.en-mlx", backend=sys.argv[4], whisperkit_model=sys.argv[5] or None)',
  ].join('; ');
  await (options.commandRunner ?? defaultCommandRunner)(provider.runnerBinary ?? provider.binary, [
    'run', '--project', path.resolve(options.editorialDir ?? './editorial'), '--no-sync',
    'python', '-c', python, resolved, outPath, modelArgument, backend, whisperKitArgument,
  ], { timeout: options.timeoutMs ?? 10 * 60_000 });
  const srt = await readFile(outPath, 'utf8');
  const cues = parseSrt(srt);
  return normalizeTranscriptionResult({ transcript: cues.map((cue) => cue.text).join(' '), cues, srtPath: outPath }, recording, provider);
}

export function parseSrt(value) {
  return String(value ?? '').trim().split(/\n\s*\n/).map((block) => {
    const lines = block.split(/\r?\n/);
    const timingIndex = lines.findIndex((line) => line.includes('-->'));
    if (timingIndex < 0) return null;
    const [start, end] = lines[timingIndex].split('-->').map((stamp) => stamp.trim());
    const text = lines.slice(timingIndex + 1).join(' ').replace(/<[^>]+>/g, '').trim();
    return text ? { start, end, text } : null;
  }).filter(Boolean);
}

function normalizeTranscriptionResult(input = {}, recording, provider) {
  const transcript = requiredString(input.transcript, 'transcript');
  return {
    transcript,
    cues: Array.isArray(input.cues) ? structuredClone(input.cues) : [],
    recording: structuredClone(recording),
    evidence: {
      provider: provider.id,
      modelPath: provider.modelPath,
      srtPath: input.srtPath ?? null,
      localOnly: true,
    },
  };
}

async function commandPath(command, runner) {
  try {
    const result = await runner('which', [command], { timeout: 5_000 });
    return String(result.stdout ?? '').trim() || null;
  } catch {
    return null;
  }
}

async function exists(candidate) {
  try {
    const info = await stat(candidate);
    return info.isFile() || info.isDirectory();
  } catch {
    return false;
  }
}

async function defaultCommandRunner(binary, args, options = {}) {
  return execFileAsync(binary, args, { timeout: options.timeout ?? 60_000, maxBuffer: 4 * 1024 * 1024 });
}

function requiredString(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required`);
  return value.trim();
}
