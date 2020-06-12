<template>
  <div>
    <el-backtop  @click="backtop" bottom="60" style="z-index:999"/>
  </div>
</template>

<script>
export default {
methods:{
  backtop(){
    window.scrollTo(0,0)
  }
}
}

</script>
<style>
</style>