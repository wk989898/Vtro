<template>
  <div>
    <el-form ref="form" :model="form" label-width="80px">
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
        <el-input type="textarea" v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="add">添加</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        form: {
          addr: '',
          port: '',
          password: '',
          name: ''
        }
      }
    },
    methods: {
      add() {
        let form = this.form
        let data = {
          addr: form.addr,
          port: form.port,
          name: form.name,
          password: form.password,
          ping: 0,
          allow: 1
        }
        this.$global.lists && this.$global.lists.unshift(data)
        let ipc = electron.ipcRenderer
        ipc.send('add-list', {
          data
        })
        this.$router.push('/')
      }
    }
  }
</script>
<style scoped>
  textarea {
    width: 35%;
    height: 20%;
  }
</style>