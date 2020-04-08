<template>
  <div class="main">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="连接" name="1">
        <el-button type="primary" id="trojan" @click="connect=true">连接</el-button>
        <el-button type="primary" id="exit" @click="connect=false">exit</el-button>
        <el-switch v-model="connect" disabled active-color="#13ce66" inactive-color="#ff4949" style="z-index:9">
        </el-switch>
      </el-collapse-item>
      <el-collapse-item :title="type" name="2">
        <keep-alive>
          <router-view/>
        </keep-alive>
      </el-collapse-item>
    </el-collapse>

    <el-backtop target=".main" @click="back" class="el-icon-arrow-left">
      <span>返回</span>
    </el-backtop>
  </div>
</template>

<script>
  export default {
    name: 'App',
    data() {
      return {
        connect: false,
        activeNames: ['1'],
        type:'节点列表'
      }
    },
    created() {
      this.$router.push(`/`)
    },
    mounted() {
      let o={
        sub:'订阅',
        ping:'ping',
        add:'添加',
        set:'设置',
        lists:'节点列表'
      }
      let ipc = electron.ipcRenderer
      let route = ['sub', 'ping', 'add', 'set','lists']
      route.forEach(v => {
        ipc.on(v, (e, arg) => {
          this.$router.push(`/${v}`)
          this.type=o[v]
          console.log(this.$route);
        })
      })
    },
    methods:{
      back(){
        this.$router.push('/')
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
</style>