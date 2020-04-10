<template>
  <div>
    <el-backtop  @click="backtop">
    </el-backtop>
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