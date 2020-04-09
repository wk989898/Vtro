<template>
  <div class="lists">
    <div
      v-for="(item,index) in lists"
      :key="item.ip"
      class="list"
      @dblclick="select(index)"
      @click="i=index"
      :class="[{active:idx===index},{hover:i===index}]"
    >
      <span>{{item.name||item}}</span>
    </div>
    <el-backtop target=".main"></el-backtop>
  </div>
</template>

<script>
export default {
  data() {
    return {
      i: 0,
      idx: 0,
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
    if ((!this.lists) || (!this.$global.lists)) {
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
      let { password, addr, port, name } = this.lists[index]
      ipcRenderer.send('change-list', {
        password,
        addr,
        port
      })
      this.$global.now=name
    }
  }
}
</script>
<style>
.list {
  height: 30px;
  padding-left: 2em;
  overflow: hidden;
  border: 1px solid black;
  cursor: default;
}
.list span {
  line-height: 30px;
}
.hover {
  background-color: #e1f1f1;
}
.active {
  background-color: burlywood;
}
.current {
  position: absolute;
  right: 30px;
  top: 20px;
  z-index: -9999;
}
.lists {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: 10px;
}
.lists::first-letter {
  border-radius: 2px 2px 0 0;
}
</style>