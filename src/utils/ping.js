
/**
 * @param {Host} host 
 * @param {Callback} cb 
 */
export function _ping(host, cb) {
  ping.promise.probe(host.addr, {
    timeout: 10
  }).then(cb)
}
/**
 * @param {Host} host 
 * @param {Callback} cb 
 */
export function _tcping(host, cb) {
  tcping({
    address: host.ip || host.addr,
    port: host.port || 443,
    attempts: 5,
  }).then(cb)
}
/**
 * ping test
 * @param {Array<Host>} lists 
 */
export function makeping(lists) {
  lists.forEach(list => {
    // list.ping = 'wait'
    _ping(list, res => {
      list.ping = parseInt(res.avg) || parseInt(res.min) || 'fail'
    })
  })
}
/**
 * tcping test
 * @param {Array<Host>} lists 
 */
export function maketcping(lists) {
  lists.forEach(list => {
    list.ping = 'wait'
    _tcping(list, res => {
      list.ping = parseInt(res.avg) || parseInt(res.min) || 'fail'
    })
  })
}

/**
 * @typedef {{ip:string|number,addr:'string',[props:string]:string}} Host
 * @callback Callback
 */

