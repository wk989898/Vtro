/**
 * trojan format
 * @author wk989898
 * @example trojan格式
 * `trojan://password@ip:port?allowInsecure=1&peer=addr#name`
 */
class Trojan {
  DecodeBase64(data) {
    let buf = new Buffer.from(data, 'base64')
    return buf.toString('utf-8')
  }
  toTrojan(link) {
    if (!(/^trojan/.test(link))) return;
    link = link.replace(/^trojan\:\/\//, '')
    //  split(/\@|\??allowInsecure=|\&?peer=/)
    let arr = link.split(/\@|\:|\??allowInsecure=|&?peer=|\#/)
    let json = Object.create(null)
    json.password = arr[0]
    json.ip = arr[1]
    json.port = arr[2]
    json.allow = arr[3]
    json.addr = arr[4]
    json.name = decodeURI(arr[5])
    // json.ping = 0
    return json
  }
  subscribe(txt) {
    let arr = txt.split('_')
    let str = '',result = []
    arr.forEach(v => {
      str+=this.DecodeBase64(v)
    })
    let links = str.split('\n')
    links.forEach(link => {
      let t = this.toTrojan(link)
      t && result.push(t)
    })
    return result
  }
  share(node) {
    const { ip, port, addr, password, allow, name } = node
    return `trojan://${password}@${ip}:${port}?allowInsecure=${allow}&peer=${addr}#${name}`
  }
}
module.exports = new Trojan()
