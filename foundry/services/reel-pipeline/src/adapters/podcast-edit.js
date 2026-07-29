import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdir,
  readFile,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import { normalizePodcastEdit } from '../podcast-edit.js';

const execFileAsync = promisify(execFile);

function slug(value) {
  return String(value)
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')
    .slice(0, 64) || 'podcast-edit';
}

function timestamp(date) {
  return date.toISOString().replaceAll(/[:.]/g, '-');
}

async function sha256File(filePath) {
  return createHash('sha256').update(await readFile(filePath)).digest('hex');
}

async function allocateRunDirectory(outputRoot, stem) {
  await mkdir(outputRoot, { recursive: true });
  for (let attempt = 1; attempt <= 999; attempt += 1) {
    const suffix = attempt === 1 ? '' : `-${String(attempt).padStart(2, '0')}`;
    const candidate = path.join(outputRoot, `${stem}${suffix}`);
    try {
      await mkdir(candidate);
      return candidate;
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
    }
  }
  throw new Error(`could not allocate podcast render directory under ${outputRoot}`);
}

function resolveLocalPath(value, baseDirectory) {
  return path.isAbsolute(value) ? value : path.resolve(baseDirectory, value);
}

function resolveEditPaths(edit, manifestPath) {
  const baseDirectory = manifestPath ? path.dirname(path.resolve(manifestPath)) : process.cwd();
  const resolved = structuredClone(edit);
  const sourcePaths = new Map();
  resolved.sources = resolved.sources.map((source) => {
    const sourcePath = resolveLocalPath(source.path, baseDirectory);
    sourcePaths.set(source.id, sourcePath);
    return { ...source, path: sourcePath };
  });
  resolved.editorial.clips = resolved.editorial.clips.map((clip) => ({
    ...clip,
    source_path: sourcePaths.get(clip.source_id),
    visuals: clip.visuals.map((visual) => ({
      ...visual,
      source_path: resolveLocalPath(visual.source_path, baseDirectory),
    })),
  }));
  return resolved;
}

async function verifyLocalInputs(edit) {
  const sources = [];
  for (const source of edit.sources) {
    const info = await stat(source.path).catch(() => null);
    if (!info?.isFile() || info.size === 0) {
      throw new Error(`podcast source is missing or empty: ${source.path}`);
    }
    const actualSha256 = await sha256File(source.path);
    if (source.sha256 && source.sha256 !== actualSha256) {
      throw new Error(`podcast source hash does not match provenance: ${source.id}`);
    }
    sources.push({
      id: source.id,
      title: source.title,
      path: source.path,
      bytes: info.size,
      sha256: actualSha256,
      sourceUrl: source.sourceUrl,
      license: source.license,
      licenseUrl: source.licenseUrl,
    });
  }
  for (const clip of edit.editorial.clips) {
    for (const visual of clip.visuals) {
      const info = await stat(visual.source_path).catch(() => null);
      if (!info?.isFile() || info.size === 0) {
        throw new Error(`podcast visual is missing or empty: ${visual.source_path}`);
      }
    }
  }
  return sources;
}

export async function renderPodcastEdit({
  input,
  manifestPath = null,
  repoRoot = path.resolve('.'),
  editorialRoot = path.join(repoRoot, 'editorial'),
  outputRoot = path.join(repoRoot, '.reel-pipeline', 'podcast-edits'),
  workdir = path.join(repoRoot, '.reel-pipeline', 'editorial'),
  uvPath = 'uv',
  runCommand = execFileAsync,
  now = () => new Date(),
}) {
  const normalized = normalizePodcastEdit(input);
  if (normalized.approval.status !== 'approved') {
    throw new Error('podcast edit must be approved before rendering');
  }
  const edit = resolveEditPaths(normalized, manifestPath);
  const sourceEvidence = await verifyLocalInputs(edit);
  const runDir = await allocateRunDirectory(
    path.resolve(outputRoot),
    `${slug(edit.id)}-${timestamp(now())}`,
  );
  const paths = {
    contract: path.join(runDir, 'podcast-edit.json'),
    edl: path.join(runDir, 'edl.json'),
    video: path.join(runDir, 'podcast-edit.mp4'),
    captions: path.join(runDir, 'podcast-edit.srt'),
    receipt: path.join(runDir, 'receipt.json'),
  };

  const contractBytes = `${JSON.stringify(edit, null, 2)}\n`;
  await writeFile(paths.contract, contractBytes);
  await writeFile(paths.edl, `${JSON.stringify(edit.editorial, null, 2)}\n`);

  const args = [
    'run',
    '--project',
    path.resolve(editorialRoot),
    'mashup',
    'render',
    paths.edl,
    '--output',
    paths.video,
    '--workdir',
    path.resolve(workdir),
    '--subtitles',
    edit.presentation.subtitles,
    edit.presentation.sourceHeading ? '--source-label' : '--no-source-label',
    edit.presentation.watermark ? '--watermark' : '--no-watermark',
    '--watermark-text',
    edit.presentation.watermarkText,
  ];
  await runCommand(uvPath, args, {
    cwd: path.resolve(repoRoot),
    maxBuffer: 1024 * 1024 * 16,
  });

  const videoInfo = await stat(paths.video).catch(() => null);
  if (!videoInfo?.isFile() || videoInfo.size === 0) {
    throw new Error('podcast renderer completed without a playable artifact');
  }
  const captionInfo = await stat(paths.captions).catch(() => null);
  const receipt = {
    schema: 'reel-pipeline.podcast-render-receipt.v1',
    editId: edit.id,
    revision: edit.revision,
    generatedAt: now().toISOString(),
    renderer: {
      id: 'editorial/mashup',
      contract: edit.schema,
    },
    approval: edit.approval,
    input: {
      path: paths.contract,
      sha256: createHash('sha256').update(contractBytes).digest('hex'),
      sources: sourceEvidence,
    },
    output: {
      video: {
        path: paths.video,
        bytes: videoInfo.size,
        sha256: await sha256File(paths.video),
      },
      captions: captionInfo?.isFile()
        ? {
          path: paths.captions,
          bytes: captionInfo.size,
          sha256: await sha256File(paths.captions),
        }
        : null,
    },
  };
  await writeFile(paths.receipt, `${JSON.stringify(receipt, null, 2)}\n`);
  return { edit, paths, receipt, runDir };
}
