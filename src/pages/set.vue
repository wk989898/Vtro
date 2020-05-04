<template>
  <div>
    <el-tabs :tab-position="tabPosition" style="height: 200px;">
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
    </el-tabs>
  </div>
</template>

<script>
  import {
    calcTime
  } from '../utils/time'
  export default {
    data() {
      return {
        proxy: 'pac',
        tabPosition: 'right',
        startTime: '19:30',
        endTime: '00:30',
        night: ''
      }
    },
    mounted() {
      let ipc = electron.ipcRenderer
      ipc.send('getConf')
      ipc.on('config', (e, conf) => {
        let {
          proxy,
          night,
          time: {
            startTime,
            endTime
          },
        } = conf
        this.proxy = proxy
        this.startTime = startTime
        this.endTime = endTime
        this.night = night
      })
    },
    watch: {
      'proxy': function(newval) {
        let ipc = electron.ipcRenderer
        ipc.send('setConf', {
          proxy: newval
        })
        ipc.send('link')
      }
    },
    methods: {
      selectNode() {
        const time = {
          startTime: this.startTime,
          endTime: this.endTime
        }
        let ipc = electron.ipcRenderer
        ipc.send('setConf', {
          time
        })
        if (!this.night) {
          return this.$message('请确认是否有夜间节点~')
        }
        const [isOpen, t, bt = 0] = calcTime(time)
        if (t === 0) return;
        setTimeout(() => {
          // 更换夜间节点
          ipc.send('change-linknode', 'night')
          ipc.send('link')
          // 退出夜间节点
          setTimeout(() => {
            ipc.send('change-linknode')
            ipc.send('link')
          }, t)
        }, bt)
        this.$message('更改成功')
      }
    }
  }
</script>
<style>

</style>