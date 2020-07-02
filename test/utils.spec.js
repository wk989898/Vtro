const { readFileSync } = require('fs');
const trojan = require('../src/utils/trojan')
const generateSub=require('./generateSub')

test('trojan test', () => {
  const result=trojan.subscribe(generateSub(5))
  readFileSync('./sub.txt',(err,res)=>{
    let data=JSON.parse(res)
    expect(data).toEqual(result)
  })
})