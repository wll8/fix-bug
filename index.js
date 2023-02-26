const { removeLeft, baseConfig, handler } = require(`./util.js`)
const str = removeLeft(`
  中文 en.en?		中文en呀.
`)
const config = {
  ...baseConfig,
  step: ({from, to}) =>{
    console.log(`step`, from, to)
    return to
  },
}
const res = handler({str, config})
console.log(`处理前`)
console.log(str)
console.log(`处理后`)
console.log(res)
require(`./test.js`).isErr()