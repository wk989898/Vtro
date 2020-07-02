const { readFileSync } = require('fs')
const path=require('path')
const trojan = require('../src/utils/trojan')
const generateSub=require('./generateSub')

test('trojan test', () => {
  const result=trojan.subscribe(generateSub(5))
  readFileSync(path.resolve(__dirname,'./sub.txt'),(err,res)=>{
    let data=JSON.parse(res)
    expect(data).toEqual(result)
  })
})