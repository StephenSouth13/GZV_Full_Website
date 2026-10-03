const {spawn}=require('node:child_process')
const path=require('node:path')
const root=path.resolve(__dirname,'..')
const mode=process.argv.includes('--production')?'start':'dev'
const children=[]
let stopping=false
function stop(code=0){
  if(stopping)return
  stopping=true
  for(const child of children)child.kill('SIGTERM')
  process.exitCode=code
}
for(const [app,port] of [['Frontend_GZV',3000],['Backend_GZV',3001]]){
  console.log(`${app}: http://127.0.0.1:${port}`)
  const child=spawn(process.execPath,['node_modules/next/dist/bin/next',mode,'--hostname','127.0.0.1','--port',String(port)],{cwd:path.join(root,app),stdio:'inherit'})
  children.push(child)
  child.on('error',error=>{console.error(error.message);stop(1)})
  child.on('exit',code=>{if(!stopping)stop(code||1)})
}
process.on('SIGINT',()=>stop())
process.on('SIGTERM',()=>stop())
