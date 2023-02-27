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
    name: `convertEnd 参数为 false, 不转换英文后面符号 -- 前而有英文`,
    config: {
      convertEnd: false,
    },
    str: removeLeft(`
      abc.中文en.en.
    `),
    diff: removeLeft(`
      abc. 中文 en.en.
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
    name: `convertEnd 参数为 true, 不转换英文后面符号 -- 前而有英文`,
    config: {
      convertEnd: true,
    },
    str: removeLeft(`
      abc.中文en.en.
    `),
    diff: removeLeft(`
      abc。中文 en.en。
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
    name: `要处理多余的空白符号 -- 应仅处理半角空格和制表符`,
    config: {
      cleanSpace: true,
    },
    str: removeLeft(`
      中文   en.en?		中文en呀${getSpace().join(``)}呀.
    `),
    diff: removeLeft(`
      中文 en.en? 中文 en 呀${getSpace().join(``)}呀。
    `),
  },
  {
    name: `要处理多余的空白符号 -- 应仅处理半角空格和制表符 2`,
    config: {
      cleanSpace: true,
    },
    str: removeLeft(`
      中文   en.en?		中文en呀${getSpace().join(` `)}呀.
    `),
    diff: removeLeft(`
      中文 en.en? 中文 en 呀${getSpace().join(` `)}呀。
    `),
  },
  {
    name: `要处理多余的空白符号 -- 应仅处理半角空格和制表符 3`,
    config: {
      cleanSpace: true,
    },
    str: removeLeft(`
      中文   en.en?		中文en呀${getSpace().join(`      `)}呀.
    `),
    diff: removeLeft(`
      中文 en.en? 中文 en 呀${getSpace().join(` `)}呀。
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
    name: `要处理多余的空白符号 cleanSpace`,
    config: {
      cleanSpace: true,
    },
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中文 en.en? 中文 en 呀。
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
      step: ({from, to}) =>{
        return `_`
      },
    },
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    // 原始 
    // 中文 en.en?		中文en呀.
    
    // cleanSpace 
    // 中文 en.en?_中文en呀.

    // insert 
    // 中文 en.en?__中文_en_呀.

    // convert 
    // 中文 en.en?__中文_en_呀_
    diff: removeLeft(`
      中文 en.en?__中文_en_呀_
    `),
  },
  {
    name: `使用 step 中的 to`,
    config: {
      step: ({from, to}) =>{
        return `${to}_`
      },
    },
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中文 en.en? _ _中文 _en _呀。_
    `),
  },
  {
    name: `使用 step 中的 from`,
    config: {
      step: ({from, to}) =>{
        return `${from}_${from}`
      },
    },
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    // 原始 
    // 中文 en.en?		中文en呀.
    
    // cleanSpace 
    // 中文 en.en?		_		中文en呀.

    // insert 
    // 中文 en.en?		_		中文_en_呀.

    // convert 
    // 中文 en.en?		_		中文_en_呀._.
    diff: removeLeft(`
      中文 en.en?		_		中文_en_呀._.
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
    name: `配置忽略项`,
    config: {
      ignore: [`-`, `/`],
    },
    str: removeLeft(`
      ８-5=3,中文/英文
    `),
    diff: removeLeft(`
      ８-5=3, 中文/英文
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

    // 原始 
    // 你a	 1好.
    
    // cleanSpace -- 处理多余空白符为 insert, 不递归处理.
    // 你aa	 ba b a1好.

    // insert -- 处理其他地方的 insert
    // 你aa	 ba b aaa	 ba b a1aa	 ba b a好.

    // convert[0] -- 处理 convert 时留意 convertEnd 参数
    // 你aa	 ba b aaa	 ba b a1aa	 ba b a好。

    // convert[1] -- 留意 convert 永远表示标点, 所以在其他字符尾部才做处理.
    // 你ab	 bb b aab	 bb b a1ab	 bb b a好。
    diff: removeLeft(`
      你ab	 bb b aab	 bb b a1ab	 bb b a好。
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
  {
    name: `仅转换传入的符号 ! => ！ -- 往回转`,
    config: {
      convert: [
        [`!`, `！`],
        [`！`, `!`],
      ],
    },
    str: removeLeft(`
      1.道路千wan条,安全第1条.
      2 .行车不规范, 亲人两行泪,boo!嘣!
    `),
    diff: removeLeft(`
      1. 道路千 wan 条, 安全第 1 条.
      2 . 行车不规范, 亲人两行泪, boo! 嘣!
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

function getSpace () {
  return [
    // ` `,
    // `	`,
    ` `,
    `​`,
    `‌`,
    `‍`,
    `⁠`,
    `⁡`,
    `⁢`,
    `⁣`,
    `⁤`,
    `⁪`,
    `⁫`,
    `⁬`,
    `⁭`,
    `⁮`,
    `⁯`,
    `　`,
    `ᅟ`,
    `ᅠ`,
    ` `,
    ` `,
    ` `,
    ` `,
    ` `,
    ` `,
    ` `,
    ` `,
    ` `,
    ` `,
    ` `,
    ` `,
    `ﾠ`,
  ]
}

module.exports = {
  isErr,
  list,
}