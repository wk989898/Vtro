<template>
  <div>
    <el-input v-model="sub" placeholder="输入订阅地址"></el-input>
    <button @click="update">更新订阅</button>
    <div v-show="confirm">无效的地址~</div>
  </div>
</template>

<script>
import Trojan from '../../trojan/trojan'
export default {
  data() {
    return {
      sub: '',
      confirm:false
    }
  },
  activated() {
    let ipc = electron.ipcRenderer
    ipc.send('get-sub')
    ipc.on('sub', (e, arg) => {
      this.sub = arg
    })
  },
  methods: {
    update() {
      let ipc = electron.ipcRenderer
      this.$axios.get(this.sub).then(res => {
        console.log(Trojan)
        let data = this.$global.lists = Trojan.subscribe(res.data)
        ipc.send('update', { data, sub: this.sub })
        this.confirm=false
        this.$router.push('/')
      }).catch(e => {
        console.log(e)
        this.confirm=true
      })
    },
  }
}
</script>
<style scoped>
input {
  height: 50%;
  width: 70%;
  display: block;
}
</style>