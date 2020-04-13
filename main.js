const { app, BrowserWindow, ipcMain, Menu, Tray, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const cp = require('child_process')
const http = require('http')
const process=require('process')
var ping = require('ping')


var win, tray, trojan, privo,privoxypid,trojanpid
const server = http.createServer()


function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      devTools: true
    },
  })
  win.loadFile('index.html')

  win.on('close', (e) => {
    e.preventDefault()
    win.hide()
  })
}

app.name = "Vtro"
app.on('ready', () => {
  createWindow()
  //  开发者工具
  !app.isPackaged&&win.webContents.openDevTools()
  // tray 
  tray = new Tray('./tray.ico')
  let traylist=[
    {
      label: '退出',
      click() {
        app.exit()
      }
    },
  ]
  const contextMenu = Menu.buildFromTemplate(traylist)
  tray.setToolTip('Vtro')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    !win.isVisible() && win.show()
  })

})

app.on('before-quit', () => {
  allquit()
})
// Quit when all windows are closed.
app.on('window-all-closed', function (event) {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})


app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// 添加日志
function appendLog(err, path) {
  if (path === null || path === undefined) path = './trojan/log.txt'
  fs.appendFile(path, err + '\n', 'utf-8', () => { })
}
// 设置pac代理
server.on('request', (req, res) => {
  if (req.url === '/pac') {
    res.setHeader('Content-Type', 'application/x-ns-proxy-autoconfig')
    fs.readFile('./proxy/proxy.pac', (e, data) => {
      if (e) res.end('error')
      res.end(data)
    })
  }
})
function makeproxy(type, arg, list) {
  cp.execFile('./sysproxy.exe', [type, arg, list], {
    cwd: './proxy',
    windowsHide: true
  }, (err, stdout, stderr) => {
    if (err) appendLog(err) && server.close()
    if (stderr) appendLog(stderr)
  })
}
// http -> socks
function privoxy() {
  privo = cp.execFile('./privoxy.exe', {
    cwd: './proxy',
    windowsHide: true
    // shell: true,
  }, (err) => {
    let log='privoxy error!has you close privoxy?\nplease check http://localhost:1081'
    if (err) appendLog(log) && server.close()
  })
  privoxypid=privo.pid
}
// 退出
function allquit() {
  trojan && trojan.kill()
  privo && privo.kill()
  server.listening && server.close()
}
/** 监听事件 */
// 获取当前节点
ipcMain.once('getnow', (e, r) => {
  fs.readFile('./trojan/now.json', 'utf-8', (err, res) => {
    if (err) appendLog(err)
    if(!res) return e.reply('setnow','')
    let name = JSON.parse(res).name
    e.reply('setnow', name ? name : '')
  })
})
// 连接
ipcMain.on('link', (e, type) => {
  allquit()
  trojan = cp.execFile('trojan.exe', {
    cwd: './trojan',
    windowsHide: true
  }, (err, stdout, stderr) => {
    if (err) appendLog(stderr, './trojan/trojanlog.txt')
    if (stderr) appendLog(stderr, './trojan/trojanlog.txt')
    e.reply('closed', { err: err ? err : stderr ? stderr : null })
    console.log('link is closed')
  })
  trojanpid=trojan.pid
  let arg = ''
  if (type === 'global') {
    arg = `http://127.0.0.1:1081`
    let list = `localhost;127.*`
    makeproxy(type, arg, list)
    privoxy()
  } else if (type === 'pac') {
    // 默认
    arg = `http://127.0.0.1:1082/pac`
    !server.listening && server.listen(1082, '127.0.0.1', () => {
      makeproxy(type, arg)
      privoxy()
    })
  } else makeproxy('set', 1)
})
// 关闭
ipcMain.on('close', (e, r) => {
  allquit()
})
// 更改连接节点
ipcMain.on('change-linklist', (e, r) => {
  fs.readFile('./trojan/config.json', 'utf-8', (err, res) => {
    if (err) appendLog(err)
    if (!r) return;
    fs.writeFile('./trojan/now.json', JSON.stringify(r), 'utf-8', err => {
      if (err) appendLog(err)
    })

    let data = JSON.parse(res.toString())
    // password,addr,port,
    data.remote_addr = r.addr
    data.remote_port = r.port
    data.password[0] = r.password
    fs.writeFile('./trojan/config.json', JSON.stringify(data), 'utf-8', err => {
      if (err) appendLog(err)
    })
  })
})
// 获取订阅
ipcMain.on('get-sub', e => {
  fs.readFile('./trojan/sub.txt', (err, r) => {
    if (err) {
      appendLog(err)
      return;
    }
    r && e.reply('sub', r.toString())
  })
})
// 更新节点
ipcMain.on('update', (e, r) => {
  fs.writeFile('./trojan/sub.txt', r.sub, () => { })
  fs.writeFile('./trojan/lists.json', JSON.stringify(r.data), 'utf-8', err => {
    if (err) appendLog(err)
  })
})
// 获取节点
ipcMain.on('get-lists', (e, r) => {
  fs.readFile('./trojan/lists.json', 'utf-8', (err, res) => {
    if (err) {
      let d = []
      fs.writeFile('./trojan/lists.json', JSON.stringify(d), () => { })
    }
    if (!res) {
      let log = `please check your lists.json`
      appendLog(log)
      return;
    };
    let data = JSON.parse(res.toString())
    e.reply('update-lists', data)
  })
})
// 手动添加节点
ipcMain.on('add-list', (e, r) => {
  fs.readFile('./trojan/lists.json', 'utf-8', (err, res) => {
    if (err) appendLog(err)
    let data = JSON.parse(res.toString()) || []
    try {
      data.unshift(r.data)
    } catch{
      data = []
      data.unshift(r.data)
    }
    fs.writeFile('./trojan/lists.json', JSON.stringify(data), 'utf-8', err => {
      if (err) appendLog(err)
    })
  })
})
// 删除节点
ipcMain.on('delete-list',(e,ip)=>{
  fs.readFile('./trojan/lists.json', 'utf-8', (err, res) => {
    if (err) appendLog(err)
    let data=JSON.parse(res.toString())
    data=data.filter(v=>{
      return v.ip!==ip
    })
    fs.writeFile('./trojan/lists.json', JSON.stringify(data), 'utf-8', err => {
      if (err) appendLog(err)
      e.reply('deleted')
    })
  })
})
// ping
ipcMain.on('all-ping', async (e, hosts) => {
  let arr = []
  //
  Promise.all(hosts.map(host => {
    return Promise.resolve(ping.promise.probe(host.addr, {
      timeout: 10
    }))
  })).then(res => {
    res.forEach(v => {
      if (v.avg === 'unknown') v.avg = -1
      arr.push(parseInt(v.avg))
    })
    e.reply('ping-result', arr)
    fs.readFile('./trojan/lists.json', 'utf-8', (err, res) => {
      if (err) appendLog(err)
      let data = JSON.parse(res.toString()) || []
      for (let i in data) {
        data[i]['ping'] = arr[i]
      }
      fs.writeFile('./trojan/lists.json', JSON.stringify(data), 'utf-8', err => {
        if (err) appendLog(err)
      })
    })
  }).catch(e => { appendLog(e) })
})


// 菜单
const template = [
  {
    id: 'list',
    label: '设置节点',
    submenu: [
      { id: 'sub', label: '订阅' },
      { id: 'add', label: '添加节点' },
      { id: 'lists', label: '节点列表' },
      { id: 'ping', label: 'ping' }
    ]
  },
  {
    id: 'set',
    label: '设置'
  },
  {
    id: 'log',
    label: '日志',
    submenu: [
      {
        id: 'trojanlog', label: 'trojan日志',
        click: () => {
          try {
            shell.openItem(path.resolve('trojan/trojanlog.txt'))
          } catch (e) {
          }
        }
      },
      {
        id: 'linklog', label: '连接日志', click() {
          try {
            shell.openItem(path.resolve('trojan/log.txt'))
          } catch (e) {
          }
        }
      },
    ]

  }
]
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

function send(channel, args) {
  return win.webContents.send(channel, args)
}

menu.items.forEach(value => {
  let child = value.submenu
  if (value.id === 'log') return;
  if (child) {
    child.items.forEach(val => {
      val.click = () => {
        send(val.id)
      }
    })
  } else {
    value.click = () => {
      send(value.id)
    }
  }
})
