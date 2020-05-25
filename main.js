"use strict";
const { app, BrowserWindow, ipcMain, Menu, Tray, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const cp = require('child_process')
const http = require('http')
const https = require('https')
const process = require('process')
const dns = require('dns')


var win, tray, trojan, privo, privoxypid, trojanpid
const server = http.createServer()

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
// 应用锁
const Lock = app.requestSingleInstanceLock()

if (!Lock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到win这个窗口
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
      win.show()
    }
  })
  app.on('ready', () => {
    createWindow()
    //  开发者工具
    const isPackaged = app.isPackaged
    !isPackaged && win.webContents.openDevTools()
    // tray 路径为运行时路径 ./resource
    tray = new Tray(
      isPackaged ? path.resolve(app.getAppPath(), '../tray.ico') : 'tray.ico'
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
    tray.addListener("click", () => {
      win.show()
    })
    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
      !win.isVisible() && win.show()
    })
  })
}


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


// utils
function type(a) {
  return Object.prototype.toString.call(a).slice(8).replace(']', '').toLowerCase()
}
function _path(p) {
  let Path = app.isPackaged ? path.resolve(app.getPath('exe'), '../') : ''
  return path.resolve(Path, p)
}
function formatTime(...args) {
  const [a = '-', b = ' ', c = ':'] = args
  const now = new Date()
  return now.getFullYear().toString() + a +
    now.getMonth().toString().padStart(2, '0') + a +
    now.getDay().toString().padStart(2, '0')
    + b +
    now.getHours().toString().padStart(2, '0') + c +
    now.getMinutes().toString().padStart(2, '0') + c +
    now.getSeconds().toString().padStart(2, '0')
}
// 添加日志
function appendLog(err, path) {
  if (!err) return;
  if (path === null || path === void 0) path = _path('./trojan/log.txt')
  fs.appendFile(path, formatTime() + err + '\n', 'utf-8', () => { })
}
// 设置pac代理
server.on('request', (req, res) => {
  if (req.url === '/pac') {
    res.setHeader('Content-Type', 'application/x-ns-proxy-autoconfig')
    fs.readFile(_path('./proxy/proxy.pac'), (e, data) => {
      if (e) res.end('error')
      res.end(data)
    })
  }
})
function makeproxy(type, arg, list) {
  cp.execFile('./sysproxy.exe', [type, arg, list], {
    cwd: _path('./proxy'),
    windowsHide: true
  }, (err, stdout, stderr) => {
    if (err) appendLog(err) && server.close()
    if (stderr) appendLog(stderr)
  })
}
// http -> socks
function privoxy() {
  privo = cp.execFile('./privoxy.exe', {
    cwd: _path('./proxy'),
    windowsHide: true
    // shell: true,
  }, (err) => {
    let log = 'privoxy error!has you close privoxy?\nplease check http://localhost:1081\n'
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
  if (!chunk) {
    appendLog(`there is no data to be added`)
    return Promise.resolve(false)
  }
  await openConf('a', null, res => {
    cb && cb(res)
    if (type(chunk) === 'array') {
      res[name].unshift(...chunk)
    } else { res[name].unshift(chunk) }
  })
  return Promise.resolve(true)
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
  let file = _path('./trojan/conf.json')
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
    return await fs.readFile(file, 'utf-8', (err, res) => {
      if (err) appendLog(err)
      res = JSON.parse(res.toString())
      cb(res)
      fs.writeFileSync(file, JSON.stringify(res))
    })
  }
}
// 更改 config.json
function changeConfig() {
  fs.readFile(_path('./trojan/config.json'), 'utf-8', (err, res) => {
    if (err) appendLog(err)
    let data = JSON.parse(res.toString())
    openConf('r', null, async res => {
      let now
      if (!res.config.night) now = res.config.day
      else now = res.config.mode === 'night' ? res.config.night : res.config.day
      // password,addr,port
      data.remote_addr = now.addr
      data.remote_port = now.port
      data.password[0] = now.password
      // socks5 port
      data.local_port = res.config.listen[0] || 1080
      await fs.writeFile(_path('./trojan/config.json'), JSON.stringify(data), 'utf-8', err => {
        if (err) appendLog(err)
      })
    })
  })
}
// 流量统计
let received = 0, sent = 0
function flow(trojan = trojan) {
  trojan.stderr.on('data', data => {
    data.replace(/(\d*) bytes received, (\d*) bytes sent/, (e, $1, $2) => {
      if ($1 && $2) {
        received += Number($1)
        sent += Number($2)
        send('flow', [received, sent])
      }
    })
  }).on('close', () => {
    received = 0;
    sent = 0
  })
}
function convert(data = 0) {
  data = Math.abs(data)
  for (let i of flow_unit) {
    if (data < 1024 * size[i]) {
      return (data / size[i]).toFixed(2) + i
    }
  }
  return (data / size['GB']).toFixed(2) + 'GB'
}

/** 监听事件 */

// 连接 关闭
ipcMain.on('link', (e, type) => {
  allquit()
  changeConfig()
  trojan = cp.execFile('trojan.exe', {
    cwd: _path('./trojan'),
    windowsHide: true
  }, (err, stdout, stderr) => {
    if (stderr) appendLog(stderr, _path('./trojan/trojan-log.txt'))
  })
  flow(trojan)
  trojanpid = trojan.pid

  let arg
  openConf('r', null, res => {
    const type = res.config.proxy || 'pac'
    const [p1, p2 = 1081, p3 = 1082] = res.config.listen
    if (type === 'global') {
      arg = `http://127.0.0.1:${p2}`
      let list = `localhost;127.*`
      makeproxy(type, arg, list)
      privoxy()
    } else if (type === 'pac') {
      // default
      arg = `http://127.0.0.1:${p3}/pac`
      !server.listening && server.listen(p3, '127.0.0.1', () => {
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

// 获取节点 更改连接节点 夜间节点 mode
ipcMain.on('get-nodes', e => {
  openConf('r', null, res => {
    if (!res.nodes) return appendLog(`please check your conf.json`)
    e.reply('update-nodes', res.nodes)
  })
}).on('change-linkNode', (e, node) => {
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
}).on('change-mode', (e, mode) => {
  openConf('a', null, res => {
    res.config.mode = mode
    e.reply('mode')
  })
})
// 获取订阅 更新订阅 删除订阅 set-proxy
ipcMain.on('get-sub', e => {
  openConf('r', null, res => {
    e.reply('subs', res.sub || [])
  })
}).on('update', (e, r) => {
  addfile('nodes', r.nodes, res => {
    // clear nodes
    res.nodes.length = 0
  }).finally(e => {
    // 防止写入数据出错
    setTimeout(() => {
      addfile('sub', r.sub, res => {
        res.sub.length = 0
      })
    }, 1000)
  })
}).on('remove-sub', (e, sub) => {
  deleteData('sub', v => {
    return v !== sub
  })
  e.reply('removed')
}).on('sub-proxy', (e, proxy) => {
  if (proxy)
    fs.readFile(_path('./trojan/config.json'), async (err, res) => {
      if (err) appendLog(err)
      const { local_addr, local_port } = JSON.parse(res.toString())
      let socks5 = `socks://${local_addr}:${local_port},localhost`
      win.webContents.session.setProxy({ proxyRules: socks5 })
    })
  else win.webContents.session.setProxy({})
})

// 手动添加节点 删除节点  更改节点配置
ipcMain.on('add-node', (e, node) => {
  if (!node.ip)
    dns.resolve4(node.addr, (err, addresses) => {
      if (err) node.ip = '0';
      type(addresses) === 'array' && (addresses = (addresses[0]))
      node.ip = addresses
      addfile('nodes', node)
    })
  else addfile('nodes', node)
}).on('delete-node', (e, ip) => {
  deleteData('nodes', v => {
    if (v.ip) return v.ip !== ip
    return v.addr !== v.addr
  })
  e.reply('deleted')
}).on('update-node', (e, nodes) => {
  openConf('a', null, res => {
    res.nodes = nodes
  })
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
      openAsHidden: true
    })
  } else {
    app.setLoginItemSettings({
      openAsHidden: true,
      openAtLogin: login,
    })
  }
}).on('get-login', e => {
  e.reply('login', app.getLoginItemSettings().openAtLogin)
})
// ipcMain.on('test', e => {
//   e.reply('test-replay', 'test')
// })

// 菜单
var template = [
  {
    type: 'submenu',
    id: 'list',
    label: '节点',
    submenu: [
      { id: 'sub', label: '订阅' },
      { id: 'add', label: '添加节点' },
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
          shell.openItem(_path('trojan/trojan-log.txt'))
        }
      },
      {
        id: 'linklog', label: '连接日志', click() {
          shell.openItem(_path('trojan/log.txt'))
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