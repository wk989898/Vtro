export function calcTime({ startTime, endTime }) {
  const start = startTime
  const end = endTime
  if (start === end) return [false, 0]
  const now = new Date()
  var [starthour, startmin] = start.split(':').map(v => Number(v))
  var [endhour, endmin] = end.split(':').map(v => Number(v))
  var [hour, min] = [Number(now.getHours()), Number(now.getMinutes())]

  endhour = endhour > starthour ? endhour :
    endhour < starthour ? endhour + 24 :
      // hour 相同  17:30 -> 17:00
      endmin > startmin ? endhour : endhour + 24
  if ((hour > starthour || (hour == starthour && min > startmin)) &&
    (hour < endhour || (hour == endhour && endmin < min))
  ) {
    // on 剩余时间
    console.log('on')
    let last = ((endhour * 60 + endmin) - (hour * 60 + min)) * 60
    return [true, last]
  } else {
    // off bt后开启 last 持续时间
    console.log('off')
    let bt = ((starthour * 60 + startmin) + (hour * 60 + min)) * 60
    let last = ((endhour * 60 + endmin) - (starthour * 60 + startmin)) * 60
    return [false, last === 0 ? 0 : bt + last, bt]
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