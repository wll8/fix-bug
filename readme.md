## 目的: 处理中英文字符

处理字符, 例如转换英文标点为中文, 在英文字符前后添加空格.

例如处理之前

```text
中文 en.en?		中文en呀.
```

处理之后

```text
中文 en.en? 中文 en 呀。
```

在 [util.js](./util.js) 文件的 handler 函数中完成以上操作, 支持传入不同参数来进行转换, 例如是插入空格还是制表符.

``` sh
# 获取代码
git clone -b str-fix https://gitee.com/wll8/fix-bug str-fix --depth=1 && cd str-fix

# 安装依赖
yarn

# 启动程序
yarn dev

# 在 util.js 中 handler 中编写程序
open util.js
```