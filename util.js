function removeLeft(str) {
  const lines = str.split(`\n`)
  // 获取应该删除的空白符数量
  const minSpaceNum = lines.filter(item => item.trim())
    .map(item => item.match(/(^\s+)?/)[0].length)
    .sort((a, b) => a - b)[0]
  // 删除空白符
  const newStr = lines
    .map(item => item.slice(minSpaceNum))
    .join(`\n`)
  return newStr
}

const baseConfig = {
  // 把此值插入到中英文字符之间
  insert: ` `,
  // 是否替换多余空白符(空格, 制表)为要插入的字符
  cleanSpace: true,
  // 要转换的符号, 受 convertEnd 参数限制
  convert: [
    [`,`, `，`],
    [`.`, `。`],
  ],
  /**
   * 是否转换英文后面的标点符号
   * 当为 false 时, 【中文en.en?】应转换为【中文 en.en? 】
   * 当为 true 时, 【中文en.en?】应转换为【中文 en.en？ 】
   */
  convertEnd: false,
  /**
   * 每次修改前调用此函数, 示意图 @/img/2023-02-25-22-31-42.png
   * from -- 修改前的字符, 如果是插入时则为空字符串
   * index -- 当前为第几个替换位
   * total -- 一共有多少替换位
   * to -- 即将要替换为的字符, 返回什么就替换为什么
   */
  step: ({ from, to, index, total }) => {
    return to;
  },
};

/**
 * todo
 * 接收一个字符串和一个配置, 返回一个处理后的字符串
 */
function handler({ str, config }) {
  return ``;
}

module.exports = {
  removeLeft,
  baseConfig,
  handler,
};
