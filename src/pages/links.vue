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
  mounted() {
    this.closed()
  },
  methods: {
    link() {
      // let ipc = electron.ipcRenderer
      this.connect = true
      this.$message('已连接')
      ipc.send('link')
    },
    close() {
      // let ipc = electron.ipcRenderer
      if (this.connect) {
        ipc.send('close')
        this.connect = false
        this.$message('已断开')
      } else this.$message('您还未连接')
    },
    closed() {
      let ipc = electron.ipcRenderer
      ipc.on('closed', (e, arg) => {
        console.log('closed!')
        this.connect = false
      })
    }
  }
}

</script>
<style>
</style>