const { removeLeft, baseConfig, handler } = require(`./util.js`)
const list = [
  {
    config: {...baseConfig},
    str: removeLeft(`
      Q:这是	 	 	 什么?
      A:你好,这是 	1些文本.why? text.一些文本!
    `),
    diff: removeLeft(`
      Q: 这是 什么?
      A: 你好，这是 1 些文本。why? text. 一些文本!
    `),
  }
]
list.forEach((item, index) => {
  const out = handler(item)
  Object.entries({index, ...item, out, isOk: out === item.diff}).forEach(([key, val]) => {
    console.log(`===> ${key}`)
    console.log(val)
  })
})

