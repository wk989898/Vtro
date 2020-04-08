// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const fs = require('fs')
const path = require('path')
const cp = require('child_process')
// const Trojan=require('./trojan/trojan.js')
// const Axios=require('axios')
// Axios.defaults.adapter=require('axios/lib/adapters/http');

window.addEventListener('DOMContentLoaded', () => {
  var exit = document.getElementById('exit')
  var trojan
  document.getElementById('trojan').addEventListener('click', () => {
    trojan && trojan.kill()
    trojan = cp.execFile('./trojan.exe', {
      cwd: path.resolve(__dirname, './trojan')
    }, (err, res) => {
      if (err) {
        fs.writeFile('./trojan/log.txt',err,'utf-8',err=>{})
        document.getElementById('error').innerHTML=err
        console.log(err)
      }
      console.log('退出连接')
    })
  })
  exit.addEventListener('click', () => {
      trojan && trojan.kill()
  })
})
