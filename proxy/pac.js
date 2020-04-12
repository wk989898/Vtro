const http =require('http')
const path=require('path')
const fs=require('fs')

const server=http.createServer()
server.on('request',(req,res)=>{
  if(req.url==='/pac'){
    res.setHeader('Content-Type', 'application/x-ns-proxy-autoconfig')
    fs.readFile('./proxy/proxy.pac',(e,data)=>{
      if(e) res.end('error')
      res.end(data)
    })
  }
})
module.exports=server