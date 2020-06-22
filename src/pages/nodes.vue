<template>
  <div class="nodes">
    <div>
      <span>测试连接 </span>
      <el-button round @click="ping('ping')">ping</el-button>
      <el-button round @click="ping">tcp-ping</el-button>
    </div>
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
    <div id="menu" ref="menu">
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
        selectNode: null,
        now: null
      }
    },
    mounted() {
      ipc.send('get-nodes')
      ipc.on('update-nodes', (e, arg) => {
        console.log('update-nodes')
        this.nodes = arg
        this.nodes.forEach((v, i) => {
          this.$set(v, 'ping', 0)
        })
        // this.$forceUpdate()
      }).on('deleted', (e, arg) => {
        ipc.send('get-nodes')
      }).on('config', (e, conf) => {
        const now = conf.mode === 'day' ? conf.day : conf.night.addr ? conf.night : conf.day
        this.now = now
      })
    },
    methods: {
      ping(type) {
        if (type === 'ping') return makeping(this.nodes)
        maketcping(this.nodes)
      },
      tableRowClassName({
        row,
        rowIndex
      }) {
        const nodes = this.nodes
        const now = this.now
        if (now && nodes[rowIndex].ip === now.ip && nodes[rowIndex].name === now.name) {
          return 'select-row'
        }
        if (nodes[rowIndex].ping === 'fail') return 'fail'
        return '';
      },
      select(e, r, ele) {
        this.nodes.forEach((v) => {
          if (v === e) {
            this.selectNode = v
          }
        })
        ipc.send('change-linkNode', e)
      },
      contextmenu(r, d, e) {
        let menu = this.$refs.menu
        // node为选中节点
        this.node = r
        let length = menu.children.length
        menu.style.left = e.pageX + 'px'
        menu.style.top = e.pageY + 'px'
        menu.style.height = `${30*length}px`
      },
      contextClick(type, e) {
        e.stopPropagation()
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
        this.$refs.menu.style.height = '0'
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
    width: 300px;
    height: 30px;
    border-bottom: 1px solid #ccc;
    line-height: 30px;
    padding: 0 10px;
    overflow: hidden;
  }
  #menu .menu:hover {
    background: #ccc;
  }
  .el-table .select-row {
    background: rgb(172, 255, 208);
  }
  .el-table .fail {
    color: red;
  }
</style>