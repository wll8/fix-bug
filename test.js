const { removeLeft, baseConfig, handler } = require(`./util.js`)
const list = [
  {
    name: `convertEnd 参数为 false, 不转换英文后面符号`,
    config: {
      convertEnd: false,
    },
    str: removeLeft(`
      中文en.en.
    `),
    diff: removeLeft(`
      中文 en.en.
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
    name: `不处理多余的空白符号 cleanSpace`,
    config: {
      cleanSpace: false,
    },
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中文 en.en?		中文 en 呀。
    `),
  },
  {
    name: `当原文以中文字符+英文标点结尾时, `,
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中文 en.en? 中文 en 呀。
    `),
  },
  {
    name: `当原文以中文字符+英文标点+英文字符结尾时, 使用中文标点`,
    str: removeLeft(`
      中文.id
    `),
    diff: removeLeft(`
      中文。id
    `),
  },
  {
    name: `要处理多于的空白符号 cleanSpace`,
    config: {
      cleanSpace: true,
    },
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中文 en.en? 中文en呀。
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
      中文---en.en?---中文---en---呀。
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
      中---文---en.en?---中文---en---呀。
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
      中文-#%--#en.en?-##-#%中文-#%en-#%呀。
    `),
  },
  {
    name: `使用 step 替换为 _`,
    config: {
      step: ({from, to, index, total}) =>{
        return `_`
      },
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
    config: {
      step: ({from, to, index, total}) =>{
        return `${to}_`
      },
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
    config: {
      step: ({from, to, index, total}) =>{
        return total
      },
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
    config: {
      step: ({from, to, index, total}) =>{
        return `${from}_${from}`
      },
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
    config: {
      step: ({from, to, index, total}) =>{
        return index
      },
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
    name: `参数先后顺序, 先 cleanSpace - insert - convert`,
    config: {
      insert: `a	 ba b a`,
      convert: [
        [`.`, `。`],
        [`a`, `b`],
      ],
    },
    str: removeLeft(`
      你a	 1好.
    `),
    /**
     * cleanSpace 处理后 【你a	 1好.】 => 【你aa	 ba b a1好.】 -- 处理多余空白符为 insert, 不递归处理.
     * insert 处理后 【你a	 ba b aa	 ba b a1a	 ba b a好.】 -- 处理其他地方的 insert
     * convert[0] 处理后 【你aa	 ba b aa	 ba b a1a	 ba b a好。】 -- 把 . 替换为 。, 处理 convert 时留意 convertEnd 参数
     * convert[1] 处理后 【你ab	 bb b ab	 bb b a1b	 bb b a好。】 -- 把标点 a 替换为 b -- 留意 convert 永远表示标点, 所以在其他字符尾部才做处理.
     */
    diff: removeLeft(`
      你ab	 bb b ab	 bb b a1b	 bb b a好。
    `),
  },
  {
    name: `参数先后顺序, 先 cleanSpace - insert - convert[0] - ... step`,
    config: {
      insert: `a	 ba b a`,
      convert: [
        [`.`, `。`],
        [`a`, `b`],
      ],
      step: ({ from, to, index, total }) => {
        return `${to}${index}`
      },
    },
    str: removeLeft(`
      你a	 1好.
    `),
    /**
     * cleanSpace 处理后 【你a	 1好.】 => 【你aa	 ba b a1好.】
     * insert 处理后 【你a	 ba b aa	 ba b a1a	 ba b a好.】
     * convert[0] 处理后 【你aa	 ba b aa	 ba b a1a	 ba b a好。】
     * convert[1] 处理时 【你ab	 bb b ab	 bb b a1b	 bb b a好。】 -- 由于它是最后一环, 所以会被 step 拦截
     * step 处理后 【你ab0	 bb1 b ab2	 bb3 b a1b4	 bb5 b a好。】
     */
    diff: removeLeft(`
      你ab0	 bb1 b ab2	 bb3 b a1b4	 bb5 b a好。
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