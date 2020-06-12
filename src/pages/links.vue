<template>
  <div class="links">
    <flow />
    <div class="link">
      <el-switch @change="changelink" v-model="connect" active-text="开启" inactive-text="关闭" />
      <p class="now">{{now.name}}</p>
    </div>
  </div>
</template>

<script>
  import {
    calcTime
  } from '../utils/time'
  import flow from '../components/flow'
  export default {
    data() {
      return {
        connect: false,
        now: ''
      }
    },
    components: {
      flow
    },
    mounted() {
      ipc.send('getConf')
      ipc.on('linked', () => {
        this.connect = true
        this.$message({
          message: '已连接',
          duration: 1000
        })
        this.$global.link = true
      }).on('closed', () => {
        this.connect = false
        if (this.$global.link)
          this.$message({
            message: '已断开',
            duration: 1000
          })
        this.$global.link = false
      }).on('config', (e, conf) => {
        console.log(conf.mode)
        const now = conf.mode === 'day' ? conf.day : conf.night.addr ? conf.night : conf.day
        if (this.$global.link && conf.mode === this.now.mode && now.name !== this.now.name) {
          // 已经连接 && mode相同 && 名字相同
          ipc.send('link')
          console.log('re-connect', conf.mode);
        }
        this.$global.now = this.now = now
        this.now.mode = conf.mode
      })
      ipc.send('link')
    },
    methods: {
      changelink(e) {
        if (e) return ipc.send('link')
        return ipc.send('close')
      }
    }
  }
</script>
<style scoped>
  .now {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: black;
  }
  .links {
    position: fixed;
    display: flex;
    align-content: space-between;
    justify-content: center;
    padding: 1%;
    z-index: 99;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow: 0 -2px 4px rgba(1, 1, 1, .1);
    background-color: #fff;
  }
  .links p {
    margin: 0;
  }
  .link {
    flex: 1;
    margin-left: 5px;
  }
</style>