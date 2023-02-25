const { removeLeft, baseConfig, handler } = require(`./util.js`)
const str = removeLeft(`
  Q:这是	 	 	 什么?
  A:你好,这是 	1些文本.why? text.一些文本!
`)
const config = {
  ...baseConfig,
  step: ({from, to, index, total}) =>{
    console.log(`step`, from, to, index, total)
    return to
  },
}
const res = handler({str, config})
console.log(`处理前`)
console.log(str)
console.log(`处理后`)
console.log(res)