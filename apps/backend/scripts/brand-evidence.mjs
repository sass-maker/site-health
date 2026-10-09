#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { analyzeAnswer } from '../lib/brand-evidence/analysis.mjs';
import {
  applyTransfer,
  listTransferBatches,
  openMentionPilotExport,
  planTransfer,
  revertTransfer,
  verifyTransfer,
} from '../lib/brand-evidence/mentionpilot-transfer.mjs';
import { assertKnownProject, dueProjects, runApiModelCheck } from '../lib/brand-evidence/runner.mjs';
import { BrandEvidenceStore, defaultBrandEvidencePath } from '../lib/brand-evidence/store.mjs';
import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';

const CAPTURE_SCHEMA = 'site-health.brand-evidence-captures.v1';

function usage() {
  console.log(`Site Health brand evidence (private, local)

Usage:
  brand-evidence.mjs profiles
  brand-evidence.mjs profile <project> [--input profile.json]
  brand-evidence.mjs prompt <project> <prompt text> [--category <name>]
  brand-evidence.mjs check <project>
  brand-evidence.mjs due [--run]
  brand-evidence.mjs capture <project> --input captures.json
  brand-evidence.mjs transfer plan   --export <mentionpilot-d1.sql> --mapping <mapping.json>
  brand-evidence.mjs transfer apply  --export <mentionpilot-d1.sql> --mapping <mapping.json>
  brand-evidence.mjs transfer verify --export <mentionpilot-d1.sql> --batch <batch-id>
  brand-evidence.mjs transfer revert --batch <batch-id>
  brand-evidence.mjs transfer batches

The store defaults to:
  ${defaultBrandEvidencePath()}
Override it with SITE_HEALTH_BRAND_EVIDENCE_DB. API model checks read
AI_GATEWAY_API_KEY (free-ai gateway) from the environment at run time.
Keep exports, mappings and captures outside Git: they hold raw evidence and,
for exports, credentials that this tool deliberately never copies.`);
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    input: { type: 'string' },
    export: { type: 'string' },
    mapping: { type: 'string' },
    batch: { type: 'string' },
    category: { type: 'string' },
    run: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});
const [command, ...args] = positionals;
if (!command || values.help) {
  usage();
  process.exit(0);
}

const readJson = (path) => JSON.parse(readFileSync(resolve(path), 'utf8'));
const print = (value) => console.log(JSON.stringify(value, null, 2));
const store = new BrandEvidenceStore({
  databasePath: process.env.SITE_HEALTH_BRAND_EVIDENCE_DB || defaultBrandEvidencePath(),
});
const projects = () => loadDashboardProjects();

try {
  if (command === 'profiles') {
    print(store.listProfiles());
  } else if (command === 'profile') {
    const [projectId] = args;
    assertKnownProject(projectId, projects());
    print(values.input ? store.saveProfile(projectId, readJson(values.input)) : store.getProfile(projectId));
  } else if (command === 'prompt') {
    const [projectId, ...words] = args;
    assertKnownProject(projectId, projects());
    print(store.addPrompt(projectId, words.join(' '), { category: values.category ?? null }));
  } else if (command === 'check') {
    const [projectId] = args;
    assertKnownProject(projectId, projects());
    print(await runApiModelCheck({ store, projectId, trigger: 'manual' }));
  } else if (command === 'due') {
    const due = dueProjects(store);
    if (!values.run) {
      print({ due });
    } else {
      const results = [];
      for (const projectId of due) {
        results.push({ projectId, ...(await runApiModelCheck({ store, projectId, trigger: 'scheduled' })) });
      }
      print({ due, results });
    }
  } else if (command === 'capture') {
    const [projectId] = args;
    assertKnownProject(projectId, projects());
    const profile = store.getProfile(projectId);
    if (!profile) throw new Error(`Save a brand profile for ${projectId} first`);
    const bundle = readJson(values.input ?? '');
    if (bundle?.schema !== CAPTURE_SCHEMA || !Array.isArray(bundle.observations)) {
      throw new Error(`captures must use ${CAPTURE_SCHEMA}`);
    }
    // Consumer-assistant answers captured from provider web UIs. They are
    // recorded on their own channel and never blended with API model checks.
    const recorded = store.transaction(() => bundle.observations.map((capture) => store.recordObservation({
      projectId,
      channel: 'consumer-assistant',
      provider: capture.provider,
      model: capture.model ?? 'consumer-ui',
      promptText: capture.promptText,
      status: capture.status,
      answerText: capture.answerText,
      errorMessage: capture.errorMessage,
      observedAt: capture.observedAt,
      analysis: capture.status === 'completed'
        ? analyzeAnswer(capture.answerText, {
            brandName: profile.brandName,
            aliases: profile.aliases,
            brandUrl: profile.brandUrl,
            competitors: profile.competitors,
          })
        : undefined,
    }).id));
    print({ projectId, recorded: recorded.length });
  } else if (command === 'transfer') {
    const [action] = args;
    if (action === 'batches') {
      print(listTransferBatches(store));
    } else if (action === 'revert') {
      if (!values.batch) throw new Error('transfer revert requires --batch');
      print(revertTransfer({ store, batchId: values.batch }));
    } else if (['plan', 'apply', 'verify'].includes(action)) {
      if (!values.export) throw new Error(`transfer ${action} requires --export`);
      const source = openMentionPilotExport(resolve(values.export));
      try {
        if (action === 'verify') {
          if (!values.batch) throw new Error('transfer verify requires --batch');
          const result = verifyTransfer({ store, source, batchId: values.batch });
          print(result);
          if (!result.verified) process.exitCode = 1;
        } else {
          if (!values.mapping) throw new Error(`transfer ${action} requires --mapping`);
          const run = action === 'plan' ? planTransfer : applyTransfer;
          print(run({
            store,
            source,
            mapping: readJson(values.mapping),
            knownProjectIds: projects().map((project) => project.id),
          }));
        }
      } finally {
        source.database.close();
      }
    } else {
      throw new Error(`unknown transfer action: ${action ?? '(none)'}`);
    }
  } else {
    usage();
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  store.close();
}
