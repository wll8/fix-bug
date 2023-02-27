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
  - config.ignroe -- 新增配置, 支持忽略不应处理的字符
  - config.runOrder -- 新增配置, 支持配置处理流程的顺序
  - config.cleanSpace -- 类型从 Boolean 变更为 Array, 用于配置什么叫多于空白符
    - 例: `[]`, 为空数组时表示不处理任何
    - 例: `[' ', '	']`, 处理空格和制表
