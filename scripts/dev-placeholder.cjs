#!/usr/bin/env node
// Minimal placeholder server for monorepo preview.
// Real apps live in Frontend_GZV/ and Backend_GZV/.
const http = require("http");

const args = process.argv.slice(2);
let port = Number(process.env.PORT || 8080);
const portIndex = args.indexOf("--port");
if (portIndex !== -1 && args[portIndex + 1]) {
  port = Number(args[portIndex + 1]);
}

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>GZV Monorepo</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.6;color:#172033}
    code{background:#f3f4f6;padding:2px 6px;border-radius:4px}
    pre{background:#0f172a;color:#e5e7eb;padding:16px;border-radius:8px;overflow:auto}
    h1{color:#082f57}
    a{color:#0c3c78;font-weight:700}
  </style>
</head>
<body>
  <h1>GZV Monorepo</h1>
  <p>This repository contains two Next.js apps:</p>
  <ul>
    <li><b>Frontend_GZV/</b> - public website (<code>gzv.one</code>)</li>
    <li><b>Backend_GZV/</b> - admin CMS + REST API (<code>api.gzv.one</code>)</li>
  </ul>
  <p>Run them separately:</p>
  <pre><code>cd Frontend_GZV
pnpm dev -- --hostname 127.0.0.1 --port 3000

cd Backend_GZV
pnpm dev -- --hostname 127.0.0.1 --port 3001</code></pre>
  <p>Or open the apps if they are already running:</p>
  <ul>
    <li><a href="http://127.0.0.1:3000">Frontend: http://127.0.0.1:3000</a></li>
    <li><a href="http://127.0.0.1:3001/admin/site-content">Admin: http://127.0.0.1:3001/admin/site-content</a></li>
  </ul>
</body>
</html>`;

const server = http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
});

function listen(nextPort, attemptsLeft = 20) {
  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
      const fallbackPort = nextPort + 1;
      console.warn(`Port ${nextPort} is busy, trying ${fallbackPort}...`);
      listen(fallbackPort, attemptsLeft - 1);
      return;
    }
    throw error;
  });

  server.listen(nextPort, () => {
    const address = server.address();
    const actualPort = typeof address === "object" && address ? address.port : nextPort;
    console.log(`GZV placeholder listening on http://localhost:${actualPort}`);
  });
}

listen(port);
