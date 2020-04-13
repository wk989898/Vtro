<template>
  <div>
    <div>
      <el-tag type="info" effect="dark">链接</el-tag>
      <el-input placeholder="请输入链接" v-model="tro" clearable/>
      <el-button type="primary" @click="addtro">添加</el-button>
    </div>
    <el-divider></el-divider>
    <el-tag type="info" effect="dark">手动</el-tag>
    <el-form ref="form" :model="form" label-width="50px">
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
  import Trojan from '../../trojan/trojan'
  export default {
    data() {
      return {
        form: {
          addr: '',
          port: '',
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
          addr: form.addr,
          port: form.port,
          name: form.name,
          password: form.password,
          ping: 0,
          allow: 1
        }
        if (typeof form.addr=='string' && typeof from.port=='number' && form.name && form.password)
          this.addlist(data)
          else this.$message('请输入正确的格式!')
      },
      addtro() {
        let data = Trojan.toTrojan(this.tro)
        this.addlist(data)
      },
      addlist(data) {
        let ipc = electron.ipcRenderer
        this.$global.lists && this.$global.lists.unshift(data)
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