<template>
  <div class="lists">
    <!-- <div v-for="(item,index) in lists" :key="item.ip"
                         @dblclick="select(index)" @click="i=index" 
                         :class="[{active:idx===index},{hover:i===index},'list']">
                          <i class="el-icon-check" v-show="idx===index"></i>
                          <span :title="item.name?`ip：${item.addr}\nport:${item.port}`:item">
                            {{item.name||item}}</span>
                        </div> -->
    <el-table :data="lists" border style="width: 100%" highlight-current-row @row-dblclick="select" @row-contextmenu="contextmenu">
      <el-table-column prop="ip" label="ip" width="180">
      </el-table-column>
      <el-table-column prop="name" label="名称" width="180">
      </el-table-column>
      <el-table-column prop="addr" label="地址">
      </el-table-column>
      <el-table-column prop="port" label="端口">
      </el-table-column>
      <el-table-column prop="ping" label="ping(ms)">
      </el-table-column>
    </el-table>
    <div id="menu" ref="meun">
      <div class="menu" @click="deletelist">删除</div>
      <div class="menu"></div>
      <div class="menu"></div>
      <div class="menu"></div>
      <div class="menu"></div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        lists: null,
        id: null
      }
    },
    mounted() {
      let ipc = electron.ipcRenderer
      ipc.on('update-lists', (e, arg) => {
        this.lists = this.$global.lists = arg
      })
      ipc.on('ping', e => {
        this.lists.map(list => {
          list.ping = 'wait'
        })
        ipc.send('all-ping', this.lists)
      })
      ipc.on('ping-result', (e, arg) => {
        this.lists.map((list, index) => {
          list.ping = arg[index]
        })
      })
      ipc.on('deleted', e => {
        console.log('deleted')
        ipc.send('get-lists')
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
      select(e) {
        let ipc = electron.ipcRenderer
        ipc.send('change-linklist', e)
        ipc.send('close')
        this.$emit('makenow', e.name)
      },
      contextmenu(r, d, e) {
        let meun = this.$refs.meun
        this.id = r.ip
        menu.style.left = e.clientX + 'px'
        menu.style.top = e.clientY + 'px'
        menu.style.height = '125px'
      },
      deletelist(e) {
        e.stopPropagation()
        console.log(this.id)
        let ipc = electron.ipcRenderer
        ipc.send('delete-list', this.id)
        this.$refs.meun.style.height = '0'
      }
    }
  }
</script>
<style scoped>
  .lists {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin: 10px;
    margin-right: 20px;
  }
  #menu {
    height: 0;
    width: 130px;
    overflow: hidden;
    box-shadow: 0 1px 1px #888, 1px 0 1px #ccc;
    position: absolute;
    background: #eee;
    z-index: 9999;
  }
  #menu .menu {
    width: 110px;
    height: 25px;
    border-bottom: 1px solid #aaa;
    line-height: 25px;
    padding: 0 10px;
  }
  #menu .menu:hover {
    background: #aaa;
  }
</style>