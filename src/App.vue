<template>
  <div class="main">
    <el-menu :default-active="activeIndex" class="el-menu" mode="horizontal" @select="select">
      <el-menu-item index="nodes">列表</el-menu-item>
      <el-submenu index="add-link">
        <template slot="title">添加节点</template>
        <el-menu-item index="sub">订阅</el-menu-item>
        <el-menu-item index="add">手动添加</el-menu-item>
      </el-submenu>
      <el-menu-item index="set" id="go_set">设置</el-menu-item>
      <el-submenu index="log">
        <template slot="title">日志</template>
        <el-menu-item index="trojan-log">trojan日志</el-menu-item>
        <el-menu-item index="link-log">连接日志</el-menu-item>
      </el-submenu>
      <el-submenu index="_pac">
        <template slot="title">更新pac</template>
        <el-menu-item index="pac">更新pac</el-menu-item>
      </el-submenu>
    </el-menu>

  <div class="content">
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>

    <back />
    <links />
  </div>
</template>

<script>
  import links from './pages/links'
  import back from './components/back'
  export default {
    name: 'App',
    data() {
      return {
        activeIndex: 'nodes',
      }
    },
    components: {
      links,
      back,
    },
    created() {
      this.$router.push(`/set`)
      this.$nextTick(() => {
        this.$router.push(`/`)
      })
      // test
      // ipc.send('test')
      // ipc.on('test-replay', (e, r) => {
      //   console.log(r)
      // })
    },
    methods: {
      select(index) {
        if (/pac|log/.test(index)) {
          ipc.send(index)
          return;
        }
        this.$router.push(`/${index}`)
      },
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
  .el-menu {
    position: sticky !important;
    top: 0;
    z-index: 99;
  }
  .content {
    margin-top: 5%;
  }
</style>