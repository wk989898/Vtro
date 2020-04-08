<template>
  <div>
    <el-input v-model="sub" placeholder="输入订阅地址"></el-input>
    <button @click="update">更新订阅</button>
  </div>
</template>

<script>
  import Trojan from '../../trojan/trojan'
  export default {
    data() {
      return {
        sub: ''
      }
    },
    methods: {
      update() {
        let ipc = electron.ipcRenderer
        this.$axios.get(this.sub).then(res => {
          let data=this.$global.lists = Trojan.subscribe(res.data)

          ipc.send('update',{data})

          // this.$router.go('-1')
        }).catch(e => {
          console.error(e);
        })
      },
    }
  }
</script>
<style scoped>
input{
  height: 50%;
  width: 70%;
  display: block;
}
</style>