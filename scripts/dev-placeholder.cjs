#!/usr/bin/env node
// Minimal placeholder server for Lovable preview.
// Real apps live in Frontend_gzv/ and Backend_gzv/ — run `pnpm dev` inside those.
const http = require('http');
const args = process.argv.slice(2);
let port = process.env.PORT || 8080;
const i = args.indexOf('--port');
if (i !== -1 && args[i + 1]) port = args[i + 1];

const html = `<!doctype html><html><head><meta charset="utf-8"><title>gzv Monorepo</title>
<style>body{font-family:system-ui;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.6;color:#222}
code{background:#f3f4f6;padding:2px 6px;border-radius:4px}h1{color:#0f766e}</style></head><body>
<h1>🎓 gzv Monorepo</h1>
<p>This repository contains two Next.js apps:</p>
<ul>
  <li><b>Frontend_gzv/</b> — public website (<code>gzv.one</code>)</li>
  <li><b>Backend_gzv/</b> — admin CMS + REST API (<code>api.gzv.one</code>)</li>
</ul>
<p>Run them separately:</p>
<pre><code>cd Frontend_gzv && pnpm install && pnpm dev
cd Backend_gzv  && pnpm install && pnpm dev -p 3001</code></pre>
<p>See <code>README.md</code> for full setup.</p>
</body></html>`;

http.createServer((_, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}).listen(port, () => console.log('gzv placeholder listening on ' + port));
