"use strict";
const Application = require('spectron').Application;
const path = require('path');
const http = require('http');
const { readFileSync } = require('fs');
const urlTest = require('../src/utils/url-test');

process.env.NODE_ENV = 'test'
var electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');

if (process.platform === 'win32') {
  electronPath += '.cmd';
}

var config
readFileSync(path.resolve('./trojan/conf.json'), (err, res) => {
  config = JSON.parse(res)
})
var appPath = path.join(__dirname, '..')

var app = new Application({
  path: electronPath,
  args: [appPath]
})

jest.setTimeout(10000)

describe('Vtro', () => {
  beforeAll(() => {
    return app.start()
  })
  afterAll((done) => {
    if (app.isRunning()) {
      app.mainProcess.exit()
      done()
    }
  })

  it('opens a window', () => {
    return app.client.getWindowCount().then(count => {
      expect(count).toBe(1)
    })
  })
  it('defined', () => {
    expect(app.mainProcess).toBeDefined()
    expect(app.webContents).toBeDefined()
    expect(app.electron).toBeDefined()
  })
  it('title', () => {
    return app.client.getTitle().then(title => {
      expect(title).toEqual('Vtro - a trojan gui')
    })
  })

  it('url-test', () => {
    return urlTest().then(res => {
      expect(typeof res).toBe('number')
    })
  })

  it('send and on', () => {
    return app.client.waitUntilWindowLoaded().then(() => {
      const ipc = app.electron.ipcRenderer
      ipc.on('test', (e, arg) => {
        expect(arg).toEqual('jest')
        e.reply('test-reply', 'jest!')
      })
      app.mainProcess.on('test-reply', (e, arg) => {
        console.log('-----------------');
        expect(arg).toEqual('jest!')
      })
      app.webContents.send('test', 'jest')
    })
  })

  it('conf.json', () => {
    return app.client.waitUntilWindowLoaded().then(() => {
      const ipc = app.electron.ipcRenderer
      ipc.once("config", (e, conf) => {
        expect(conf).toEqual(conf)
      })
    })
  })

  it('nodes', () => {
    return app.client.waitUntilWindowLoaded().then(() => {
      const ipc = app.electron.ipcRenderer
      ipc.once('update-nodes', (e, nodes) => {
        expect(nodes).toEqual(config.nodes)
      })
    })
  })

  it('switch', () => {
    return app.client.waitUntilWindowLoaded().then(async () => {
      var link_count = 0
      var close_count = 0
      const ipc = app.electron.ipcRenderer
      ipc.on('linked', () => link_count++)
      ipc.on('closed', () => close_count++)
      expect(link_count).toBe(0)
      expect(close_count).toBe(0)
      app.client.execute(function () {
        document.querySelector('#switch').click()
      })
      expect(link_count).toBe(0)
      expect(close_count).toBe(1)
    })
  })

  it('http server test', async () => {
    return app.client.waitUntilWindowLoaded().then(async () => {
      app.client.execute(function () {
        document.querySelector('#go_set').click()
        setTimeout(() => {
          document.querySelector("input[value='pac'].el-radio__original").click()
        }, 1000);
      })
      const baseUrl = 'http://127.0.0.1'
      console.log(config)
      const [http_port, pac_port] = config.config.listen
      console.log(http_port, pac_port)
      await http.get(`${baseUrl}:${http_port}`, (res) => {
        const { statusCode: code, statusMessage: msg } = res
        console.log(code, msg);
        expect(code).toEqual(400)
        expect(msg).toBe("Invalid header received from client")
      })
      await http.get(`${baseUrl}:${pac_port}/pac`, (res) => {
        const { statusCode: code, statusMessage: msg } = res
        expect(code).toEqual(200)
        expect(msg).toBe("OK")
      })
    })
  })
})



