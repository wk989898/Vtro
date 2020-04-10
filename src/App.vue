<template>
  <div class="main">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="连接" name="1">
        <el-button type="primary" id="link" @click="link">连接</el-button>
        <el-button type="primary" id="close" @click="close">关闭</el-button>
        <el-switch
          v-model="connect"
          disabled
          active-color="#13ce66"
          inactive-color="#ff4949"
          style="z-index:9"
        ></el-switch>
      </el-collapse-item>
      <el-collapse-item :title="type" name="2">
        <keep-alive>
          <router-view/>
        </keep-alive>
      </el-collapse-item>
    </el-collapse>
    <!-- <div v-if="!connect&&error">
    </div>-->
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      connect: false,
      activeNames: ['1'],
      type: '节点列表',
      now: null,
      error: null
    }
  },
  created() {
    this.$router.push(`/`)
  },
  mounted() {
    let ipc = electron.ipcRenderer
    let o = {
      sub: '订阅',
      ping: 'ping',
      add: '添加',
      set: '设置',
      lists: '节点列表'
    }
    let route = ['sub', 'ping', 'add', 'set', 'lists']
    route.forEach(v => {
      ipc.on(v, (e, arg) => {
        this.$router.push(`/${v}`)
        this.type = o[v]
      })
    })
    this.closed(ipc)
  },
  methods: {
    link() {
      let ipc = electron.ipcRenderer
      this.connect = true
      ipc.send('link')
    },
    close() {
      let ipc = electron.ipcRenderer
      this.connect = false
      ipc.send('close')
    },
    closed(ipc) {
      ipc.on('closed', (e, arg) => {
        console.log('closed!')
        this.connect = false
      })
    }
  }
}
</script>
<style>
html {
  overflow: -moz-hidden-unscrollable;
  height: 100%;
}
body::-webkit-scrollbar {
  display: none;
}
body {
  -ms-overflow-style: none;
  height: 100%;
  width: calc(100vw + 18px);
  overflow: auto;
}
.main{
  margin-right:10px; 
  padding: 10px;
  padding-top: 3px;
}
</style>