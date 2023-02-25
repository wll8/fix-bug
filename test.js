const { removeLeft, baseConfig: config, handler } = require(`./util.js`)
const list = [
  {
    config,
    str: removeLeft(`
      Q:这是	 	 	 什么?
      A:你好,这是 	1些文本.why? text.一些文本!
    `),
    diff: removeLeft(`
      Q: 这是 什么?
      A: 你好，这是 1 些文本。why? text. 一些文本!
    `),
  },
  {
    config,
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中文 en.en? 中文 en 呀。
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

