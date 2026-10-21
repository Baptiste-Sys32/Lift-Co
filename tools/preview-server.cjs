// Dependency-free static preview server. Serve only a prepared release folder.
'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const args=process.argv.slice(2);
function option(name,fallback){const i=args.indexOf(name);return i<0?fallback:args[i+1];}
const root=fs.realpathSync(option('--root',path.resolve(__dirname,'../public-preview')));
const port=Number(option('--port','4000'));
const host=option('--host','127.0.0.1');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'release.json'),'utf8'));
const files=new Map(manifest.files.map(f=>[f.path,f]));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.cjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf','.ttf':'font/ttf','.woff2':'font/woff2','.glb':'model/gltf-binary','.bin':'application/octet-stream'};
const server=http.createServer((req,res)=>{
 const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'SAMEORIGIN'};
 res.setTimeout(30000);
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{...headers,Allow:'GET, HEAD'});res.end();return;}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://preview.local').pathname);}catch{res.writeHead(400,headers);res.end();return;}
 if(pathname==='/healthz'){res.writeHead(200,{...headers,'Content-Type':'application/json','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:JSON.stringify({status:'ok',release:manifest.release}));return;}
 if(pathname==='/favicon.ico'){res.writeHead(204,headers);res.end();return;}
 const relative=pathname==='/'?'index.html':pathname.slice(1);
 const entry=files.get(relative);
 if(!entry||relative.split('/').some(p=>p.startsWith('.')||p==='..')||relative.includes('\\')){res.writeHead(404,{...headers,'Content-Type':'text/plain; charset=utf-8'});res.end(req.method==='HEAD'?undefined:'Not found');return;}
 const gzip=entry.gzip&&/(?:^|,)\s*gzip\s*(?:;\s*q=(?!0(?:\.0*)?(?:\s|,|$))[\d.]+)?\s*(?:,|$)/i.test(req.headers['accept-encoding']||'');
 const filename=path.join(root,relative+(gzip?'.gz':''));
 const tag='"'+entry.sha256+(gzip?'-gzip':'')+'"';
 const response={...headers,'Content-Type':types[path.extname(relative).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache',ETag:tag,Vary:'Accept-Encoding','Content-Length':gzip?entry.gzipSize:entry.size};
 if(gzip)response['Content-Encoding']='gzip';
 if(req.headers['if-none-match']===tag){delete response['Content-Length'];res.writeHead(304,response);res.end();return;}
 const stream=fs.createReadStream(filename);
 stream.on('error',()=>{if(!res.headersSent)res.writeHead(500,headers);res.end();});
 stream.on('open',()=>{res.writeHead(200,response);if(req.method==='HEAD'){stream.destroy();res.end();}else stream.pipe(res);});
 res.on('close',()=>stream.destroy());
});
server.headersTimeout=15000;server.requestTimeout=30000;server.keepAliveTimeout=5000;
server.on('error',error=>{console.error(error.code||'Preview server failed');process.exit(1);});
server.listen(port,host,()=>console.log('Lift Co static preview / '+manifest.release+' / port '+port));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),4000).unref();});
