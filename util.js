const baseConfig = {
  // 把此值插入到中英文字符之间
  insert: ` `,
  // 是否替换多余空白符(空格, 制表)为要插入的字符
  cleanSpace: true,
  // 要转换的符号, 英文字符后无需转换.
  convert: [
    [`,`, `，`],
    [`.`, `。`],
  ],
  // 是否转换英文后面的字符
  convertSwitchEnd: false,
  /**
   * 每次修改前调用此函数
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
  baseConfig,
  handler,
};
