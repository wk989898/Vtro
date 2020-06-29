/**
 * @typedef {{startTime:string,endTime:string}} Time
 * @param {Time} param0
 * @returns {Array<boolean|number>} 
 */
export function calcTime({ startTime, endTime }) {
  if (startTime === endTime) return [false, 0]
  const now = new Date()
  var [starthour, startmin] = startTime.split(':').map(v => Number(v))
  var [endhour, endmin] = endTime.split(':').map(v => Number(v))
  var [hour, min] = [Number(now.getHours()), Number(now.getMinutes())]
  const start = starthour * 60 + startmin
  const end = endhour * 60 + endmin
  const _now = hour * 60 + min
  if (start > end) {
    // 隔夜
    if (_now > start || _now < end) {
      const last = _now > start ? (_now - start + end) : (end - _now)
      return [true, last]
    } else
      return [false, end + 24 * 60 - start, start - _now]
  } else {
    if (_now < start) {
      return [false, start - _now, end - start]
    } else
      return [true, end - _now]
  }

}
/**
 * @returns {string}   e.g. y-m-d h-m-s
 */
export function Now(...args) {
  const [a = '/', b = ' ', c = '-'] = args
  const now = new Date()
  return now.getFullYear().toString() + a +
    now.getMonth().toString().padStart(2, '0') + a +
    now.getDay().toString().padStart(2, '0')
    + b +
    now.getHours().toString().padStart(2, '0') + c +
    now.getMinutes().toString().padStart(2, '0') + c +
    now.getSeconds().toString().padStart(2, '0')
}