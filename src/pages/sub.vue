<template>
  <div>
    <div v-for="(item,index) in subs" :key="index" class="subs">
      <input type="text" :value="item" @blur="subs[index]=$event.target.value"/>
      <el-button type="danger" @click="remove(index)" icon="el-icon-delete" circle title="删除"/>
    </div>
    <br/>
    <el-input class="sub" placeholder="输入订阅地址" v-model="sub" clearable />
    <el-button plain type="success" @click="update">更新订阅</el-button>
    <div>{{confirm}}</div>
  </div>
</template>

<script>
  import Trojan from '../utils/trojan'
  import {Now} from '../utils/time'
  export default {
    data() {
      return {
        test:1,
        sub: null,
        subs: [],
        confirm: '点击订阅可以修改~'
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
        this.confirm=''
        const temp=this.sub?this.sub:this.subs[0]
        if(!temp) {
          return this.$message("请输入订阅！");
        }
        const list = Array.from(new Set(this.subs).add(temp))
        console.time('axios')
        let nodes = [],
          i = 0,
          j = list.length
        for (; i < j; i++)
        //
          // nodes.push(this.$axios.get(list[i]))
          // await this.$axios.all(nodes).then(this.$axios.spread((...res) => {
          //   nodes=Trojan.subscribe(res[0].data)
          // })).catch(e => {
          //   console.log(e)
          //   if (!this.confirm) this.confirm = true
          // })
        // 
        await this.$axios.get(list[i]).then(res => {
          nodes.push(Trojan.subscribe(res.data))
        }).catch(e => {
          console.log(e)
          this.confirm+=`can't get subscribe from ${list[i]}\n`
        })
        console.timeEnd('axios')
        nodes=this.$global.nodes = nodes.flat(Infinity).filter(v=>v!==null)
        ipc.send('update', {
          nodes,
          sub: list
        })
        setTimeout(() => {
          ipc.send('get-nodes')
        }, 1000);
        this.$notify({
          title: '订阅',
          message: `订阅已更新\n${Now()}`,
          type: 'success',
          duration: 1500,
          showClose: false
        });
      },
      remove(i) {
        let ipc = electron.ipcRenderer
        console.log('will remove:',this.subs[i])
        ipc.send('remove-sub', this.subs[i])
      }
    }
  }
</script>
<style scoped>
  .sub {
    height: 50%;
    width: 70%;
    display: block;
    margin-bottom: 10px;
  }
  .subs {
    padding: 3px 10px;
    border-radius: 5px;
    background-color: #eee;
    margin-right: 15px;
  }
  .subs::after{
    content: '';
    clear: both;
    display: table;
  }
  .subs>input {
    margin: 0;
    padding: 0;
    background: transparent;
    width: 80%;
    border: none;
    word-wrap: break-word;
    font-size: 18px;
    outline: none;
    cursor: default;
  }
  .subs>button {
    margin:0 5%;
  }
</style>