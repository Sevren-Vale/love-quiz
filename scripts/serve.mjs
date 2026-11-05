import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const types = {html:'text/html',css:'text/css',js:'text/javascript',svg:'image/svg+xml'};
export function makeServer() {
  return http.createServer(async (request,response) => {
    const path = new URL(request.url,'http://localhost').pathname.replace(/^\/love-quiz(?=\/)/,'');
    const file = path === '/' ? 'index.html' : path.slice(1);
    if (!/^(index\.html|css\/[\w-]+\.css|js\/[\w-]+\.js|assets\/icons\/[\w-]+\.svg)$/.test(file)) {
      response.writeHead(404).end('Not found');
      return;
    }
    try {
      const body = await readFile(new URL('../'+file,import.meta.url));
      response.writeHead(200,{'content-type':types[file.split('.').at(-1)]+'; charset=utf-8','cache-control':'no-store'}).end(body);
    } catch { response.writeHead(404).end('Not found'); }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.LOVEQUIZ_PORT || 5500);
  const host = process.env.LOVEQUIZ_HOST || '127.0.0.1';
  makeServer().listen(port,host,()=>console.log('LoveQuiz: http://'+host+':'+port+'/'));
}
