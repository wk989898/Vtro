<template>
  <div>
    <el-tabs :tab-position="tabPosition" style="height: 200px;">
      <el-tab-pane label="代理设置">
        <el-radio v-model="radio" label="global">全局代理</el-radio>
        <el-radio v-model="radio" label="pac">pac</el-radio>
        <el-radio v-model="radio" label="off">关闭代理</el-radio>
      </el-tab-pane>
      <el-tab-pane label="配置管理">配置管理</el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        radio: 'pac',
        tabPosition: 'right'
      }
    },
    watch: {
      'radio': function(newval) {
        let ipc = electron.ipcRenderer
        this.$emit('changeproxy',newval)
        ipc.send('close',newval)
      }
    }
  }
</script>
<style>

</style>