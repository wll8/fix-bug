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
  // 字符串处理流程顺序
  runOrder:  [`cleanSpace`, `insert`, `convert`],
  // 把此值插入到中英文字符之间
  insert: ` `,
  // 是否处理多余空白符(例如空格, 制表)为要插入的字符
  cleanSpace: [` `, `	`],
  /**
   * 忽略项, 不管它的旁边是什么. 比如配置为['-', '/']时
   * 【８-5=3,中文/英文】的处理结果为【８-5=3, 中文/英文】
   */
  ignore: [],
  // 要转换的符号, 受 convertEnd 参数限制
  convert: [
    [`,`, `，`],
    [`.`, `。`],
  ],
  /**
   * 是否转换英文后面的标点符号
   * 当为 false 时, 【中文en.en?】应转换为【中文 en.en?】
   * 当为 true 时, 【中文en.en?】应转换为【中文 en.en？】
   */
  convertEnd: false,
  /**
   * 每次修改前调用此函数, 示意图 @/img/2023-02-25-22-31-42.png
   * 注意: 为了减轻复杂度, 不再需要 index 和 total
   * from -- 修改前的字符, 如果是插入时则为空字符串
   * to -- 即将要替换为的字符, 返回什么就替换为什么
   */
  step: ({ from, to }) => {
    return to;
  },
};

/**
 * todo
 * 接收一个字符串和一个配置, 返回一个处理后的字符串
 */
