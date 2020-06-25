var url = require('url');
var https = require('https');
var get = require('util').promisify(https.get)
var SocksProxyAgent = require('socks-proxy-agent');
/**
 * @url http://www.gstatic.com/generate_204
 */
var testUrl = 'https://www.gstatic.com/generate_204'
module.exports = function urlTest(proxy) {
  var start = Date.now()
  var opts = url.parse(testUrl);
  var proxy = proxy ? proxy : 'socks://127.0.0.1:1080'
  var agent = new SocksProxyAgent(proxy);
  opts.agent = agent;
  /**
   * it will be catch if statusCode is 204
   */
  return get(opts).catch(res => {
    const { statusCode } = res
    if (statusCode === 204)
      return Date.now() - start
    else return 'fail'
  })
}