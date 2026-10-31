export const jsonResponse = (status, body) => Response.json(body, { status, headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
export async function readJson(request, maxBytes = 32 * 1024) {
  const length = request.headers.get('content-length');
  if (length && (!/^\d+$/.test(length) || Number(length) > maxBytes)) throw Object.assign(new Error('request body too large'), { statusCode: 413 });
  if (!request.body) return {};
  const reader = request.body.getReader(), chunks = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw Object.assign(new Error('request body too large'), { statusCode: 413 }); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  if (!size) return {};
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw Object.assign(new Error('request body must be valid JSON'), { statusCode: 400 }); }
}
export async function routeResponse(run, request) {
  let result; const headers = new Headers();
  const response = { writableEnded: false, once() {}, off() {}, setHeader(key,value) { headers.set(key,value); } };
  const json = (_response,status,body) => { response.writableEnded=true; result = jsonResponse(status,body); return true; };
  const handled = await run(response, { json, readBody: (_request,maxBytes) => readJson(request,maxBytes) });
  if (!handled) return null;
  if (!result) throw new Error('Route did not produce a response');
  for (const [key,value] of headers) result.headers.set(key,value);
  return result;
}
