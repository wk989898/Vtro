const { app, BrowserWindow, ipcMain, Menu, Tray, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const cp = require('child_process')
const http = require('http')
const process = require('process')


var win, tray, trojan, privo, privoxypid, trojanpid
const server = http.createServer()
const resourcesPath = path.resolve(process.resourcesPath)


function createWindow() {
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
  const isPackaged = app.isPackaged
  !isPackaged && win.webContents.openDevTools()
  // tray 路径为运行时路径 ./resource
  tray = new Tray(
    isPackaged ? path.resolve(resourcesPath, 'tray.ico') : 'tray.ico'
  )
  let traylist = [
    {
      label: '退出',
      click() {
        app.exit()
      }
    }
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


// 获取类型
function type(a) {
  return Object.prototype.toString.call(a).slice(8).replace(']', '').toLowerCase()
}
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
    let log = 'privoxy error!has you close privoxy?\nplease check http://localhost:1081'
    if (err) appendLog(log) && server.close()
  })
  privoxypid = privo.pid
}
// 退出
function allquit() {
  trojan && trojan.kill()
  privo && privo.kill()
  server.listening && server.close()
}
// 添加文件
async function addfile(name, chunk, cb) {
  if (!chunk) return appendLog(`there is no chunk`)
  await openConf('a', null, res => {
    cb && cb(res)
    if (type(chunk) === 'array') {
      res[name].unshift(...chunk)
    } else { res[name].unshift(chunk) }
  })
}
// 删除数据
function deleteData(name, condition) {
  openConf('a', null, res => {
    if (type(res[name]) === 'array') {
      res[name] = res[name].filter(v => {
        return condition(v)
      })
    }
  })
}
/**
 * @param {string} type r | w | a
 * @param {any} data 写入数据  default :''
 * @callback cb
 * @param {object} res
 */
async function openConf(type, data = '', cb) {
  let file = './trojan/conf.json'
  if (type === 'r') {
    return await fs.readFile(file, 'utf-8', (err, res) => {
      if (err) appendLog(err)
      res = JSON.parse(res.toString())
      cb(res)
    })
  } else if (type === 'w') {
    return await fs.writeFile(file, JSON.stringify(data), err => {
      if (err) appendLog(err)
    })
  } else if (type === 'a') {
    return await fs.readFile(file, 'utf-8', async (err, res) => {
      if (err) appendLog(err)
      res = JSON.parse(res.toString())
      await cb(res)
      fs.writeFile(file, JSON.stringify(res), err => {
        if (err) appendLog(err)
      })
    })
  }
}
// 更改 config.json
function changeConfig() {
  fs.readFile('./trojan/config.json', 'utf-8', (err, res) => {
    if (err) appendLog(err)
    let data = JSON.parse(res.toString())
    openConf('r', null, res => {
      const now = res.config.mode === 'night' ? res.config.night : res.config.day
      // password,addr,port
      data.remote_addr = now.addr
      data.remote_port = now.port
      data.password[0] = now.password
      fs.writeFile('./trojan/config.json', JSON.stringify(data), 'utf-8', err => {
        if (err) appendLog(err)
      })
    })
  })
}

/** 监听事件 */
// 获取当前节点 获取节点
ipcMain.on('get-nodes', e => {
  openConf('r', null, res => {
    if (!res.nodes) return appendLog(`please check your conf.json`)
    e.reply('update-nodes', res.nodes)
  })
})
// 连接 关闭
ipcMain.on('link', (e, type) => {
  allquit()
  changeConfig()
  trojan = cp.execFile('trojan.exe', {
    cwd: './trojan',
    windowsHide: true
  }, (err, stdout, stderr) => {
    if (err) appendLog(stderr, './trojan/trojan-log.txt')
    if (stdout) appendLog(stdout, './trojan/trojan-log.txt')
  })
  trojanpid = trojan.pid
  let arg
  openConf('r', null, res => {
    type = type ? type : (res.config.proxy || 'pac')
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
  e.reply('linked')
  console.log('link is open')
}).on('close', (e, r) => {
  allquit()
  e.reply('closed')
  console.log('link is closed')
})

// 更改连接节点 夜间节点
ipcMain.on('change-linkNode', (e, node) => {
  if (!node) return;
  openConf('a', null, res => {
    res.config.day = node
    e.reply('config', res.config)
  })
}).on('change-nightNode', (e, node) => {
  if (!node) return;
  openConf('a', null, res => {
    res.config.night = node
    e.reply('config', res.config)
  })
})
// 获取订阅 更新订阅 删除订阅
ipcMain.on('get-sub', e => {
  openConf('r', null, res => {
    e.reply('subs', res.sub || [])
  })
}).on('update', (e, r) => {
  addfile('nodes', r.nodes, res => {
    res.nodes.length = 0
  })
  // 防止写入数据出错
  setTimeout(() => {
    addfile('sub', r.sub)
  }, 1000)
}).on('remove-sub', (e, sub) => {
  deleteData('sub', v => {
    return v !== sub
  })
  e.reply('removed')
})

// 手动添加节点 删除节点
ipcMain.on('add-node', (e, r) => {
  addfile('nodes', r.data)
}).on('delete-node', (e, ip) => {
  deleteData('nodes', v => {
    return v.ip !== ip
  })
  e.reply('deleted')
})

// config 设置     
ipcMain.on('getConf', e => {
  openConf('r', null, res => {
    e.reply('config', res.config)
  })
}).on('setConf', (e, conf) => {
  openConf('a', null, res => {
    Object.assign(res.config, conf)
    e.reply('config', res.config)
  })
})
// 开机启动
ipcMain.on('set-login', (e, login) => {
  if (!app.isPackaged) {
    app.setLoginItemSettings({
      openAtLogin: login,
      openAsHidden: true,
      path: process.execPath,
      args: ['.']
    })
  } else {
    app.setLoginItemSettings({
      openAsHidden: true,
      openAtLogin: login
    })
  }
}).on('get-login', e => {
  e.reply('login', app.getLoginItemSettings().openAtLogin)
})

// 菜单
var template = [
  {
    type: 'submenu',
    id: 'list',
    label: '设置节点',
    submenu: [
      { id: 'sub', label: '订阅' },
      { id: 'add', label: '添加节点' },
      { id: 'nodes', label: '节点列表' },
      { id: 'ping', label: 'ping' },
      { id: 'tcp-ping', label: 'tcp-ping' }
    ]
  },
  {
    id: 'set',
    label: '设置',
    click() {
      send('set')
    }
  },
  {
    id: 'log',
    label: '日志',
    submenu: [
      {
        id: 'trojan-log', label: 'trojan日志',
        click: () => {
          shell.openItem(path.resolve('trojan/trojan-log.txt'))
        }
      },
      {
        id: 'linklog', label: '连接日志', click() {
          shell.openItem(path.resolve('trojan/log.txt'))
        }
      },
    ]
  },

]
if (!app.isPackaged) {
  template.push({
    id: 'refresh',
    label: 'refresh',
    role: 'forceReload'
  })
}
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

function send(channel, args) {
  return win.webContents.send(channel, args)
}
// 设置节点
menu.items[0].submenu.items.forEach(val => {
  val.click = () => {
    send(val.id)
  }
})