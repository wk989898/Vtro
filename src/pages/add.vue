<template>
  <div>
    <div>
      <el-tag type="info" effect="dark">链接</el-tag>
      <el-input placeholder="请输入链接" v-model="tro" clearable />
      <el-button type="primary" @click="addtro">添加</el-button>
    </div>
    <el-divider></el-divider>
    <el-tag type="info" effect="dark">手动</el-tag>
    <el-form ref="form" :model="form" label-width="50px">
      <el-form-item label="地址">
        <el-input v-model="form.addr" placeholder="xyz.com"></el-input>
      </el-form-item>
      <el-form-item label="端口">
        <el-input v-model="form.port"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" placeholder="请不要使用 @ 符号"></el-input>
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
  import Trojan from '../utils/trojan'
  export default {
    data() {
      return {
        form: {
          addr: '',
          port: 443,
          password: '',
          name: ''
        },
        tro: ''
      }
    },
    methods: {
      add() {
        let form = this.form
        let data = {
          password: form.password,
          ip: '',
          port: parseInt(form.port),
          allow: 1,
          addr: form.addr,
          name: form.name,
          // ping: 0
        }
        if (form.addr && typeof form.addr == 'string' && form.port && typeof form.port == 'number' &&
          form.name && form.password)
          this.addnode(data)
        else this.$message('请输入正确的格式!')
      },
      addtro() {
        let data = Trojan.toTrojan(this.tro)
        this.addnode(data)
      },
      addnode(data) {
        let ipc = electron.ipcRenderer
        ipc.send('add-node', data)
        setTimeout(() => {
          ipc.send('get-nodes')
        }, 1000);
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