const { app, BrowserWindow, ipcMain, Menu, Tray, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const cp = require('child_process')
const http = require('http')
const process = require('process')
const util = require('util');


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
    if (type(chunk) === 'array')
      return res[name].unshift(...chunk)
    res[name].unshift(chunk)
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
 * @param {string} type
 * 'r' - 打开文件用于读取
 * 'w' - 打开文件用于写入
 * 'a' - 打开文件用于追加
 * @param {any} data 
 * 写入数据  default :''
 * @callback cb
 * @param {object} res
 * 
 */
function openConf(type, data = '', cb) {
  let file = 'trojan/conf.json'
  if (type === 'r') {
    return fs.readFile(file, 'utf-8', (err, res) => {
      if (err) appendLog(err)
      res = JSON.parse(res.toString())
      cb(res)
    })
  } else if (type === 'w') {
    return fs.writeFile(file, JSON.stringify(data), err => {
      if (err) appendLog(err)
    })
  } else if (type === 'a') {
    return fs.readFile(file, 'utf-8', async (err, res) => {
      if (err) appendLog(err)
      data = JSON.parse(res.toString())
      await cb(data)
      fs.writeFile(file, JSON.stringify(data), err => {
        if (err) appendLog(err)
      })
    })
  }
}
/** 监听事件 */
// 获取当前节点 获取节点
ipcMain.once('getnow', (e, r) => {
  openConf('r', null, res => {
    let name = res.now.name
    e.reply('setnow', name ? name : '')
  })
}).on('get-nodes', (e, r) => {
  openConf('r', null, res => {
    if (!res.nodes) return appendLog(`please check your conf.json`)
    e.reply('update-nodes', res.nodes)
  })
})
// 连接 关闭
ipcMain.on('link', (e, type) => {
  allquit()
  trojan = cp.execFile('trojan.exe', {
    cwd: './trojan',
    windowsHide: true
  }, (err, stdout, stderr) => {
    if (err) appendLog(stderr, './trojan/trojan-log.txt')
    if (stdout) appendLog(stdout, './trojan/trojan-log.txt')
    e.reply('closed', { err: err ? err : null })
    return console.log('link is closed')
  })
  trojanpid = trojan.pid
  let arg
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
  e.reply('linked')
}).on('close', (e, r) => {
  allquit()
})

// 更改连接节点
ipcMain.on('change-linknode', (e, r) => {
  if (!r) return;
  fs.readFile('./trojan/config.json', 'utf-8', (err, res) => {
    if (err) appendLog(err)
    openConf('a', null, res => {
      res.now = r
    })
    let data = JSON.parse(res.toString())
    // password,addr,port
    data.remote_addr = r.addr
    data.remote_port = r.port
    data.password[0] = r.password
    fs.writeFile('./trojan/config.json', JSON.stringify(data), 'utf-8', err => {
      if (err) appendLog(err)
    })
  })
})
// 获取订阅 更新订阅 删除订阅
ipcMain.on('get-sub', e => {
  openConf('r', null, res => {
    e.reply('subs', res.sub || [])
  })
}).on('update', (e, r) => {
  addfile('nodes', r.nodes, res => {
    res.nodes = []
  })
  addfile('sub', r.sub)
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


// 菜单
var template = [
  {
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
  },
  /**
   *  {
    type: 'checkbox',
    label: '开机启动',
    checked: app.getLoginItemSettings().openAtLogin,
    click(){
      if (!app.isPackaged) {
        app.setLoginItemSettings({
          openAtLogin: !app.getLoginItemSettings().openAtLogin,
          path: process.execPath
        })
      } else {
        app.setLoginItemSettings({
          openAtLogin: !app.getLoginItemSettings().openAtLogin
        })
      }
    }
  },
   */
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

menu.items.forEach(value => {
  let child = value.submenu
  if (value.id === 'log') return;
  if (value.id === 'refresh') return;
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