export function calcTime({ startTime, endTime }) {
  const start = startTime
  const end = endTime
  if (start === end) return [false,0]
  const now = new Date()
  const [starthour, startmin] = start.split(':')
  var [hour, min] = [now.getHours(), now.getMinutes()]
  var [endhour, endmin] = end.split(':')

  endhour = endhour > starthour ? endhour :
    endhour < starthour ? endhour + 24 :
      // 17:30 -> 17:00
      endmin > startmin ? endhour : endhour + 24

  if ((hour > starthour || (hour == starthour && min > startmin)) &&
    (hour < endhour || (hour == endhour && endmin < min))
  ) {
    // on 剩余时间
    let t = new Date(`0000:${endhour}:${endmin}`)-new Date(`0000:${hour}:${min}`) 
    t = t < 0 ? t + 24 * 3600 : t
    return [true,t]
  } else {
    // off bt后开启 last 持续时间
    let bt = new Date(`0000:${starthour}:${startmin}`)-new Date(`0000:${hour}:${hour}`) 
    let last=new Date(`0000:${endhour}:${endmin}`)-new Date(`0000:${starthour}:${startmin}`) 
    last = last < 0 ? last + 24 * 3600 : last
    return [false,last,bt]
  }

  /**
   * 1 隔夜
   * 2 不隔夜
   */
  // if (endhour < starthour ||
  //   (endhour == starthour || endmin < startmin)) {
  //   if ((hour > starthour || (hour == starthour || min > startmin)) ||
  //     (hour < endhour || (hour == endhour || endmin < min))
  //   ) {
  //     // on 
  //   } else {
  //     // off
  //   }
  // } else {
  //   if ((hour > starthour || (hour == starthour || min > startmin)) &&
  //     (hour < endhour || (hour == endhour || endmin < min))
  //   ) {
  //     // on
  //   }else{
  //     // off
  //   }
}