const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const root = path.resolve(__dirname,'..')
const r = createRequire(path.join(root,'Frontend_GZV/package.json'))
const ts = r('typescript')
function load(file, mocks={}) {
  const source = fs.readFileSync(path.join(root,file),'utf8')
  const js = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText
  const exports={}
  new Function('require','exports',js)(name => {
    if (name in mocks) return mocks[name]
    if (name.startsWith('.')) return load(path.relative(root,path.resolve(root,path.dirname(file),name+'.ts')),mocks)
    return r(name)
  },exports)
  return exports
}
;(async () => {
  const { NextRequest,NextResponse } = r('next/server')
  const { isMediaPath }=load('shared/data/media-path.ts')
  for (const folder of ['../outside','/absolute','C:/private','a\\b','a/../b','a//b','a/%2e%2e/b','a/*']) assert.equal(isMediaPath(folder),false,folder)
  assert.equal(isMediaPath('site/pages'),true)
  assert.equal(isMediaPath('uploads'),true)
  let verifiedHeaders,role='user',authenticated=false
  const auth=load('Backend_GZV/lib/api-auth.ts',{'@supabase/supabase-js':{createClient:(_url,_key,options)=>{
    verifiedHeaders=options.global.headers
    return {auth:{getUser:async()=>({data:{user:authenticated?{id:'actor',email:'test@example.com'}:null},error:null})},from:()=>({select:()=>({eq:()=>({single:async()=>({data:{role},error:null})})})})}
  }}})
  const request=new NextRequest('http://localhost/api/images',{headers:{Authorization:'Bearer valid-token'}})
  assert.equal((await auth.requireRole(request,['admin'])).status,401)
  authenticated=true
  assert.equal((await auth.requireRole(request,['admin'])).status,403)
  role='admin'
  assert.equal((await auth.requireRole(request,['admin'])).role,'admin')
  assert.equal(verifiedHeaders.Authorization,'Bearer valid-token')
  let providerCalls=0
  const failProvider=()=>{providerCalls++;throw new Error('Provider should not run')}
  const mocks={
    '@/lib/api-auth':{requireRole:async()=>NextResponse.json({error:'Unauthorized'},{status:401})},
    '@/lib/supabase-storage':{uploadFile:failProvider,uploadFiles:failProvider,listFiles:failProvider,deleteFile:failProvider,getPublicUrl:failProvider},
    '@supabase/supabase-js':{createClient:failProvider},
    cloudinary:{v2:{config:()=>{},api:new Proxy({},{get:()=>failProvider}),uploader:new Proxy({},{get:()=>failProvider})}},
  }
  const files=['route.ts','upload/route.ts','folders/route.ts','stats/route.ts','test/route.ts','[publicId]/route.ts']
  let denied=0
  for (const file of files) {
    const route=load('Backend_GZV/app/api/images/'+file,mocks)
    for (const method of ['GET','POST','PUT','PATCH','DELETE']) if (route[method]) {
      const result=await route[method](new NextRequest('http://localhost/api/images',{method}),{params:{publicId:'asset'}})
      assert.equal(result.status,401,`${file} ${method}`);denied++
    }
  }
  assert.equal(providerCalls,0)
  mocks['@/lib/api-auth']={requireRole:async()=>({id:'actor',role:'admin'})}
  const media=load('Backend_GZV/app/api/images/route.ts',mocks)
  assert.equal((await media.GET(new NextRequest('http://localhost/api/images?folder=../private'))).status,400)
  assert.equal(providerCalls,0)
  const { safeHtml }=load('Frontend_GZV/lib/safe-html.ts')
  const cleaned=safeHtml('<p style="text-align:center;position:fixed">Hello <b>World</b></p><script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(1)"><a href="javascript:alert(1)">bad</a><a href="https://example.com" target="_blank">good</a>')
  assert.ok(cleaned.includes('<b>World</b>'))
  assert.ok(cleaned.includes('text-align:center'))
  assert.ok(!/script|onerror|javascript:|position:fixed/.test(cleaned))
  assert.ok(cleaned.includes('noopener noreferrer'))
  const {contactInput,readContactBody,acceptContactAttempt}=load('Frontend_GZV/lib/contact-input.ts')
  assert.equal(contactInput.safeParse({name:'A',email:'bad',message:'Hi'}).success,false)
  assert.equal(contactInput.safeParse({name:'A',email:'a@example.com',message:'Hi',data:{unsafe:{nested:true}}}).success,false)
  assert.deepEqual(await readContactBody(new Request('http://localhost',{method:'POST',body:'{"name":"A"}'})),{name:'A'})
  await assert.rejects(readContactBody(new Request('http://localhost',{method:'POST',body:'x'.repeat(40000)})),RangeError)
  for(let i=0;i<5;i++) assert.equal(acceptContactAttempt('same-client',1000),true)
  assert.equal(acceptContactAttempt('same-client',1000),false)
  assert.equal(acceptContactAttempt('same-client',62000),true)
  const {createRefreshQueue}=load('shared/data/refresh-queue.ts')
  let loads=0,release
  const queue=createRefreshQueue(async()=>{loads++;await new Promise(resolve=>{release=resolve})},5)
  for(let i=0;i<40;i++)queue.schedule()
  await new Promise(resolve=>setTimeout(resolve,20));assert.equal(loads,1)
  for(let i=0;i<40;i++)queue.schedule()
  release();await new Promise(resolve=>setTimeout(resolve,20));assert.equal(loads,2)
  queue.dispose();release();await new Promise(resolve=>setTimeout(resolve,10));assert.equal(loads,2)
  // Card catalog must not truncate at a server page, and mounted sections share reads.
  let catalogReads=0
  const people=Array.from({length:260},(_,id)=>({id:String(id),slug:'person-'+id,full_name:'Person '+id,avatar_url:'https://example.com/avatar.webp'}))
  const fakeCatalog={
    from:table=>{
      const query={select:fields=>{assert.ok(!fields.includes('cv_settings'));return query},eq:()=>query,order:()=>query,
        range:async(from,to)=>{catalogReads++;return {data:(table==='gzvers'?people:[]).slice(from,to+1),error:null}}}
      return query
    },
  }
  process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.test'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='test-public'
  const catalog=load('Frontend_GZV/lib/api-supabase.ts',{'@supabase/ssr':{createBrowserClient:()=>fakeCatalog},'./public-fetch-cache':{cachedPublicFetch:fetch}})
  const lists=await Promise.all(Array.from({length:40},()=>catalog.api.getGzvers()))
  assert.equal(lists[0].length,260)
  assert.equal(catalogReads,3)
  catalog.invalidateGzverList()
  await catalog.api.getGzvers();assert.equal(catalogReads,6)
  console.log(`PASS: ${denied} media handlers reject guests before provider calls, role/JWT isolation, path traversal rejection, HTML safety, bounded contact payloads/rate limits, burst coalescing and cleanup`)
})().catch(e=>{console.error(e);process.exitCode=1})
