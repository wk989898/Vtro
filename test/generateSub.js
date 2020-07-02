const str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const number = "0123456789"
const fs=require('fs')

var encode = (subtxt)=>Buffer.from(subtxt).toString('base64')

function generateSub(num) {
  let txt = '',result=[]
  for (let i = 0; i < num; ++i) {
    const {password,ip,port,addr,name}=genNode()
    result.push({password,ip,port,addr,name,addr:'addr',name:'name',allowInsecure:1})
    txt += `trojan://${password}@${ip}:${port}?allowInsecure=1&peer=${addr}#${name}\n`
  }
  fs.writeFileSync('./sub.txt',JSON.stringify(result))
  return encode(txt)
}

function genNode() {
  return {
    password:genRandom(5,str),
    ip:genIP(),
    port:genRandom(2,number),
    addr:'addr',
    name:'name'
  }
}

function genRandom(n,type) {
  let s=""
  let len=random(n)
  for(let i=0;i<len;++i){
    s+=type[random(type.length)-1]
  }
  return s
}
function genIP() {
  let n=0,ip=''
  while (n<4) {
    ip+=genRandom(3,number)+'.'
    n++
  }
  return ip.replace(/\.$/,'')
}
function random(n) {
  const random = Math.random
  const floor = Math.floor
  return floor(random() * n+1)
}

module.exports=generateSub


