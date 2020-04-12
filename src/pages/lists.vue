<template>
  <div class="lists">
    <!-- <div v-for="(item,index) in lists" :key="item.ip"
             @dblclick="select(index)" @click="i=index" 
             :class="[{active:idx===index},{hover:i===index},'list']">
              <i class="el-icon-check" v-show="idx===index"></i>
              <span :title="item.name?`ip：${item.addr}\nport:${item.port}`:item">
                {{item.name||item}}</span>
            </div> -->
    <el-table :data="lists" border style="width: 100%" highlight-current-row @current-change="select">
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
  </div>
</template>

<script>
  export default {
    data() {
      return {
        lists: null
      }
    },
    mounted() {
      let ipc = electron.ipcRenderer
      ipc.on('update-lists', (e, arg) => {
        this.lists = this.$global.lists = arg
      })
      ipc.on('ping', e => {
        ipc.send('all-ping', this.lists)
      })
      ipc.on('ping-result', (e, arg) => {
        // this.pings = arg
        console.log(arg)
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
        ipc.send('change-list', e)
        ipc.send('close')
        this.$emit('makenow', e.name)
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
</style>