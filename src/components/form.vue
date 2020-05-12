<template>
  <div class="conf">
    <el-form ref="form" :model="form" label-width="50px">
      <el-form-item label="ip">
        <el-input v-model="form.ip"></el-input>
      </el-form-item>
      <el-form-item label="地址">
        <el-input v-model="form.addr"></el-input>
      </el-form-item>
      <el-form-item label="端口">
        <el-input v-model="form.port"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password"></el-input>
      </el-form-item>
      <el-form-item label="备注">
        <el-input type="textarea" v-model="form.name" style="resize:vertical;max-heigth:100px;"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    props: {
      form: {
        type: 'Object',
        required: true
      }
    }
  }
</script>
<style scoped>
  .conf {
    margin-top: 10px;
  }
</style>