<template>
  <div>
    <el-button type="primary" id="link" @click="link">连接</el-button>
    <el-button type="primary" id="close" @click="close">关闭</el-button>
    <el-switch
      v-model="connect"
      disabled
      active-color="#13ce66"
      inactive-color="#ff4949"
      style="z-index:9"
    ></el-switch>
  </div>
</template>

<script>
export default {
  data(){
    return {
      connect:false
    }
  },
  mounted() {
    this.closed()
  },
  methods: {
    link() {
      let ipc = electron.ipcRenderer
      this.connect = true
      this.$message('已连接')
      // 连接方式
      ipc.send('link', 'pac')
    },
    close() {
      let ipc = electron.ipcRenderer
      this.connect = false
      ipc.send('close')
      if (this.connect) {
        this.$message('已断开')
      } else this.$message('您还未连接')
    },
    closed() {
      let ipc = electron.ipcRenderer
      ipc.on('closed', (e, arg) => {
        this.connect = false
        arg&&console.log(arg)
      })
    }
  }
}
</script>
<style>
</style>