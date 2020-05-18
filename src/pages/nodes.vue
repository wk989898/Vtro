<template>
  <div class="nodes">
    <el-table :data="nodes" border style="width: 100%" :row-class-name="tableRowClassName" @row-dblclick="select" @row-contextmenu="contextmenu">
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
      <div class="menu" @click="contextClick('delete',$event)">删除</div>
      <div class="menu" @click="contextClick('update',$event)">修改</div>
      <div class="menu" @click="contextClick('ping',$event)">ping</div>
      <div class="menu" @click="contextClick('tcping',$event)">tcp-ping</div>
      <div class="menu" @click="contextClick('night',$event)">设置为夜晚节点</div>
      <div class="menu" @click="contextClick('share',$event)">分享节点</div>
    </div>
  </div>
</template>

<script>
  import {
    makeping,
    maketcping,
    _ping,
    _tcping
  } from '../utils/ping'
  import Trojan from '../utils/trojan'
  import Form from '../components/form.vue'
  import QRcode from "../components/QRcode.vue";
  export default {
    data() {
      return {
        nodes: null,
        node: null,
        idx: null
      }
    },
    mounted() {
      let ipc = electron.ipcRenderer
      ipc.send('get-nodes')
      ipc.on('update-nodes', (e, arg) => {
        console.log('update-nodes')
        this.nodes = arg
        if (!this.nodes[0].ping) this.nodes.forEach(v => {
          this.$set(v, 'ping', 0)
        })
        // this.$forceUpdate()
      }).on('ping', e => {
        makeping(this.nodes)
      }).on('tcp-ping', e => {
        maketcping(this.nodes)
      }).on('deleted', (e, arg) => {
        ipc.send('get-nodes')
      })
    },
    methods: {
      tableRowClassName({
        row,
        rowIndex
      }) {
        if (rowIndex === this.idx) return 'select-row';
        return '';
      },
      select(e, r, ele) {
        this.nodes.forEach((v, i) => {
          if (v === e) this.idx = i
        })
        console.log('select node index:', this.idx)
        let ipc = electron.ipcRenderer
        ipc.send('change-linkNode', e)
      },
      contextmenu(r, d, e) {
        let meun = this.$refs.meun
        // node为选中节点
        this.node = r
        let length = menu.children.length
        menu.style.left = e.pageX + 'px'
        menu.style.top = e.pageY + 'px'
        menu.style.height = `${30*length}px`
      },
      contextClick(type, e) {
        e.stopPropagation()
        let ipc = electron.ipcRenderer
        let node = this.node,
          self = this
        if (type === 'delete') {
          ipc.send('delete-node', node.ip)
        } else if (type === 'update') {
          const h = this.$createElement
          this.$msgbox({
            title: '修改节点信息',
            message: h(Form, {
              props: {
                form: node
              }
            }),
            showCancelButton: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
          }).then(action => {
            ipc.send('update-node', self.nodes)
          }).catch(e => {})
        } else if (type === 'tcping') {
          _tcping(node, res => {
            let result = parseInt(res.avg) || parseInt(res.min) || -1
            self.nodes.forEach((v, i) => {
              if (v === node) v.ping = result
            })
          })
        } else if (type === 'ping') {
          _ping(node, res => {
            let result = parseInt(res.avg) || parseInt(res.min) || -1
            self.nodes.forEach((v, i) => {
              if (v === node) v.ping = result
            })
          })
        } else if (type === 'night') {
          ipc.send('change-nightNode', node)
        } else if (type === 'share') {
          let trojan = Trojan.share(node)
          const h = this.$createElement
          this.$msgbox({
              title: '分享节点',
              message: h(QRcode, {
                props: {
                  trojan
                }
              })
            })
            .finally(() => this.$message('已经复制到粘贴板~'))
        }
        this.$refs.meun.style.height = '0'
      },
    }
  }
</script>
<style>
  .nodes {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin: 10px;
    margin-right: 20px;
    cursor: default;
  }
  #menu {
    height: 0;
    width: 130px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    position: absolute;
    background: #fff;
    z-index: 9999;
    cursor: default;
  }
  #menu .menu {
    width: 110px;
    height: 30px;
    border-bottom: 1px solid #ccc;
    line-height: 30px;
    padding: 0 10px;
  }
  #menu .menu:hover {
    background: #ccc;
  }
  .el-table .select-row {
    background: rgb(172, 255, 208);
  }
</style>