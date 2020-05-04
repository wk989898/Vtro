<template>
  <div>
    <el-button type="primary" id="link" @click="link">连接</el-button>
    <el-button type="primary" id="close" @click="close">关闭</el-button>
    <el-switch v-model="connect" disabled active-color="#13ce66" inactive-color="#ff4949" style="z-index:9"></el-switch>
    <span class="now">连接节点：{{now.name}}</span>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        connect: false,
        now:''
      }
    },
    mounted() {
      let ipc = electron.ipcRenderer
      ipc.send('getConf')
      ipc.on('linked', () => {
        this.connect = true
        this.$message('已连接')
      }).on('closed', (e, arg) => {
        arg && console.log(arg.err.message)
      }).on('config',(e,conf)=>{
        this.now=this.$global.now = conf.now
      })
    },
    methods: {
      link() {
        let ipc = electron.ipcRenderer
        ipc.send('link')
      },
      close() {
        let ipc = electron.ipcRenderer
        this.connect = false
        ipc.send('close')
        if (this.connect) {
          this.$message('已断开')
        } else this.$message('您还未连接')
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