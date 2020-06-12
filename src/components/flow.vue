<template>
  <div class="flow">
    <p>下载:{{flows[0]}}</p>
    <p>上传:{{flows[1]}}</p>
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
  width: 20%;
  white-space: nowrap;
  text-overflow: ellipsis;
  opacity: .8;
}
.flow>p{
  margin: 0;
}
.flow>p:first-child{
  color: blue
}
.flow>p:last-child{
  color: green
}
</style>