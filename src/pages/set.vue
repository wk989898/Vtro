<template>
  <div>
    <el-tabs :tab-position="tabPosition">
      <el-tab-pane label="代理设置">
        <el-radio v-model="proxy" label="global">全局代理</el-radio>
        <el-radio v-model="proxy" label="pac">pac</el-radio>
        <el-radio v-model="proxy" label="off">关闭代理</el-radio>
      </el-tab-pane>
      <el-tab-pane label="时间分流(夜间节点)">
        <el-time-select placeholder="起始时间" v-model="startTime" :picker-options="{start: '00:00', step: '00:15', end: '23:45'}">
        </el-time-select>
        <el-time-select placeholder="结束时间" v-model="endTime" :picker-options="{ start: '00:00',step: '00:15',end: '23:45'}">
        </el-time-select>
        <el-button @click="selectNode">更改</el-button>
        <p>夜间节点：{{night?night.name:'暂无设置'}}</p>
      </el-tab-pane>
      <el-tab-pane label="开机启动">
        <label>开机启动：</label>
        <el-switch v-model="login" active-color="#13ce66" inactive-color="#ff4949" @change="changeLogin" />
        <p>可能会不生效~</p>
      </el-tab-pane>
      <el-tab-pane label="监听端口" class="listen">
        <label for="socks">socks:</label>
        <el-input v-model="listen[0]" name="socks" />
        <label for="http">http:</label>
        <el-input v-model="listen[1]" name="http" />
        <label for="_pac">pac:</label>
        <el-input v-model="listen[2]" name="_pac" />
        <el-button @click="portReset">更改</el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import {
    calcTime
  } from '../utils/time'
  import {
    clearTimeout
  } from 'timers';
  export default {
    data() {
      return {
        tabPosition: 'right',
        mode: null,
        login: false,
        proxy: null,
        startTime: null,
        endTime: null,
        night: null,
        pid1: null,
        pid2: null,
        listen: []
      }
    },
    mounted() {
      ipc.send('get-login')
      ipc.on('config', (e, conf) => {
        let {
          proxy,
          night,
          mode,
          time: {
            startTime,
            endTime
          },
          listen
        } = conf
        this.proxy = proxy
        this.startTime = startTime
        this.endTime = endTime
        this.night = night
        this.mode = mode
        this.listen = listen
      }).on('login', (e, login) => {
        this.login = login
      }).on('mode', () => {
        ipc.send('getConf')
        if (this.$global.link) ipc.send('link')
      })
      setTimeout(() => {
        this.openNight({
          startTime: this.startTime,
          endTime: this.endTime
        })
      }, 1000)
    },
    watch: {
      proxy: function(newval, old) {
        if (!old) return;
        ipc.send('setConf', {
          proxy: newval
        })
        if (this.$global.link) setTimeout(() => {
          ipc.send('link')
        }, 1000)
      },
    },
    methods: {
      changeLogin(e) {
        ipc.send('set-login', e)
      },
      selectNode() {
        if (this.$global.pid1) {
          window.clearTimeout(this.$global.pid1)
          this.$global.pid1 = null
        }
        if (this.$global.pid2) {
          window.clearTimeout(this.$global.pid2)
          this.$global.pid2 = null
        }
        const time = {
          startTime: this.startTime,
          endTime: this.endTime
        }
        ipc.send('setConf', {
          time
        })
        if (!this.night) {
          return this.$message('请确认是否有夜间节点~')
        }
        const tem = this.openNight(time)
        tem && this.$message('更改成功')
      },
      timer(mode, timeout, cb) {
        return window.setTimeout(() => {
          ipc.send('change-mode', mode)
        }, timeout);
      },
      openNight(time) {
        if (this.$global.pid1 || this.$global.pid2) return false;
        const [isOpen, last, night = 0] = calcTime(time)
        if (last === 0) {
          this.$message('设置夜间节点无效')
          return false
        }
        console.log('time.js', isOpen, last, night)
        night && this.mode === 'night' && this.timer('day', 0)
        this.$global.pid1 = this.timer('night', night * 1000)
        this.$global.pid2 = this.timer('day', last * 1000)
        return true
      },
      portReset() {
        const max = 1 << 16
        let isPort=false
        const listen = this.listen.map((v, i) => {
          v = Number(v)
          if (v >= max || v <= 0) {
            this.$message('无效的端口')
            isPort=true
            return [1080, 1081, 1082][i]
          }
          return v
        })
        if(isPort) return ;
        ipc.send('setConf', {
          listen
        })
        if (this.$global.link) setTimeout(() => {
          ipc.send('link')
        }, 1000)
      }
    }
  }
</script>
<style scoped>
  .listen {
    font-size: 14px;
    margin: 0 0 30px 10px;
  }
  .listen button {
    margin-top: 3px;
  }
</style>