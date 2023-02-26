const { removeLeft, baseConfig, handler } = require(`./util.js`)
const list = [
  {
    name: `convertEnd 参数为 false, 不转换英文后面符号`,
    config: {
      convertEnd: false,
    },
    str: removeLeft(`
      中文en.en?
    `),
    diff: removeLeft(`
      中文 en.en?
    `),
  },
  {
    name: `convertEnd 参数为 true, 应转换英文后面符号`,
    config: {
      convertEnd: true,
    },
    str: removeLeft(`
      中文en.en.
    `),
    diff: removeLeft(`
      中文 en.en。
    `),
  },
  {
    name: `合并多于空白符号为空格`,
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中文 en.en? 中文 en 呀。
    `),
  },
  {
    name: `合并多于空白符号为 ---`,
    config: {
      insert: `---`,
    },
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中文---en.en?---中文---en---呀---
    `),
  },
  {
    name: `合并多于空白符号为 ---, 已处理过的不再处理`,
    config: {
      insert: `---`,
    },
    str: removeLeft(`
      中---文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中---文---en.en?---中文---en---呀---
    `),
  },
  {
    name: `合并多于空白符号为 -#%`,
    config: {
      insert: `-#%`,
    },
    str: removeLeft(`
      中文--#en.en?-##中文en呀.
    `),
    diff: removeLeft(`
      中文-#%--#en.en?-##-#%中文-#%en-#%呀-#%
    `),
  },
  {
    name: `使用 step 替换为 _`,
    step: ({from, to, index, total}) =>{
      return `_`
    },
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中文_en.en?_中文_en_呀_
    `),
  },
  {
    name: `使用 step 中的 to`,
    step: ({from, to, index, total}) =>{
      return `${to}_`
    },
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中文 _en.en?		_中文_en_呀._
    `),
  },
  {
    name: `使用 step 中的 total`,
    step: ({from, to, index, total}) =>{
      return total
    },
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中文4en.en?4中文4en4呀4
    `),
  },
  {
    name: `使用 step 中的 from`,
    step: ({from, to, index, total}) =>{
      return `${from}_${from}`
    },
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中文 _ en.en?		_		中文_en_呀_._
    `),
  },
  {
    name: `使用 step 中的 index`,
    step: ({from, to, index, total}) =>{
      return index
    },
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中文0en.en?1中文2en3呀4
    `),
  },
  {
    name: `仅转换传入的符号 . => 。`,
    config: {
      convert: [
        [`.`, `。`],
      ],
    },
    str: removeLeft(`
      你好,一些文本.
    `),
    diff: removeLeft(`
      你好, 一些文本。
    `),
  },
  {
    name: `仅转换传入的符号 ! => ！`,
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
      1. 道路千 wan 条, 安全第 1 条.
      2 . 行车不规范, 亲人两行泪, boo! 嘣！
    `),
  },
]

function isErr() {
  const err = list.some((item, index) => {
    const config = {...baseConfig, ...item.config}
    const out = handler({...item, config})
    console.group(`${index} > ${item.name}`.padEnd(30, `=`))
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

if(global.describe) {
  const assert = require('assert');
  list.forEach(item => {
    it(item.name, function () {
      const config = {...baseConfig, ...item.config}
      const out = handler({...item, config})
      assert.equal(out, item.diff)
    });
  })
}

module.exports = {
  isErr,
  list,
}