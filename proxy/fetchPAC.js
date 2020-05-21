/**
 * gfwlist2pac
 * Automatically convert gfwlist to pac everyday
 * Just use https://raw.githubusercontent.com/petronny/gfwlist2pac/master/gfwlist.pac
 * 
 */
const https = require('https')
const fs = require('fs')
export function fetchPAC(path) {
  const writerStream = fs.createWriteStream(path)
  https.get('https://raw.githubusercontent.com/petronny/gfwlist2pac/master/gfwlist.pac')
    .on('response', r => {
      r.on('data', res => {
        writerStream.write(res);
      })
    }).end(() => {
      writerStream.end();
    })
}
fetchPAC('./proxy.pac')
console.log('write into proxy.pac')
