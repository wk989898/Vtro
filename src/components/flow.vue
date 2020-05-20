<template>
  <div class="flow">
    <span>下载:{{flows[0]}}</span>
    <span>上传:{{flows[1]}}</span>
  </div>
</template>

<script>
  import {
    convert
  } from "../utils/flow.js";
  export default {
    data() {
      return {
        flows: ['0B', '0B'],
        received:0,
        sent:0
      }
    },
    mounted() {
      let ipc = electron.ipcRenderer
      ipc.on('flow', (e, flows) => {
        this.received+=flows[0]
        this.sent+=flows[1]
        this.flows =[convert(this.received),convert(this.sent)] 
      })
    }
  }
</script>
<style>
.flow{
  position: fixed;
  bottom: 0;
  left: 0;
  background: gray;
  color: white;
  border-radius: 2px;
  padding: 2px 5px;
}
</style>