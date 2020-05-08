<template>
  <div class="main">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="连接" name="1">
        <links :proxy="mode" :now="now" />
      </el-collapse-item>
      <el-collapse-item :title="type" name="2">
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
  import back from './components/back'
  export default {
    name: 'App',
    data() {
      return {
        activeNames: ['1', '2'],
        type: '节点列表'
      }
    },
    components: {
      links,
      back
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
        set: '设置',
        nodes: '节点列表'
      }
      let route = ['sub', 'add', 'set', 'nodes']
      route.forEach(v => {
        ipc.on(v, (e, arg) => {
          this.$router.push(`/${v}`)
          this.type = o[v]
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