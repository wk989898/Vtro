// flow size
const size = {
  B: 1 << 0,
  KB: 1 << 10,
  MB: 1 << 20,
  GB: 1 << 30
}
const flow_unit = Object.keys(size)
/**
 * @param {number} data 
 * @returns {string} flow usage
 */
export function convert(data = 0) {
  data = Math.abs(data)
  for (let i of flow_unit) {
    if (data < 1024 * size[i]) {
      return (data / size[i]).toFixed(2) + i
    }
  }
  return (data / size['GB']).toFixed(2) + 'GB'
}
