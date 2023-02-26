const { removeLeft, baseConfig, handler } = require(`./util.js`)
const list = [
  {
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
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中文 en.en? 中文 en 呀。
    `),
  },
  {
    config: {
      convert: [
        [`!`, `！`],
      ],
    },
    str: removeLeft(`
      1.道路千wan条,安全第1条.
      2 .行车不规范, 亲人两行泪,boo!嘣!
    `),
    diff: removeLeft(`
      1. 道路千 wan 条，安全第 1 条。
      2 . 行车不规范，亲人两行泪， boo! 嘣！
    `),
  },
]

function isErr() {
  const err = list.some((item, index) => {
    const config = {...baseConfig, ...item.config}
    const out = handler({config, ...item})
    console.group(`${index}>`.padEnd(30, `=`))
    const {str, diff} = item
    const isOk = out === item.diff
    Object.entries({config, str, out, diff, isOk}).forEach(([key, val]) => {
      console.log(`${index}>==${key}`)
      console.log(val)
    })
    console.groupEnd()
    return !isOk
  })
  console.log(`函数是否合格`, err === false)
  return err
}

if(require.main === module) {
  isErr()
}

module.exports = {
  isErr,
  list,
}