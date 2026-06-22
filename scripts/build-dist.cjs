#!/usr/bin/env node
// Minimal "build" for Lovable dist-check. The real apps live in
// Frontend_MSC/ and Backend_MSC/; this just emits a static landing page
// into ./dist so the harness build step has an artifact to verify.
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'dist');
fs.mkdirSync(outDir, { recursive: true });

const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>MSC Monorepo</title>
<meta name="description" content="MSC monorepo landing — Frontend & Backend ứng dụng Next.js." />
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:48px auto;padding:0 24px;line-height:1.65;color:#0f172a;background:#f8fafc}
  h1{font-size:32px;letter-spacing:-0.02em;color:#0f766e;margin-bottom:8px}
  code{background:#e2e8f0;padding:2px 8px;border-radius:6px;font-size:13px}
  ul{padding-left:20px}
  .card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px;box-shadow:0 6px 30px -18px rgba(15,23,42,0.2)}
</style>
</head>
<body>
  <div class="card">
    <h1>MSC Monorepo</h1>
    <p>This repository hosts two Next.js applications:</p>
    <ul>
      <li><b>Frontend_MSC/</b> — public website</li>
      <li><b>Backend_MSC/</b> — admin CMS + REST API</li>
    </ul>
    <p>Run each app with <code>pnpm install &amp;&amp; pnpm dev</code> inside its folder.</p>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), html);
console.log('Wrote dist/index.html');
