## 题目: 格式化字符

要求在 [util.js](./util.js) 文件的 handler 函数中完成以上操作,

例如转换英文标点为中文, 在英文字符前后添加空格.

符合直观习惯, 例如英文后面的字符不需转成中文字符(英文句中不能使用中文符号).

假设有以下文本:

```text
中文 en.en?		中文en呀.
```

处理之后为:

```text
中文 en.en? 中文 en 呀。
```

为了考察抽象能力, 需要实现传入不同参数来进行不同转换, 例如传入 `xx`, 那么中英文之前插入的就不是空格, 而是 `x`.

要求实现的参数详情请查看 [util.js](./util.js) 中的 baseConfig 对象注释.

## 开发

```sh
# 获取代码
git clone -b str-fix https://gitee.com/wll8/fix-bug str-fix --depth=1 && cd str-fix

# 安装依赖
yarn

# 启动程序
yarn dev

# 在 util.js 中 handler 中编写程序
open util.js

# 测试
yarn test
```

注: [test.js](./test.js) 文件中是一些会更新的测试用例, 运行 `yarn test` 通过即表示函数符合要求, 如果用例有误请告知我.

## 测试用例(功能变更)日志
- 2023-02-27
  - config.ignore -- 新增配置, 支持忽略不应处理的字符
  - config.runOrder -- 新增配置, 支持配置处理流程的顺序
  - config.cleanSpace -- 类型支持从 Boolean 和 Array, 用于配置什么叫多于空白符
    - 为: `true` 时默认处理 `[' ', '	']`
    - 例: `false` 和 `[]`, 为空数组时表示不处理任何
    - 例: `[' ', '	']`, 处理空格和制表

## 参考
不一定有用.

- [中文排版需求](https://w3c.github.io/clreq/)
- [饿了么文案风格指南](https://github.com/ElemeFE/style-guide/blob/master/copywriter.md)
- [syntax-parser](https://github.com/ascoders/syntax-parser)
- [写给大家看的中文排版指南](https://zhuanlan.zhihu.com/p/20506092)
- [中文写作排版风格指南](https://github.com/RightCapitalHQ/chinese-style-guide)
- [技术文章的写作技巧分享](https://github.com/ziyi2/ziyi2.github.io/issues/13)

文献一
``` js
/[\u0000-\u00ff]/g // 半角
/[\u4e00-\u9fa5]/g // 中文
/[\uff00-\uffff]/g // 全角
```

文献二
``` js
charCodeAt(0) <= 128 // 英文
```

文献三
``` js
function isFullWidth(char) {
  const charCode = char.charCodeAt(0);
  return (charCode >= 0xff01 && charCode <= 0xff5e) || // 全角字符
         (charCode >= 0xffe0 && charCode <= 0xffe6);  // 全角符号
}

function isHalfWidth(char) {
  const charCode = char.charCodeAt(0);
  return charCode >= 0x0020 && charCode <= 0x007e; // 半角字符
}
```

- [ASCII码一览表，ASCII码对照表](http://c.biancheng.net/c/ascii/)

## 相关项目
- https://github.com/Leopoldthecoder/doctor-jones-extension
  - https://zhuanlan.zhihu.com/p/79147438
- [中文文案排版指北](https://github.com/sparanoid/chinese-copywriting-guidelines/blob/master/README.zh-Hans.md) -- 推荐
  - https://github.com/vinta/pangu.js
