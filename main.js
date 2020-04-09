// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron')
const path = require('path')
const fs = require('fs')
const cp = require('child_process')


var win, tray,trojan

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: true
    },
  })
  // and load the index.html of the app.
  win.loadFile('index.html')
  // Open the DevTools.
  //  开发者工具
  win.webContents.openDevTools()
  win.on('close', (e) => {
    e.preventDefault()
    win.hide()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
  // tray 
  tray = new Tray('./tray.ico')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出',
      click() {
        app.exit()
      }
    },
  ])
  tray.setToolTip('Vtro')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    !win.isVisible() && win.show()
  })

})

// Quit when all windows are closed.
app.on('window-all-closed', function (event) {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})


app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// 监听事件
ipcMain.on('link', (e, r) => {
  trojan = cp.execFile('./trojan.exe', {
    cwd: path.resolve('./trojan')
  }, (err, res) => {
    if (err) {
      fs.readFile('./trojan/log.txt', 'utf-8', (error, r) => {
        let raw = r.toString() + err
        if (error) raw+=`\n can not find log.txt!\n ${error.stack}`;
        fs.writeFile('./trojan/log.txt', raw, 'utf-8', err => { })
      })
    }
    e.reply('closed',{err})
    console.log('link is closed')
  })
})
ipcMain.on('close',(e,r)=>{
  trojan&&trojan.kill()
})
ipcMain.on('change-list', (e, r) => {
  fs.readFile('./trojan/config.json', 'utf-8', (err, res) => {
    if (err) throw err
    let data = JSON.parse(res.toString())
    // password,addr,port,
    data.remote_addr = r.addr
    data.remote_port = r.port
    data.password[0] = r.password
    console.log(data.remote_addr);
    fs.writeFile('./trojan/config.json', JSON.stringify(data), 'utf-8', err => {
      if (err) throw err;
    })
  })
})
ipcMain.on('update', (e, r) => {
  fs.writeFile('./trojan/lists.json', JSON.stringify(r.data), 'utf-8', err => {
    if (err) throw err
  })
})
ipcMain.once('get-lists', (e, r) => {
  fs.readFile('./trojan/lists.json', 'utf-8', (err, res) => {
    if (err) throw err
    if (!res) return;
    let data = JSON.parse(res.toString())
    e.reply('update-lists', data)
  })
})
ipcMain.on('add-list', (e, r) => {
  fs.readFile('./trojan/lists.json', 'utf-8', (err, res) => {
    if (err) throw err
    let data = JSON.parse(res.toString()) || ''
    data.unshift(r.data)
    fs.writeFile('./trojan/lists.json', JSON.stringify(data), 'utf-8', err => {
      if (err) throw err
    })
  })
})

// 菜单栏
const template = [
  {
    id: 'list',
    label: '设置节点',
    submenu: [
      { id: 'sub', label: '订阅' },
      { id: 'add', label: '手动添加' },
      { id: 'lists', label: '节点列表' }
    ]
  },
  {
    id: 'ping',
    label: 'ping'
  },
  {
    id: 'set',
    label: '设置'
  }
]
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

function send(channel, args) {
  return win.webContents.send(channel, args)
}

menu.items.forEach(value => {
  let child = value.submenu
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
