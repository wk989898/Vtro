<template>
  <div class="lists">
    <div v-for="(item,index) in lists" :key="item.ip"
     @dblclick="select(index)" @click="i=index" 
     :class="[{active:idx===index},{hover:i===index},'list']">
      <i class="el-icon-check" v-show="idx===index"></i>
      <span :title="item.name?`ip：${item.addr}\nport:${item.port}`:item">
        {{item.name||item}}</span>
    </div>
    <el-backtop target=".main"></el-backtop>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        i: -1,
        idx: -1,
        lists: null
      }
    },
    mounted() {
      let ipc = electron.ipcRenderer
      ipc.once('update-lists', (e, arg) => {
        this.lists = this.$global.lists = arg
        // console.log(this.lists)
      })
    },
    activated() {
      if ((!this.lists) || (!this.$global.lists[0])) {
        let ipc = electron.ipcRenderer
        ipc.send('get-lists')
      } else
        this.lists = this.$global.lists
      this.$forceUpdate()
    },
    methods: {
      select(index) {
        this.idx = index
        let ipcRenderer = electron.ipcRenderer
        let {
          password,
          addr,
          port,
          name
        } = this.lists[index]
        ipcRenderer.send('change-list', {
          password,
          addr,
          port
        })
        this.$global.now = name
      }
    }
  }
</script>
<style scoped>
  .list {
    height: 30px;
    padding-left: 2em;
    padding-right: 2em;
    border: 1px solid black;
    cursor: default;
    overflow: hidden;
  }
  .list span {
    line-height: 30px;
  }
  .hover {
    background-color: #e7e7e7;
  }
  .active {
    background-color: rgb(115, 185, 255);
  }
  .lists {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin: 10px;
    margin-right: 20px;
  }
  .lists:first-child {
    border-radius: 2px 2px 0 0;
  }
</style>