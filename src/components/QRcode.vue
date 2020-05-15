<template>
  <div>
    <div id="QRCode" style="width:256px;heigth:256px;margin:0 auto;"></div>
    <p>{{trojan}}</p>
  </div>
</template>

<script>
  import QRCode from "../utils/qrcode.js"
  export default {
    props: {
      trojan: {
        default: ''
      }
    },
    data() {
      return {
        qrcode: null
      }
    },
    mounted() {
      const trojan = this.trojan
      this.qrcode = new QRCode(document.getElementById("QRCode"), trojan)
      navigator.clipboard.writeText(trojan)
    },
    watch: {
      trojan: function(newval) {
        const trojan = this.trojan
        this.qrcode.clear()
        qrcode.makeCode(trojan);
        navigator.clipboard.writeText(trojan)
      }
    }
  }
</script>
<style>

</style>