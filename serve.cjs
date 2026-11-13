'use strict';
// Server berkas statis lokal; tidak menyediakan API atau autentikasi backend.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = new Map([
  ['/', ['index.html', 'text/html']],
  ...['index.html', 'login.html', 'atasan.html', 'pemohon.html', 'hr.html', 'finance.html'].map((name) => ['/' + name, [name, 'text/html']]),
  ['/assets/portal.css', ['assets/portal.css', 'text/css']],
  ['/assets/portal.js', ['assets/portal.js', 'text/javascript']]
]);
function createServer() {
  return http.createServer((request, response) => {
    let pathname;
    try { pathname = new URL(request.url, 'http://localhost').pathname; }
    catch { response.writeHead(400); response.end('Permintaan tidak valid.'); return; }
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return; }
    const target = files.get(pathname);
    if (!target) { response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); response.end('Halaman tidak ditemukan.'); return; }
    fs.readFile(path.join(__dirname, target[0]), (error, contents) => {
      if (error) { response.writeHead(500); response.end('Berkas tidak dapat dibaca.'); return; }
      response.writeHead(200, { 'Content-Type': target[1] + '; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? undefined : contents);
    });
  });
}
module.exports = { createServer };
if (require.main === module) {
  const port = Number(process.env.PORT || 8080);
  if (!Number.isInteger(port) || port < 1 || port > 65535) { console.error('PORT harus berupa angka antara 1 dan 65535.'); process.exitCode = 1; }
  else {
    const server = createServer();
    server.on('error', (error) => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} sedang dipakai. Pilih PORT lain.` : error.message); process.exitCode = 1; });
    server.listen(port, '127.0.0.1', () => console.log(`Portal Administrasi: http://127.0.0.1:${port}/login.html`));
  }
}
