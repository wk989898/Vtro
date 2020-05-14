/**
 * var pingResult=[]
export async function makePing(hosts, cb) {
  if (pingResult.length !== 0) pingResult = []
  const start = Date.now()
  await Promise.all(hosts.map(host => {
    return cb(host)
  })).then(res => {
    res.forEach(v => {
      let time = parseInt(v.min) || -1
      pingResult.push(time)
    })
  }).catch(e => appendLog(e))
  console.log(`ping cost:${Date.now() - start}ms\nnum:${pingResult.length}`)
  return pingResult
}
export function getPing(hosts) {
  return  makePing(hosts, host => {
    return ping.promise.probe(host.addr, {
      timeout: 10
    })
  })
}
export function getTcping(hosts) {
  return  makePing(hosts, host => {
    return tcping({
      address: host.ip || host.addr,
      port: host.port || 443,
      attempts: 3,
    })
  })
}
 */

export function _ping(host, cb) {
  ping.promise.probe(host.addr, {
    timeout: 10
  }).then(cb)
}
export function _tcping(host, cb) {
  tcping({
    address: host.ip || host.addr,
    port: host.port || 443,
    attempts: 5,
  }).then(cb)
}
export function makeping(lists) {
  lists.forEach(list => {
    // list.ping = 'wait'
    _ping(list, res => {
      list.ping = parseInt(res.avg) || parseInt(res.min) || 'fail'
    })
  })
}
export function maketcping(lists) {
  lists.forEach(list => {
    list.ping = 'wait'
    _tcping(list, res => {
      list.ping = parseInt(res.avg) || parseInt(res.min) || 'fail'
    })
  })
}

