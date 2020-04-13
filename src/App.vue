<template>
  <div class="main">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="连接" name="1">
        <links :proxy="mode" :now="now"/>
      </el-collapse-item>
      <el-collapse-item :title="type" name="2">
        <keep-alive>
          <router-view @changeproxy="changeproxy" @makenow="changenow"/>
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
        type: '节点列表',
        mode: 'pac',
        now:''
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
      window.ipc = electron.ipcRenderer
      let ipc = electron.ipcRenderer
      let o = {
        sub: '订阅',
        add: '添加',
        set: '设置',
        lists: '节点列表'
      }
      let route = ['sub',  'add', 'set', 'lists']
      route.forEach(v => {
        ipc.on(v, (e, arg) => {
            this.$router.push(`/${v}`)
            this.type = o[v]
        })
      })
    },
    methods: {
      changeproxy(e) {
        this.mode = e
      },
      changenow(e){
        this.now=e
      }
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