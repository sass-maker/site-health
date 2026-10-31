import { randomUUID } from 'node:crypto';
import { canonicalJson } from '../lib/store-snapshot.mjs';
const error = (message, statusCode = 409) => Object.assign(new Error(message), { statusCode });
const publicJob = row => row ? { ...JSON.parse(row.input_json), runId:row.id,
  state:row.state==='queued'?'running':row.state, phase:row.state,
  startedAt:row.created_at, finishedAt:row.finished_at, attempts:row.attempts,
  summary:row.summary ?? 'Waiting for the durable collector.', progress:JSON.parse(row.progress_json),
  ...(row.result_json ? {result:JSON.parse(row.result_json)} : {}) } : null;
export class DurableJobs {
  constructor(database,transaction,{now=Date.now,leaseMs=60_000,maxBatchAttempts=3}={}) {
    this.database=database;this.transaction=transaction;this.now=now;this.leaseMs=leaseMs;this.maxBatchAttempts=maxBatchAttempts;
    database.exec(`CREATE TABLE IF NOT EXISTS _cloud_jobs (
      id TEXT PRIMARY KEY,request_key TEXT NOT NULL UNIQUE,input_json TEXT NOT NULL,
      state TEXT NOT NULL CHECK(state IN ('queued','running','succeeded','failed','cancelled','unavailable')),
      created_at TEXT NOT NULL,finished_at TEXT,lease_token TEXT,lease_until INTEGER,
      attempts INTEGER NOT NULL DEFAULT 0,result_json TEXT,summary TEXT,
      progress_json TEXT NOT NULL DEFAULT '{}',claim_offset INTEGER NOT NULL DEFAULT 0,offset_attempts INTEGER NOT NULL DEFAULT 0);
      CREATE INDEX IF NOT EXISTS _cloud_jobs_state ON _cloud_jobs(state,lease_until);`);
    for(const column of ['claim_offset','offset_attempts'])if(!database.prepare('PRAGMA table_info(_cloud_jobs)').all().some(c=>c.name===column))database.exec(`ALTER TABLE _cloud_jobs ADD COLUMN ${column} INTEGER NOT NULL DEFAULT 0`);
    if (!database.prepare('PRAGMA table_info(_cloud_jobs)').all().some(c=>c.name==='progress_json')) database.exec("ALTER TABLE _cloud_jobs ADD COLUMN progress_json TEXT NOT NULL DEFAULT '{}'");
  }
  start(input,requestKey=null,onCreate=()=>{}) {
    if (requestKey!==null && (typeof requestKey!=='string'||!requestKey||requestKey.length>200)) throw error('Invalid idempotency key',400);
    const payload=canonicalJson(input);
    return this.transaction(()=>{
      const existing=requestKey?this.database.prepare('SELECT * FROM _cloud_jobs WHERE request_key=?').get(requestKey):null;
      if(existing){if(existing.input_json!==payload)throw error('Job idempotency conflict');return {...publicJob(existing),duplicate:true};}
      const active=requestKey===null?this.database.prepare("SELECT * FROM _cloud_jobs WHERE input_json=? AND state IN ('queued','running') ORDER BY created_at,id LIMIT 1").get(payload):null;
      if(active)return {...publicJob(active),duplicate:true};
      const id=randomUUID();this.database.prepare("INSERT INTO _cloud_jobs(id,request_key,input_json,state,created_at) VALUES (?,?,?,'queued',?)").run(id,requestKey??id,payload,new Date(this.now()).toISOString());
      const created={...this.get(id),duplicate:false};onCreate(created);return created;
    });
  }
  get(id){return publicJob(this.database.prepare('SELECT * FROM _cloud_jobs WHERE id=?').get(id));}
  claim(onExhausted=()=>{}){return this.transaction(()=>{
    const row=this.database.prepare("SELECT * FROM _cloud_jobs WHERE state='queued' OR (state='running' AND lease_until<=?) ORDER BY created_at,id LIMIT 1").get(this.now());
    if(!row)return null;
    const offset=JSON.parse(row.progress_json).completed??0;
    const retries=row.claim_offset===offset?row.offset_attempts+1:1;
    if(retries>this.maxBatchAttempts){
      this.database.prepare("UPDATE _cloud_jobs SET state='failed',finished_at=?,summary='Collector batch retry budget exhausted; previous evidence retained',lease_token=NULL,lease_until=NULL WHERE id=?").run(new Date(this.now()).toISOString(),row.id);
      const exhausted=this.get(row.id);onExhausted(exhausted);return {exhausted};
    }
    const token=randomUUID();
    this.database.prepare("UPDATE _cloud_jobs SET state='running',lease_token=?,lease_until=?,attempts=attempts+1,claim_offset=?,offset_attempts=? WHERE id=?").run(token,this.now()+this.leaseMs,offset,retries,row.id);
    return {job:this.get(row.id),token};
  });}
  assertLease(id,token){
    const row=this.database.prepare("SELECT * FROM _cloud_jobs WHERE id=? AND state='running' AND lease_token=? AND lease_until>?").get(id,token,this.now());
    if(!row)throw error('Job lease expired or was cancelled');return publicJob(row);
  }
  commit(id,token,work){return this.transaction(()=>{const job=this.assertLease(id,token);const result=work(job);if(result&&typeof result.then==='function')throw new TypeError('Job publication commit must be synchronous');return result;});}
  publish(id,token,progress,{state='queued',result=null,summary='Collecting evidence.'}={},write=()=>{}) {
    if(!['queued','succeeded','failed','unavailable'].includes(state))throw error('Invalid job transition',400);
    return this.commit(id,token,current=>{
      write(current);
      this.database.prepare('UPDATE _cloud_jobs SET state=?,progress_json=?,result_json=?,summary=?,finished_at=?,lease_token=NULL,lease_until=NULL WHERE id=?')
        .run(state,JSON.stringify(progress),JSON.stringify(result),String(summary).slice(0,800),state==='queued'?null:new Date(this.now()).toISOString(),id);
      return this.get(id);
    });
  }
  advance(id,token,progress,options){return this.publish(id,token,progress,options);}
  finish(id,token,options={}){return this.advance(id,token,this.get(id)?.progress??{},{...options,state:options.state??'succeeded'});}
  cancel(id){this.database.prepare("UPDATE _cloud_jobs SET state='cancelled',finished_at=?,lease_token=NULL,lease_until=NULL WHERE id=? AND state IN ('queued','running')").run(new Date(this.now()).toISOString(),id);return this.get(id);}
  nextAlarm(){return this.database.prepare("SELECT MIN(CASE WHEN state='queued' THEN ? ELSE lease_until END) AS at FROM _cloud_jobs WHERE state IN ('queued','running')").get(this.now()).at;}
}
