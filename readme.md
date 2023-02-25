## 目的: 处理中英文字符

处理字符, 例如转换英文标点为中文, 在英文字符前后添加空格.

例如处理之前

```text
Q:这是	 	 	 什么?
A:你好,这是 	1些文本.why? text.一些文本!
```

处理之后

```text
Q: 这是 什么?
A: 你好，这是 1 些文本。why? text. 一些文本!
```

在 [util.js](./util.js) 文件的 handler 函数中完成以上操作, 支持传入不同参数来进行转换, 例如是插入空格还是制表符.

``` sh
# 安装依赖
yarn

# 启动程序
yarn dev

# 在 util.js 中 handler 中编写程序
open util.js
```