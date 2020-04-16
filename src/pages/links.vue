<template>
  <div>
    <el-button type="primary" id="link" @click="link">连接</el-button>
    <el-button type="primary" id="close" @click="close">关闭</el-button>
    <el-switch v-model="connect" disabled active-color="#13ce66" inactive-color="#ff4949" style="z-index:9"></el-switch>
    <span class="now">连接节点：{{now}}</span>
  </div>
</template>

<script>
  export default {
    props: {
      proxy: {
        type: String,
        default: 'pac'
      },
      now: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        connect: false
      }
    },
    watch: {
      proxy: function() {
        this.connect = false
      }
    },
    mounted() {
      let ipc = electron.ipcRenderer
      this.closed(ipc)
      this.getnow(ipc)
      this.setnow(ipc)
      ipc.on('linked', () => {
        this.connect = true
        this.$message('已连接')
      })
    },
    methods: {
      getnow(ipc) {
        ipc.send('getnow')
      },
      setnow(ipc) {
        ipc.once('setnow', (e, arg) => {
          arg && (this.now = this.$global.now = arg)
        })
      },
      link() {
        let ipc = electron.ipcRenderer
        ipc.send('link', this.proxy)
      },
      close() {
        let ipc = electron.ipcRenderer
        this.connect = false
        ipc.send('close')
        if (this.connect) {
          this.$message('已断开')
        } else this.$message('您还未连接')
      },
      closed(ipc) {
        ipc.on('closed', (e, arg) => {
          arg && console.log(arg.err.message)
        })
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