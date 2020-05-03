<template>
  <div>
    <div v-for="(item,index) in subs" :key="index" class="subs">
      {{item}}
      <el-button type="danger" @click="remove(index)" icon="el-icon-delete" circle></el-button>
    </div>
    <br/>
    <el-input placeholder="输入订阅地址" v-model="sub" clearable />
    <el-button plain @click="update">更新订阅</el-button>
    <div v-show="confirm">无效的地址~~</div>
  </div>
</template>

<script>
  import Trojan from '../../trojan/trojan'
  export default {
    data() {
      return {
        sub: '',
        subs: [],
        confirm: false
      }
    },
    activated() {
      let ipc = electron.ipcRenderer
      ipc.send('get-sub')
    },
    mounted() {
      let ipc = electron.ipcRenderer
      ipc.on('subs', (e, arg) => {
        this.subs = arg
      })
      ipc.on('removed', (e, arg) => {
        ipc.send('get-sub')
      })
    },
    methods: {
      async update() {
        let ipc = electron.ipcRenderer
        this.sub && this.subs.push(this.sub)
        let nodes = [],
          i = 0,
          j = this.subs.length
        for (; i < j; i++)
          await this.$axios.get(this.subs[i]).then(res => {
            nodes.push(Trojan.subscribe(res.data))
          }).catch(e => {
            console.log(e)
            if (!this.confirm) this.confirm = true
          })
        nodes=this.$global.nodes = nodes.flat(Infinity)
        
        ipc.send('update', {
          nodes,
          sub: this.sub
        })
        this.confirm = false
        this.$router.push('/')
      },
      remove(i) {
        let ipc = electron.ipcRenderer
        console.log(this.subs[i])
        ipc.send('remove-sub', this.subs[i])
      }
    }
  }
</script>
<style scoped>
  input {
    height: 50%;
    width: 70%;
    display: block;
  }
  .subs {
    padding: 3px 10px;
    border: 1px solid #eee;
    border-bottom: 0;
    background-color: #ccc;
  }
  .subs button {
    margin-left: 80px;
  }
</style>