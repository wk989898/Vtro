<template>
  <div class="main">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="连接" name="1">
        <links />
      </el-collapse-item>
      <el-collapse-item title="节点" name="2">
        <nodes />
      </el-collapse-item>
      <el-collapse-item :title="type" name="3">
        <keep-alive>
          <router-view />
        </keep-alive>
      </el-collapse-item>
    </el-collapse>
    <back/>
  </div>
</template>

<script>
  import links from './pages/links'
  import nodes from './pages/nodes'
  import back from './components/back'
  export default {
    name: 'App',
    data() {
      return {
        activeNames: ['1', '2', '3'],
        type: '节点列表'
      }
    },
    components: {
      links,
      back,
      nodes
    },
    created() {
      this.$router.push(`/`)
    },
    mounted() {
      let ipc = electron.ipcRenderer
      // test
      ipc.on('test', (e, r) => {
        console.log(r)
      })
      //
      let o = {
        sub: '订阅',
        add: '添加节点',
        set: '设置'
      }
      Object.keys(o).forEach(v => {
        ipc.on(v, (e, arg) => {
          this.$router.push(`/${v}`)
          this.type = o[v]
          this.activeNames = ['1', '3']
        })
      })
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