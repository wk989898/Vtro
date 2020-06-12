<template>
  <div class="main">
  <el-menu :default-active="activeIndex" class="el-menu" mode="horizontal" @select="select">
    <el-menu-item index="nodes">列表</el-menu-item>
    <el-submenu index="add-link">
      <template slot="title">添加节点</template>
      <el-menu-item index="sub">订阅</el-menu-item>
      <el-menu-item index="add">手动添加</el-menu-item>
    </el-submenu>
    <el-menu-item index="set">设置</el-menu-item>
    <el-submenu index="log">
      <template slot="title">日志</template>
      <el-menu-item index="trojan-log">trojan日志</el-menu-item>
      <el-menu-item index="link-log">连接日志</el-menu-item>
    </el-submenu>
    <el-menu-item index="pac">
      更新pac
      <!-- <el-popconfirm
  confirmButtonText='确定'
  cancelButtonText='取消'
  icon="el-icon-info"
  iconColor="green"
  @Confirm="confirm"
  title="确定更新pac吗？"
>
        <div class="el-submenu__title" slot="reference">更新pac</div>
      </el-popconfirm> -->
    </el-menu-item>
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
        activeIndex:'nodes',
      }
    },
    components: {
      links,
      back,
    },
    created() {
      // this.$router.push(`/`)
      // test
      // ipc.send('test')
      // ipc.on('test-replay', (e, r) => {
      //   console.log(r)
      // })
    },
    methods:{
      select(index){
        console.log(index);
        if(/pac|log/.test(index)){
          ipc.send(index)
          return ;
        }
        this.$router.push(`/${index}`)
      },
      // confirm(){
      //   console.log('confirm');
      // }
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
  .el-menu{
    z-index: 99;
  }
  .content{
    margin-top: 5%;
  }
</style>