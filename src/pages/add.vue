<template>
  <div>
    <!-- <label for="addr">地址</label>
      <input name="addr" v-model="addr"><br/>
      <label for="port">端口</label>
      <input name="port" v-model="port"><br/>
      <label for="password">密码</label>
      <input name="password" v-model="password"><br/>
      <label for="note">备注</label>
      <textarea name="note" v-model="name" /><br/>
      <div>
        <button @click="add">添加</button>
      </div> -->
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
        let form=this.form
        let data = {
          addr: form.addr,
          port: form.port,
          addr: form.addr,
          name: form.name
        }
        this.$global.lists&&this.$global.lists.unshift(data)
        let ipc = electron.ipcRenderer
        ipc.send('add-list', {
          data
        })
        this.$router.go('/')
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