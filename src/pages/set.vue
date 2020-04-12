<template>
  <div>
    <el-tabs :tab-position="tabPosition" style="height: 200px;">
      <el-tab-pane label="代理设置">
        <el-radio v-model="radio" label="proxy">全局代理</el-radio>
        <el-radio v-model="radio" label="pac">pac</el-radio>
      </el-tab-pane>
      <el-tab-pane label="配置管理">配置管理</el-tab-pane>
      <el-tab-pane label="角色管理">角色管理</el-tab-pane>
      <el-tab-pane label="定时任务补偿">定时任务补偿</el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        radio: 'pac',
        tabPosition: 'left'
      }
    },
    watch: {
      'radio': function(newval) {
        let ipc = electron.ipcRenderer
        this.$emit('changeproxy',newval)
      }
    }
  }
</script>
<style>

</style>