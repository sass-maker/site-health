import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {emptyReadinessState}from '../lib/dashboard-backend/readiness-model.mjs';
import { createWeeklyReview } from '../lib/dashboard-backend/weekly-review.mjs';

test('weekly review keeps a fixed prior-week baseline across repeated current-week collections', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'site-health-weekly-')), 'weekly.json');
  const projects = [{ id: 'one', name: 'One', lifecycle: { status: 'active' }, status: 'active' }];
  const store = { rebuildProjections: () => ({ projects, readiness: {} }) };
  const first = createWeeklyReview({ store, path, now: '2026-10-20T00:00:00Z' });
  assert.equal(first.baseline, null);
  const second = createWeeklyReview({ store, path, now: '2026-10-27T00:00:00Z' });
  assert.equal(second.week, '2026-10-26'); assert.equal(second.baseline[0].id, 'one');
  const third = createWeeklyReview({ store, path, now: '2026-10-28T00:00:00Z' });
  assert.deepEqual(third.baseline, second.baseline);
  assert.equal(JSON.parse(readFileSync(path)).counts.currentProducts, 1);
});

test('weekly review counts individual checklist assessments without any legacy gates',()=>{
 const path=join(mkdtempSync(join(tmpdir(),'site-health-item-weekly-')),'weekly.json');
 const projects=[{id:'one',name:'One',lifecycle:{status:'active'}}];
 const state=emptyReadinessState();state.checklist={'product-speed':{status:'in-progress',note:'Paired lab runs retained',completion:50,confidence:'medium',evidenceRefs:[{ref:'report:psi',observedAt:'2026-10-27T00:00:00Z'}]}};
 const store={rebuildProjections:()=>({projects,readiness:{one:{revision:1,state,updatedAt:'2026-10-27T00:00:00Z'}}})};
 assert.equal(createWeeklyReview({store,path,now:'2026-10-28T00:00:00Z'}).counts.assessedProducts,1);
});
