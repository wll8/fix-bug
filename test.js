const { removeLeft, baseConfig, handler } = require(`./util.js`)
let list = [
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
    name: `默认配置1`,
    str: removeLeft(`
      你好!中文.中    文
    `),
    /**
     * raw
     * 你好!中文.中    文
     * 
     * cleanSpace
     * 你好!中文.中 文
     * 
     * insert
     * 你好 ! 中文. 中 文
     * 
     * convert -- 由于先 insert 导致句号后面有空格
     * 你好 ! 中文。 中 文
     * 
     */
    diff: removeLeft(`
      你好 ! 中文。 中 文
    `),
  },
  {
    change: [`2023-02-27`],
    name: `更改处理流程为 insert 在最后`,
    config: {
      runOrder:  [`cleanSpace`, `convert`, `insert`],
    },
    str: removeLeft(`
      你好!中文.中    文
    `),
    /**
     * raw
     * 你好!中文.中    文
     * 
     * cleanSpace
     * 你好!中文.中 文
     * 
     * convert -- 注意只处理 convert 内含有的字符
     * 你好!中文。中 文
     * 
     * insert
     * 你好 ! 中文。中 文
     */
    diff: removeLeft(`
      你好 ! 中文。中 文
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
    name: `convertEnd 参数为 true, 不转换英文后面符号 -- 前面有英文`,
    config: {
      convertEnd: true,
    },
    str: removeLeft(`
      abc.中文en.en.
    `),
    /**
     * raw
     * abc.中文en.en.
     * 
     * cleanSpace
     * abc.中文en.en.
     * 
     * insert
     * abc. 中文 en.en.
     * 
     * convert -- 由于先 insert 导致句号后面有空格
     * abc。 中文 en.en。
     */
    diff: removeLeft(`
      abc。 中文 en.en。
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
    change: [`2023-02-27`],
    name: `当 cleanSpace 为 [] 时`,
    config: {
      cleanSpace: [],
    },
    str: removeLeft(`
      中文 en.en?		中文en呀.
    `),
    diff: removeLeft(`
      中文 en.en?		中文 en 呀。
    `),
  },
  {
    change: [`2023-02-27`],
    name: `当 cleanSpace 为 ['x'] 时`,
    config: {
      convertEnd: true,
      cleanSpace: [`x`],
    },
    str: removeLeft(`
      中x文 en.en?		中xx文en呀xxxx.
    `),
    
    // raw 
    // 中x文 en.en?		中xx文en呀xxxx.
    
    // cleanSpace -- 由于 xxxx 被换为空格, 导致呀和句号是分开的。
    // 中x文 en.en?		中 文en呀 .

    // insert -- 由于需要插入空格, 所以 x 左右被插入了
    // 中 x 文 en.en?		中 文 en 呀 .

    // convert -- 由于呀和句号被分开了，所以不属于符号，不被转换。
    // 中 x 文 en.en?		中 文 en 呀 .
    diff: removeLeft(`
      中 x 文 en.en?		中 文 en 呀 .
    `),
  },
  {
    change: [`2023-02-27`],
    name: `当 cleanSpace 为 ['x', 'y'] 时`,
    config: {
      convert: [
        [`?`, `？`],
      ],
      convertEnd: true,
      cleanSpace: [`x`, `y`],
    },
    str: removeLeft(`
      中x文 en.en?		中xyy文en呀xxxxxyyyy.
    `),
    
    // raw 
    // 中x文 en.en?		中xyy文en呀xxxxxyyyy.
    
    // cleanSpace -- 由于 xyy 都被视为空白符, 所以都被替换了
    // 中x文 en.en?		中 文en呀 .

    // insert 
    // 中 x 文 en.en?		中 文 en 呀 .

    // convert -- convertEnd 为 true, 问号转中文, 由于句号被分开, 不被转换.
    // 中 x 文 en.en？		中 文 en 呀 .
    diff: removeLeft(`
      中 x 文 en.en？		中 文 en 呀 .
    `),
  },
  {
    name: `要处理多余的空白符号 -- 应仅处理半角空格和制表符`,
    config: {
      cleanSpace: true,
    },
    str: removeLeft(`
      中文   en.en?		中ﾠﾠﾠ文en呀　　　呀.
    `),
    diff: removeLeft(`
      中文 en.en? 中ﾠﾠﾠ文 en 呀　　　呀。
    `),
  },
  {
    name: `要处理多余的空白符号 -- 应仅处理半角空格和制表符 2`,
    config: {
      cleanSpace: true,
    },
    str: removeLeft(`
      中文   en.en?		中文en呀ﾠ	ﾠ	ﾠ呀.
    `),
    diff: removeLeft(`
      中文 en.en? 中文 en 呀ﾠ	ﾠ	ﾠ呀。
    `),
  },
  {
    name: `要处理多余的空白符号 -- 应仅处理半角空格和制表符 3`,
    config: {
      cleanSpace: true,
    },
    str: removeLeft(`
      中文   en.en?		中文en呀　		　呀.
    `),
    diff: removeLeft(`
      中文 en.en? 中文 en 呀　　呀。
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
      中文 en.en?---中文---en---呀。
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
      中---文 en.en?---中文---en---呀。
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
    // raw 
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
    // raw 
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
      你好 , 一些文本。
    `),
  },
  {
    change: [`2023-02-27`],
    name: `配置忽略项`,
    config: {
      ignore: [`-`, `/`], // 配置之后, 不再做任何处理, 不管左右有什么
    },
    str: removeLeft(`
      ８-5=3,中文/英文
    `),
    diff: removeLeft(`
      ８-5=3, 中文/英文
    `),
  },
  {
    change: [`2023-02-27`],
    name: `配置忽略项2`,
    config: {
      runOrder:  [`cleanSpace`, `convert`, `insert`],
      ignore: [`-`, `/`],
    },
    str: removeLeft(`
      ８-5=3,中文,/英文
    `),
    diff: removeLeft(`
      ８-5=3, 中文，/英文
    `),
  },
  {
    name: `默认配置2`,
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

    // raw 
    // 你a	 1好.
    
    // cleanSpace -- 处理多余空白符为 insert, 不递归处理.
    // 你aa	 ba b a1好.

    // insert -- 处理其他地方的 insert
    // 你a	 ba b aaa	 ba b a1a	 ba b a好.

    // convert[0] -- 处理 convert 时留意 convertEnd 参数
    // 你a	 ba b aaa	 ba b a1a	 ba b a好。

    // convert[1] -- 留意 convert 永远表示标点, 所以在其他字符尾部才做处理.
    // 你b	 bb b aab	 bb b a1b	 bb b a好。
    diff: removeLeft(`
      你b	 bb b aab	 bb b a1b	 bb b a好。
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
      1. 道路千 wan 条 , 安全第 1 条 .
      2 . 行车不规范 , 亲人两行泪 ,boo! 嘣！
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
      1. 道路千 wan 条 , 安全第 1 条 .
      2 . 行车不规范 , 亲人两行泪 ,boo! 嘣!
    `),
  },
]

// 忽略此日期以后的测试用例
// const ignoreDate = `2023-02-27`
const ignoreDate = ``
list = list.filter(item => {
  const min = (item.change || []).map(item => +(new Date(item))).sort()[0]
  return (min && ignoreDate) ? min < +(new Date(ignoreDate)) : true
})

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
    ` `, // 半角
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
    `　`, // 全角空格
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
    `ﾠ`, // 全角
  ]
}

module.exports = {
  isErr,
  list,
}