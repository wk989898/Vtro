"use strict";
const Application = require('spectron').Application;
const path = require('path');
const { readFileSync } = require('fs');
const urlTest = require('../src/utils/url-test');

const { exec } = require('child_process');

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
  args: [appPath],
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
    app.client.getTitle().then(title => {
      expect(title).toEqual('Vtro - a trojan gui')
    })
  })

  it('url-test', () => {
    return urlTest().then(res => {
      expect(typeof res).toBe('number')
    })
  })

  it('send and on', () => {
    app.client.waitUntilWindowLoaded().then(() => {
      const ipc = app.client.window.ipc
      ipc.on('test', (e, arg) => {
        expect(arg).toEqual('jest')
        e.reply('test-reply', 'jest!')
      })
      app.electron.ipcMain.on('test-reply', (e, arg) => {
        expect(arg).toEqual('jest!')
      })
      app.webContents.send('test', 'jest')
    })
  })

  it('config', () => {
    app.client.waitUntilWindowLoaded().then(() => {
      const ipc = app.client.window.ipc
      ipc.once("config", (e, conf) => {
        expect(conf).toEqual(conf)
      })
    })
  })

  it('nodes', () => {
    app.client.waitUntilWindowLoaded().then(() => {
      const ipc = app.client.window.ipc
      ipc.once('update-nodes', (e, nodes) => {
        expect(nodes).toEqual(config.nodes)
      })
    })
  })

  it('switch', () => {
    app.client.waitUntilWindowLoaded().then(() => {
      const ipc = app.client.window.ipc
      function foo() { }
      function bar() { }
      ipc.on('linked', foo)
      ipc.on('closed', bar)
      expect(foo).toBeCalledTimes(1)
      expect(bar).toBeCalledTimes(0)
      app.client.click('#switch').then(() => {
        expect(foo).toBeCalledTimes(1)
        expect(bar).toBeCalledTimes(1)
      }).then(() => {
        app.client.click('#swich').then(() => {
          expect(foo).toBeCalledTimes(2)
          expect(bar).toBeCalledTimes(1)
        })
      })
    })
  })
})



