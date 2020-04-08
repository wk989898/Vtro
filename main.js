// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu, MenuItem } = require('electron')
const path = require('path')
const fs = require('fs')
var mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: true
    },
  })
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// 监听事件
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
      {id:'lists',label:'节点列表'}
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
  return mainWindow.webContents.send(channel, args);
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

