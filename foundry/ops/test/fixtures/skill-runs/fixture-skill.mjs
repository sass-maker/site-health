#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';

const [outputPath, metricsPath, observedAt = '2026-07-29T09:00:00.000Z'] =
  process.argv.slice(2);

if (!outputPath || !metricsPath) {
  process.stderr.write('usage: fixture-skill.mjs <output-path> <metrics-path> [observed-at]\n');
  process.exitCode = 2;
} else {
  await writeFile(outputPath, 'fixture result artifact\n', 'utf8');
  await writeFile(
    metricsPath,
    `${JSON.stringify([
      {
        metricName: 'domain-rank',
        value: 18,
        unit: 'position',
        direction: 'lower-is-better',
        entityKind: 'domain',
        entityId: 'example.com',
        observedAt,
        provenance: { kind: 'fixture-skill', reference: 'domain-rank-check' },
      },
      {
        metricName: 'agent-score',
        value: 8.6,
        unit: 'score/10',
        direction: 'higher-is-better',
        entityKind: 'agent',
        entityId: 'codex',
        observedAt,
        provenance: { kind: 'fixture-skill', reference: 'agent-score-check' },
      },
    ])}\n`,
    'utf8',
  );
  process.stdout.write('fixture stdout\n');
  process.stderr.write('fixture stderr\n');
}
