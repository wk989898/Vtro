<template>
  <div>
    <el-button type="primary" id="link" @click="connect('link')">连接</el-button>
    <el-button type="primary" id="close" @click="connect('close')">关闭</el-button>
    <el-switch v-model="connect" disabled active-color="#13ce66" inactive-color="#ff4949" style="z-index:9"></el-switch>
    <span class="now">连接节点：{{now.name}}</span>
  </div>
</template>

<script>
  import {
    calcTime
  } from '../utils/time'
  export default {
    data() {
      return {
        connect: false,
        now: ''
      }
    },
    mounted() {
      let ipc = electron.ipcRenderer
      ipc.send('getConf')
      ipc.on('linked', () => {
        this.connect = true
        this.$message('已连接')
        this.$global.link = true
      }).on('closed', () => {
        if (this.connect)
          this.connect = false
        if (this.$global.link)
          this.$message('已断开')
        this.$global.link = false
      }).on('config', (e, conf) => {
        console.log(conf.mode)
        const now = conf.mode === 'night' ? conf.night : conf.day
        this.now = this.$global.now = now
      })
    },
    methods: {
      connect(type) {
        let ipc = electron.ipcRenderer
        ipc.send(type)
      }
    }
  }
</script>
<style scoped>
  .now {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>