function handler({str, config}) {
  let convertStr = {}
  for (let ci = 0; ci < config.convert.length; ci++) {
      convertStr[config.convert[ci][0]] = config.convert[ci][1]
  }
  let tmp = '';
  let char_int;
  // 字符栈
  let tmp_char_stack = []
  let pre_stack_char_type = ""

  // 每一行都字符类型栈
  let tmp_char_type_stack = []
  let isLegalStart = false
  // 需要先循环一遍获得total
  let step_params = []
  let step_index = 0

  const convert_func_clean_space = function (current, char_type, step_callback) {
      let pre_char_type = tmp_char_type_stack.length > 0 ? tmp_char_type_stack[tmp_char_type_stack.length - 1] : ""
      if (pre_stack_char_type === "") {
          tmp_char_stack.push(current)
          pre_stack_char_type = char_type
          return
      } else {
          if (pre_stack_char_type === char_type) {
              tmp_char_stack.push(current)
              return;
          } else {
              let buffer = ""
              let replace = {}
              if (pre_char_type === "zh") {
                  switch (pre_stack_char_type) {
                      case "zh":
                          break
                      case "en":
                          buffer = tmp_char_stack.join("")
                          break
                      case "convert":
                          buffer = tmp_char_stack.join("")
                          break
                      case "hws":
                          buffer = tmp_char_stack.join("")
                          break
                      case "space":
                          if (step_callback) {
                              if (config.cleanSpace) {
                                  // 不触发回调
                                  if (tmp_char_stack.join("") === config.insert) {
                                      buffer = tmp_char_stack.join("")
                                      break
                                  }
                                  replace = {
                                      from: tmp_char_stack.join(""),
                                      to: config.insert,
                                      index: step_index,
                                      total: 0,
                                  }
                                  buffer = `\${R${step_index}}`
                                  step_params.push(replace)
                                  step_index += 1
                              } else {
                                  buffer = tmp_char_stack.join("")
                              }
                          } else {
                              if (config.cleanSpace) {
                                  buffer = " "
                              } else {
                                  buffer = tmp_char_stack.join("")
                              }
                          }
                          break
                      default:
                          buffer = tmp_char_stack.join("")
                  }
                  isLegalStart = true
              } else if (pre_char_type === "en") {
                  switch (pre_stack_char_type) {
                      case "zh":
                          buffer = tmp_char_stack.join("")
                          break
                      case "en":
                          break
                      case "convert":
                          buffer = tmp_char_stack.join("")
                          break
                      case "hws":
                          buffer = tmp_char_stack.join("")
                          break
                      case "space":
                          if (step_callback) {
                              if (config.cleanSpace) {
                                  // 不触发回调
                                  if (tmp_char_stack.join("") === config.insert) {
                                      buffer = tmp_char_stack.join("")
                                      break
                                  }
                                  replace = {
                                      from: tmp_char_stack.join(""),
                                      to: config.insert,
                                      index: step_index,
                                      total: 0,
                                  }
                                  buffer = `\${R${step_index}}`
                                  step_params.push(replace)
                                  step_index += 1
                              } else {
                                  buffer = tmp_char_stack.join("")
                              }
                          } else {
                              if (config.cleanSpace) {
                                  buffer = " "
                              } else {
                                  buffer = tmp_char_stack.join("")
                              }
                          }
                          break
                      default:
                          buffer = tmp_char_stack.join("")
                  }
                  isLegalStart = true
              } else if (pre_char_type === "convert") {
                  switch (pre_stack_char_type) {
                      case "zh":
                          buffer = tmp_char_stack.join("")
                          break
                      case "en":
                          buffer = tmp_char_stack.join("")
                          break
                      case "convert":
                          break
                      case "hws":
                          buffer = tmp_char_stack.join("")
                          break
                      case "space":
                          if (step_callback) {
                              if (config.cleanSpace) {
                                  // 不触发回调
                                  if (tmp_char_stack.join("") === config.insert) {
                                      buffer = tmp_char_stack.join("")
                                      break
                                  }
                                  replace = {
                                      from: tmp_char_stack.join(""),
                                      to: config.insert,
                                      index: step_index,
                                      total: 0,
                                  }
                                  buffer = `\${R${step_index}}`
                                  step_params.push(replace)
                                  step_index += 1
                              } else {
                                  buffer = tmp_char_stack.join("")
                              }
                          } else {
                              if (config.cleanSpace) {
                                  buffer = " "
                              } else {
                                  buffer = tmp_char_stack.join("")
                              }
                          }
                          break
                      default:
                          buffer = tmp_char_stack.join("")
                  }
                  isLegalStart = true
              } else if (pre_char_type === "hws") {
                  switch (pre_stack_char_type) {
                      case "zh":
                          buffer = tmp_char_stack.join("")
                          break
                      case "en":
                          buffer = tmp_char_stack.join("")
                          break
                      case "convert":
                          buffer = tmp_char_stack.join("")
                          break
                      case "hws":
                          break
                      case "space":
                          if (step_callback) {
                              if (config.cleanSpace) {
                                  // 不触发回调
                                  if (tmp_char_stack.join("") === config.insert) {
                                      buffer = tmp_char_stack.join("")
                                      break
                                  }
                                  replace = {
                                      from: tmp_char_stack.join(""),
                                      to: config.insert,
                                      index: step_index,
                                      total: 0,
                                  }
                                  buffer = `\${R${step_index}}`
                                  step_params.push(replace)
                                  step_index += 1
                              } else {
                                  buffer = tmp_char_stack.join("")
                              }
                          } else {
                              if (config.cleanSpace) {
                                  buffer = " "
                              } else {
                                  buffer = tmp_char_stack.join("")
                              }
                          }
                          break
                      default:
                          buffer = tmp_char_stack.join("")
                  }
              } else if (pre_char_type === "space") {
                  switch (pre_stack_char_type) {
                      case "zh":
                          buffer = tmp_char_stack.join("")
                          break
                      case "en":
                          buffer = tmp_char_stack.join("")
                          break
                      case "convert":
                          buffer = tmp_char_stack.join("")
                          break
                      case "hws":
                          buffer = tmp_char_stack.join("")
                          break
                      case "space":
                          break
                      default:
                          buffer = tmp_char_stack.join("")
                  }
                  isLegalStart = true
              } else {
                  buffer = tmp_char_stack.join("")
              }


              tmp += buffer
              tmp_char_type_stack.push(pre_stack_char_type)
              tmp_char_stack = []
              tmp_char_stack.push(current)
              pre_stack_char_type = char_type
              return;
          }
      }
  };
  const convert_func_insert = function (current, char_type, step_callback) {
      let pre_char_type = tmp_char_type_stack.length > 0 ? tmp_char_type_stack[tmp_char_type_stack.length - 1] : ""
      if (pre_stack_char_type === "") {
          tmp_char_stack.push(current)
          pre_stack_char_type = char_type
          return
      } else {
          if (pre_stack_char_type === char_type) {
              tmp_char_stack.push(current)
              return;
          } else {
              let buffer = ""
              let replace = {}
              if (pre_char_type === "zh") {
                  switch (pre_stack_char_type) {
                      case "zh":
                          break
                      case "en":
                          if (step_callback) {
                              replace = {
                                  from: "",
                                  to: config.insert,
                                  index: step_index,
                                  total: 0,
                              }
                              buffer = `\${R${step_index}}` + tmp_char_stack.join("")
                              step_params.push(replace)
                              step_index += 1
                          } else {
                              buffer = config.insert + tmp_char_stack.join("")
                          }
                          break
                      case "convert":
                          buffer = tmp_char_stack.join("")
                          break
                      case "hws":
                          let b = tmp_char_stack.join("")
                          if (b.startsWith(config.insert)) {
                              buffer = b
                          } else {
                              buffer = config.insert + b
                              if (step_callback) {
                                  replace = {
                                      from: "",
                                      to: config.insert,
                                      index: step_index,
                                      total: 0,
                                  }
                                  buffer = `\${R${step_index}}` + b
                                  step_params.push(replace)
                                  step_index += 1
                              } else {
                                  buffer = config.insert + b
                              }
                          }
                          break
                      case "space":
                          buffer = tmp_char_stack.join("")
                          break
                      default:
                          buffer = tmp_char_stack.join("")
                  }
                  isLegalStart = true
              } else if (pre_char_type === "en") {
                  switch (pre_stack_char_type) {
                      case "zh":
                          if (step_callback) {
                              replace = {
                                  from: "",
                                  to: config.insert,
                                  index: step_index,
                                  total: 0,
                              }
                              buffer = `\${R${step_index}}` + tmp_char_stack.join("")
                              step_params.push(replace)
                              step_index += 1
                          } else {
                              buffer = config.insert + tmp_char_stack.join("")
                          }
                          break
                      case "en":
                          break
                      case "convert":
                          buffer = tmp_char_stack.join("")
                          break
                      case "hws":
                          buffer = tmp_char_stack.join("")
                          break
                      case "space":
                          buffer = tmp_char_stack.join("")
                          break
                      default:
                          buffer = tmp_char_stack.join("")
                  }
                  isLegalStart = true
              } else if (pre_char_type === "convert") {
                  switch (pre_stack_char_type) {
                      case "zh":
                          buffer = tmp_char_stack.join("")
                          break
                      case "en":
                          buffer = tmp_char_stack.join("")
                          break
                      case "convert":
                          break
                      case "hws":
                          buffer = tmp_char_stack.join("")
                          break
                      case "space":
                          buffer = tmp_char_stack.join("")
                          break
                      default:
                          buffer = tmp_char_stack.join("")
                  }
                  isLegalStart = true
              } else if (pre_char_type === "hws") {
                  switch (pre_stack_char_type) {
                      case "zh":
                          if (isLegalStart) {
                              if (tmp.endsWith(config.insert)) {
                                  buffer = tmp_char_stack.join("")
                              } else {
                                  if (step_callback) {
                                      replace = {
                                          from: "",
                                          to: config.insert,
                                          index: step_index,
                                          total: 0,
                                      }
                                      buffer = `\${R${step_index}}` + tmp_char_stack.join("")
                                      step_params.push(replace)
                                      step_index += 1
                                  } else {
                                      buffer = config.insert + tmp_char_stack.join("")
                                  }
                              }
                          } else {
                              buffer = tmp_char_stack.join("")
                          }
                          break
                      case "en":
                          buffer = tmp_char_stack.join("")
                          break
                      case "convert":
                          buffer = tmp_char_stack.join("")
                          break
                      case "hws":
                          break
                      case "space":
                          buffer = tmp_char_stack.join("")
                          break
                      default:
                          buffer = tmp_char_stack.join("")
                  }
              } else if (pre_char_type === "space") {
                  switch (pre_stack_char_type) {
                      case "zh":
                          buffer = tmp_char_stack.join("")
                          break
                      case "en":
                          buffer = tmp_char_stack.join("")
                          break
                      case "convert":
                          buffer = tmp_char_stack.join("")
                          break
                      case "hws":
                          buffer = tmp_char_stack.join("")
                          break
                      case "space":
                          break
                      default:
                          buffer = tmp_char_stack.join("")
                  }
                  isLegalStart = true
              } else {
                  buffer = tmp_char_stack.join("")
              }


              tmp += buffer
              tmp_char_type_stack.push(pre_stack_char_type)
              tmp_char_stack = []
              tmp_char_stack.push(current)
              pre_stack_char_type = char_type
              return;
          }
      }
  };
  const convert_func_convert = function (current, char_type, convert, step_callback) {
      let pre_char_type = tmp_char_type_stack.length > 0 ? tmp_char_type_stack[tmp_char_type_stack.length - 1] : ""
      if (pre_stack_char_type === "") {
          tmp_char_stack.push(current)
          pre_stack_char_type = char_type
          return
      } else {
          if (pre_stack_char_type === char_type) {
              tmp_char_stack.push(current)
              return;
          } else {
              let buffer = ""
              let replace = {}
              if (pre_char_type === "zh") {
                  switch (pre_stack_char_type) {
                      case "zh":
                          break
                      case "en":
                          buffer = tmp_char_stack.join("")
                          break
                      case "convert":
                          if (step_callback) {
                              buffer = tmp_char_stack.map(v => {
                                  replace = {
                                      from: v,
                                      to: convert[v],
                                      index: step_index,
                                      total: 0,
                                  }
                                  step_params.push(replace)
                                  step_index += 1
                                  return `\${R${step_index - 1}}`
                              }).join("")
                          } else {
                              buffer = tmp_char_stack.map(v => convert[v]).join("")
                          }
                          break
                      case "hws":
                          buffer = tmp_char_stack.join("")
                          break
                      case "space":
                          buffer = tmp_char_stack.join("")
                          break
                      default:
                          buffer = tmp_char_stack.join("")
                  }
                  isLegalStart = true
              } else if (pre_char_type === "en") {
                  switch (pre_stack_char_type) {
                      case "zh":
                          buffer = tmp_char_stack.join("")
                          break
                      case "en":
                          break
                      case "convert":
                          if (char_type === "en") {
                              buffer = tmp_char_stack.join("")
                          } else {
                              if (config.convertEnd) {
                                  if (step_callback) {
                                      buffer = tmp_char_stack.map(v => {
                                          replace = {
                                              from: v,
                                              to: convert[v],
                                              index: step_index,
                                              total: 0,
                                          }
                                          step_params.push(replace)
                                          step_index += 1
                                          return `\${R${step_index - 1}}`
                                      }).join("")
                                  } else {
                                      buffer = tmp_char_stack.map(v => convert[v]).join("")
                                  }
                              } else {
                                  if (step_callback) {
                                      buffer = tmp_char_stack.map((v, index) => {
                                          if (index === 0) {
                                              return v
                                          } else {
                                              replace = {
                                                  from: v,
                                                  to: convert[v],
                                                  index: step_index,
                                                  total: 0,
                                              }
                                              step_params.push(replace)
                                              step_index += 1
                                              return `\${R${step_index - 1}}`
                                          }
                                      }).join("")
                                  } else {
                                      buffer = tmp_char_stack.map((v, index) => {
                                          if (index === 0) {
                                              return v
                                          } else {
                                              return convert[v]
                                          }
                                      }).join("")
                                  }
                                  pre_stack_char_type = "en"
                              }
                          }
                          break
                      case "hws":
                          buffer = tmp_char_stack.join("")
                          break
                      case "space":
                          buffer = tmp_char_stack.join("")
                          break
                      default:
                          buffer = tmp_char_stack.join("")
                  }
                  isLegalStart = true
              } else if (pre_char_type === "convert") {
                  switch (pre_stack_char_type) {
                      case "zh":
                          buffer = tmp_char_stack.join("")
                          break
                      case "en":
                          buffer = tmp_char_stack.join("")
                          break
                      case "convert":
                          break
                      case "hws":
                          buffer = tmp_char_stack.join("")
                          break
                      case "space":
                          buffer = tmp_char_stack.join("")
                          break
                      default:
                          buffer = tmp_char_stack.join("")
                  }
                  isLegalStart = true
              } else if (pre_char_type === "hws") {
                  switch (pre_stack_char_type) {
                      case "zh":
                          buffer = tmp_char_stack.join("")
                          break
                      case "en":
                          buffer = tmp_char_stack.join("")
                          break
                      case "convert":
                          buffer = tmp_char_stack.join("")
                          break
                      case "hws":
                          break
                      case "space":
                          buffer = tmp_char_stack.join("")
                          break
                      default:
                          buffer = tmp_char_stack.join("")
                  }
              } else if (pre_char_type === "space") {
                  switch (pre_stack_char_type) {
                      case "zh":
                          buffer = tmp_char_stack.join("")
                          break
                      case "en":
                          buffer = tmp_char_stack.join("")
                          break
                      case "convert":
                          buffer = tmp_char_stack.join("")
                          break
                      case "hws":
                          buffer = tmp_char_stack.join("")
                          break
                      case "space":
                          break
                      default:
                          buffer = tmp_char_stack.join("")
                  }
                  isLegalStart = true
              } else {
                  buffer = tmp_char_stack.join("")
              }


              tmp += buffer
              tmp_char_type_stack.push(pre_stack_char_type)
              tmp_char_stack = []
              tmp_char_stack.push(current)
              pre_stack_char_type = char_type
              return;
          }
      }
  };
  // 按照每一行单独处理
  let lines = str.split("\n")
  // cleanSpace
  step_params = []
  step_index = 0
  for (let index = 0; index < lines.length; index++) {
      let value = lines[index]
      if (config.cleanSpace) {
          tmp = ""
          pre_stack_char_type = ""
          tmp_char_stack = []
          tmp_char_type_stack = []
          for (let i = 0; i < value.length; i++) {
              char_int = value.charCodeAt(i)
              let char_type = ""
              if (convertStr[value[i]] !== undefined) {
                  char_type = "convert"
              } else if (char_int >= 0x4e00 && char_int <= 0x9fa5) {
                  char_type = "zh"
              } else if (char_int === 0xa || (char_int >= 0x21 && char_int <= 0x2f) ||
                  (char_int >= 0x3a && char_int <= 0x40) ||
                  (char_int >= 0x5b && char_int <= 0x60) ||
                  (char_int >= 0x7b && char_int <= 0x7e)) {
                  char_type = "hws"
              } else if (char_int === 0x20 || char_int === 0x9) {
                  char_type = "space"
              } else if (char_int >= 0x30 && char_int <= 0x39) {
                  char_type = "en"
              } else {
                  char_type = "en"
              }
              convert_func_clean_space(value[i], char_type, true)
          }
          if (tmp_char_stack.length > 0) {
              convert_func_clean_space("", "", true)
          }

          lines[index] = tmp
      }
  }
  // 执行step
  tmp = lines.join("\n")
  for (let i = 0; i < step_params.length; i++) {
      let replacer = `\${R${i}}`
      let param = step_params[i]
      param.total = step_params.length
      let value = param.to
      if (config.step) {
          value = config.step(param)
      }
      tmp = tmp.replace(replacer, value)
  }
  lines = tmp.split("\n")
  console.log("cleanSpace", tmp)
  // insert
  step_params = []
  step_index = 0
  for (let index = 0; index < lines.length; index++) {
      const value = lines[index]
      tmp = ""
      pre_stack_char_type = ""
      tmp_char_stack = []
      tmp_char_type_stack = []
      for (let i = 0; i < value.length; i++) {
          char_int = value.charCodeAt(i)
          let char_type = ""
          if (convertStr[value[i]] !== undefined) {
              char_type = "convert"
          } else if (char_int >= 0x4e00 && char_int <= 0x9fa5) {
              char_type = "zh"
          } else if (char_int === 0xa || (char_int >= 0x21 && char_int <= 0x2f) ||
              (char_int >= 0x3a && char_int <= 0x40) ||
              (char_int >= 0x5b && char_int <= 0x60) ||
              (char_int >= 0x7b && char_int <= 0x7e)) {
              char_type = "hws"
          } else if (char_int === 0x20 || char_int === 0x9) {
              char_type = "space"
          } else if (char_int >= 0x30 && char_int <= 0x39) {
              char_type = "en"
          } else {
              char_type = "en"
          }
          convert_func_insert(value[i], char_type, true)
      }
      if (tmp_char_stack.length > 0) {
          convert_func_insert("", "", true)
      }
      lines[index] = tmp
  }
  // 执行step
  tmp = lines.join("\n")
  for (let i = 0; i < step_params.length; i++) {
      let replacer = `\${R${i}}`
      let param = step_params[i]
      param.total = step_params.length
      let value = param.to
      if (config.step) {
          value = config.step(param)
      }
      tmp = tmp.replace(replacer, value)
  }
  lines = tmp.split("\n")
  console.log("insert", tmp)

  // convert
  for (let ci = 0; ci < config.convert.length; ci++) {
      let convert = {}
      convert[config.convert[ci][0]] = config.convert[ci][1]

      step_params = []
      step_index = 0
      for (let index = 0; index < lines.length; index++) {
          const value = lines[index]
          tmp = ""
          pre_stack_char_type = ""
          tmp_char_stack = []
          tmp_char_type_stack = []
          for (let i = 0; i < value.length; i++) {
              char_int = value.charCodeAt(i)
              let char_type = ""
              if (convert[value[i]] !== undefined) {
                  char_type = "convert"
              } else if (char_int >= 0x4e00 && char_int <= 0x9fa5) {
                  char_type = "zh"
              } else if (char_int === 0xa || (char_int >= 0x21 && char_int <= 0x2f) ||
                  (char_int >= 0x3a && char_int <= 0x40) ||
                  (char_int >= 0x5b && char_int <= 0x60) ||
                  (char_int >= 0x7b && char_int <= 0x7e)) {
                  char_type = "hws"
              } else if (char_int === 0x20 || char_int === 0x9) {
                  char_type = "space"
              } else if (char_int >= 0x30 && char_int <= 0x39) {
                  char_type = "en"
              } else {
                  char_type = "en"
              }
              convert_func_convert(value[i], char_type, convert, true)
          }
          if (tmp_char_stack.length > 0) {
              convert_func_convert("", "", convert, true)
          }
          lines[index] = tmp
      }
      // 执行step
      tmp = lines.join("\n")
      for (let i = 0; i < step_params.length; i++) {
          let replacer = `\${R${i}}`
          let param = step_params[i]
          param.total = step_params.length
          let value = param.to
          if (config.step) {
              value = config.step(param)
          }
          tmp = tmp.replace(replacer, value)
      }
      lines = tmp.split("\n")
  }
  tmp = lines.join("\n")
  console.log("convert", tmp)
  return tmp;
}

module.exports = {
  removeLeft,
  baseConfig,
  handler,
};
