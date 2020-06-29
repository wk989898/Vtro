<template>
  <div class="links">
    <flow />
    <div class="link">
      <el-switch v-model="isLink" active-text="开启" inactive-text="关闭" id="switch" />
      <p class="now">{{ now.name }}</p>
    </div>
    <p :style="test | testColor">url test: {{ test }}ms</p>
  </div>
</template>

<script>
  import {
    calcTime
  } from "../utils/time"
  import flow from "../components/flow"
  import urlTest from "../utils/url-test"
  export default {
    data() {
      return {
        now: {},
        isLink: false,
        test: -1
      }
    },
    components: {
      flow
    },
    watch: {
      isLink: function(v) {
        if (v) return ipc.send("link")
        return ipc.send("close")
      }
    },
    filters: {
      testColor: function(v) {
        const c = "color:"
        v = Number(v) || 0
        if (v === -1) return c + "red"
        else if (v < 1000) return c + "green"
        else return c + "#FBCC00"
      }
    },
    mounted() {
      ipc.send("getConf")
      // 开机自动连接
      ipc.once("config", (e, conf) => {
        let node = conf.day || conf.night
        if (node.ip) this.isLink = true
      })
      ipc
        .on("config", (e, conf) => {
          let now
          if (!conf.night.ip) now = conf.day
          else
            now =
            conf.mode === "day" ?
            conf.day :
            conf.night.addr ?
            conf.night :
            conf.day;
          if (this.isLink && this.now.ip && now.ip !== this.now.ip) {
            // 已经连接 && ip 不相同
            ipc.send("link")
            console.log("re-connect")
          }
          this.now = now
        })
        .on("linked", () => {
          this.$message({
            message: "已连接",
            duration: 1000
          })
          this.test = -1
          urlTest().then(res => {
            this.test = res
          })
        })
        .on("closed", () => {
          if (!this.isLink)
            this.$message({
              message: "已断开",
              duration: 1000
            })
        })
    }
  }
</script>
<style scoped>
  .now {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: black;
  }
  .links {
    position: fixed;
    display: flex;
    align-content: space-between;
    justify-content: center;
    padding: 1%;
    z-index: 99;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow: 0 -2px 4px rgba(1, 1, 1, 0.1);
    background-color: #fff;
  }
  .links p {
    margin: 0;
  }
  .link {
    flex: 1;
    margin-left: 5px;
  }
</style>
