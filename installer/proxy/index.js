export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors() });
    const target = request.headers.get('X-Target-Url') || request.headers.get('X-GitHub-Url');
    if (!target) return j({ error: 'Missing X-Target-Url or X-GitHub-Url header' }, 400);
    const h = new Headers();
    for (const [k, v] of request.headers) {
      if (k === 'x-target-url' || k === 'x-github-url' || k === 'host') continue;
      h.set(k, v);
    }
    try {
      const r = await fetch(target, { method: request.method, headers: h, body: request.body });
      const rh = new Headers(r.headers);
      for (const [k, v] of Object.entries(cors())) rh.set(k, v);
      return new Response(r.body, { status: r.status, headers: rh });
    } catch (e) {
      return j({ error: e.message }, 502);
    }
  }
};
function cors() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': '*' };
}
function j(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...cors() } });
}
