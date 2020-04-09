/**
 * trojan://B1nBOZ
 * @154.17.12.85:443
 * ?allowInsecure=1&peer=usd85.ovod.me
 * #%E5%B9%B4%E8%B4%B9%C2%B7T%C2%B7%E7%BE%8E%E5%9B%BDDA%C2%B7%E9%AB%98%E9%80%9F%C2%B785%C2%B7NetflixHBO
 */

class Trojan {
  DecodeBase64(data) {
    let buf = new Buffer.from(data, 'base64')
    return buf.toString('utf-8')
  }
  toTrojan(link) {
    if(!(/^trojan/.test(link))) return link
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
    return json
  }
  subscribe(txt){
    let arr=txt.split('_')
    let str='',list
    let result=[]
    list=arr.map(v=>{
      return this.DecodeBase64(v)   
    })
    list.forEach(v=>{
      str+=v
    })
    let links=str.split('\n')
    links.forEach(link=>{
      result.push(this.toTrojan(link))
    })
    return result
  }
}
module.exports= new Trojan()
