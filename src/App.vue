<template>
  <div class="main">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="连接" name="1">
        <links/>
      </el-collapse-item>
      <el-collapse-item :title="type" name="2">
        <keep-alive>
          <router-view/>
        </keep-alive>
      </el-collapse-item>
    </el-collapse>
    <back/>
  </div>
</template>

<script>
import links from './pages/links'
import back from './components/back'

export default {
  name: 'App',
  data() {
    return {
      connect: false,
      activeNames: ['1', '2'],
      type: '节点列表',
      now: null,
      error: null
    }
  },
  components: {
    links, back
  },
  created() {
    this.$router.push(`/`)
  },
  mounted() {
    window.ipc = electron.ipcRenderer
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
  },
  methods: {
  }
}
</script>
<style>
body::-webkit-scrollbar {
  display: none;
}
body {
  margin: 0;
  padding: 0;
  color: #606266;
}
.main {
  padding: 20px;
  padding-top: 3px;
}
</style>