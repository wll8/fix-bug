const FullWidth = "Full-width character"
const HalfWidth = "Half-width character"

const CharTypeChinese = "zh"
const CharTypeEnglish = "en"
const CharTypeChineseSymbol = "zhs"
const CharTypeSymbol = "hws"
const CharTypeSpace = "space"
const CharTypeDigit = "num"
const CharTypeIgnore = "ignore"

const CharTypeUnknown = "unknown"

const CharOpTypeChinese = "zh"
const CharOpTypeEnglish = "en"
const CharOpTypeSymbol = "hws"
const CharOpTypeSpace = "space"
const CharOpTypeDigit = "num"
const CharOpTypeConvert = "convert"
const CharOpTypeIgnore = "ignore"

// 中文标点字符集
const ChineseSymbolRange = [0x3002, 0xff1b, 0xff0c, 0xff1a, 0x201c, 0x201d, 0xff08, 0xff09, 0x3001, 0xff1f, 0x300a, 0x300b, 0xff01, 0x3010, 0x3011, 0xffe5]

// step阶段是否自动移出 替换字符串两端多的空格
// 若是两边都是全角且中间有空格，则移出空格
const AutoRemoveSpaceInStep = false

// 是否是全角字符
function isFullWidth(code) {
    if ((code >= 0x4E00 && code <= 0x9FFF) ||
        (code >= 0x3400 && code <= 0x4DBF) ||
        (code >= 0xF900 && code <= 0xFAFF) ||
        (code >= 0x3300 && code <= 0x33FF) ||
        (code >= 0x3000 && code <= 0x303F) ||
        (code >= 0xFF00 && code <= 0xFFEF)) {
        return true;
    }
    return false;
}

// 获取字符串的类型、字宽（半角全角）等
function get_char_type(ch) {
    const char_int = ch.charCodeAt(0)
    const code = isFullWidth(char_int) ? FullWidth : HalfWidth
    // 汉子字符集
    if (char_int >= 0x4e00 && char_int <= 0x9fa5) {
        return {type: CharTypeChinese, width: code}
    }
    if (ChineseSymbolRange.includes(char_int)) {
        return {type: CharTypeChineseSymbol, width: code}
    }
    // A-Z a-Z
    if ((char_int >= 0x41 && char_int <= 0x51) ||
        (char_int >= 0x61 && char_int <= 0x71)) {
        return {type: CharTypeEnglish, width: code}
    }
    // [ '!', '"', '#', '$', '%', '&',
    //     "'", '(', ')', '*', '+', ',', '-',
    //     '.', '/', ':', ';', '<', '=', '>',
    //     '?', '@', '[', '\', ']', '^', '_',
    // '`', '{', '|', '}', '~']
    if (char_int === 0xa || (char_int >= 0x21 && char_int <= 0x2f) ||
        (char_int >= 0x3a && char_int <= 0x40) ||
        (char_int >= 0x5b && char_int <= 0x60) ||
        (char_int >= 0x7b && char_int <= 0x7e)) {
        return {type: CharTypeSymbol, width: code}
    }
    // [' ', '\t']
    if (char_int === 0x20 || char_int === 0x9) {
        return {type: CharTypeSpace, width: code}
    }
    // 0-9
    if (char_int >= 0x30 && char_int <= 0x39) {
        return {type: CharTypeDigit, width: code}
    }

    return {type: CharTypeUnknown, width: code}
}

function get_op_type(ch, convert_map, config, action) {
    const char_int = ch.charCodeAt(0)
    // ignore最优先
    if (config.ignore) {
        if (Array.isArray(config.ignore)) {
            if (config.ignore.includes(ch)) {
                return CharOpTypeIgnore
            }
        }
    }

    if (action === "convert" || action === "cleanSpace" || action === "insert") {
        // convert
        if (convert_map[ch] !== undefined) {
            return CharOpTypeConvert
        }
    }
    // 汉子字符集
    if (char_int >= 0x4e00 && char_int <= 0x9fa5) {
        return CharOpTypeChinese
    }
    // 汉字标点
    if (ChineseSymbolRange.includes(char_int)) {
        return CharOpTypeChinese
    }

    // [ '!', '"', '#', '$', '%', '&',
    //     "'", '(', ')', '*', '+', ',', '-',
    //     '.', '/', ':', ';', '<', '=', '>',
    //     '?', '@', '[', '\', ']', '^', '_',
    // '`', '{', '|', '}', '~']
    if (char_int === 0xa || (char_int >= 0x21 && char_int <= 0x2f) ||
        (char_int >= 0x3a && char_int <= 0x40) ||
        (char_int >= 0x5b && char_int <= 0x60) ||
        (char_int >= 0x7b && char_int <= 0x7e)) {
        return CharOpTypeSymbol
    }
    // [' ', '\t']
    // if (char_int === 0x20 || char_int === 0x9) {
    //     return CharOpTypeSpace
    // }
    if (config.cleanSpace) {
        if (Array.isArray(config.cleanSpace)) {
            if (config.cleanSpace.includes(ch)) {
                // 如果是在插入阶段，且匹配的字符不是空格或者\t
                if (!(char_int === 0x20 || char_int === 0x9) && action === "insert") {
                    return CharOpTypeEnglish
                }
                return CharOpTypeSpace
            }
        } else {
            if (char_int === 0x20 || char_int === 0x9) {
                return CharOpTypeSpace
            }
        }
    }
    if (char_int === 0x20 || char_int === 0x9) {
        return CharOpTypeSymbol
    }

    // 0-9
    if (char_int >= 0x30 && char_int <= 0x39) {
        return CharOpTypeEnglish
    }
    // 全角字符当做中文对待
    if (isFullWidth(char_int)) {
        return CharOpTypeChinese
    }
    return CharTypeEnglish
}


class BaseFormat {
    constructor(config, step_callback, step_index, step_params) {
        this.config = config
        this.step_callback = step_callback
        this.step_index = step_index
        this.step_params = step_params

        // 临时栈
        this.tmp_char_stack = []
        // 临时栈里的字符类型
        this.tmp_char_type = {}
        // 临时栈里的字符操作
        this.tmp_char_op_type = ""


        // 字符串终栈，记录存储过的字符类型
        this.char_type_stack = []
        // 字符串终栈，记录存储过的字符操作类型
        this.op_type_stack = []
        // 字符串累加
        this.tmp = ""
    }

    // 获取临时栈里的最上面的字符的类型
    get_top_char_type() {
        return this.char_type_stack.length > 0 ? this.char_type_stack[this.char_type_stack.length - 1] : {
            type: CharTypeUnknown,
            width: HalfWidth
        }
    }


    get_top_op_type() {
        return this.op_type_stack.length > 0 ? this.op_type_stack[this.op_type_stack.length - 1] : ""
    }


    step(context) {
        for (let i = 0; i < this.step_params.length; i++) {
            let replacer = `\${R${i}}`
            let param = this.step_params[i]
            param.total = this.step_params.length
            let value = param.to
            if (this.config.step) {
                value = this.config.step(param)
            }
            // 替换时候需要考虑全角/半角，处理原来的空格
            let pos = context.indexOf(replacer)
            let left = context.substr(0, pos)
            let right = context.substr(pos + replacer.length, context.length - pos - replacer.length)
            if (AutoRemoveSpaceInStep) {
                let left_char_type = undefined
                let right_char_type = undefined
                let v_left_char_type = undefined
                let v_right_char_type = undefined
                if (left.length > 0) {
                    let fl = left[left.length - 1]
                    left_char_type = get_char_type(fl)
                }
                if (right.length > 0) {
                    let rl = right[0]
                    right_char_type = get_char_type(rl)
                }
                if (value.length > 0) {
                    let fl = value[0]
                    v_left_char_type = get_char_type(fl)
                    let rl = value[value.length - 1]
                    v_right_char_type = get_char_type(rl)
                }
                if (left_char_type && left_char_type.type === CharOpTypeSpace && v_left_char_type && v_left_char_type.width === FullWidth) {
                    if (left.length > 1) {
                        let fl = left[left.length - 2]
                        let _type = get_char_type(fl)
                        if (_type.width === FullWidth) {
                            left = left.substr(0, left.length - 1)
                        }
                    }
                }
                if (right_char_type && right_char_type.type === CharOpTypeSpace && v_right_char_type && v_right_char_type.width === FullWidth) {
                    if (right.length > 1) {
                        let fl = right[1]
                        let _type = get_char_type(fl)
                        if (_type.width === FullWidth) {
                            right = right.substr(1, right.length)
                        }
                    }
                }
            }
            context = left + value + right
        }
        return context
    }

}

class CleanSpaceFormat extends BaseFormat {
    constructor(config, step_callback, step_index, step_params) {
        super(config, step_callback, step_index, step_params);
    }


    run(current_char, current_op_type) {
        let pre_char_type = this.get_top_char_type()
        let pre_op_type = this.get_top_op_type()

        // 刚开始新增
        if (this.tmp_char_stack.length === 0) {
            this.tmp_char_stack.push(current_char)
            this.tmp_char_op_type = current_op_type
            this.tmp_char_type = get_char_type(current_char)
            return
        }

        // 和栈中前一个字符串操作类型是否相同
        if (this.tmp_char_op_type === current_op_type) {
            // 判断字符类型：全角半角等
            this.tmp_char_stack.push(current_char)
            return;
        }
        // console.log("cleanSpace", this.tmp, this.tmp_char_stack, current_char, pre_op_type, this.tmp_char_op_type, current_op_type)

        let b = this.tmp_char_stack.join("")
        let buffer = b
        const end = () => {
            this.tmp += buffer
            this.op_type_stack.push(this.tmp_char_op_type)
            this.char_type_stack.push(this.tmp_char_type)
            this.tmp_char_stack = []
            this.tmp_char_stack.push(current_char)
            this.tmp_char_op_type = current_op_type
        }
        let replace = {}
        // 先看右边是否是ignore
        if (current_op_type === CharOpTypeIgnore) {


        }
        if (this.tmp_char_op_type === CharOpTypeSpace) {
            if (this.tmp_char_stack.length > 1) {
                if (this.step_callback) {
                    if ((typeof (this.config.cleanSpace) === "boolean" && this.config.cleanSpace) ||
                        (Array.isArray(this.config.cleanSpace) && this.config.cleanSpace.length > 0)) {
                        // 不触发回调
                        if (b === this.config.insert) {
                            buffer = b
                            end()
                            return;
                        } else {
                            replace = {
                                from: b,
                                to: this.config.insert,
                                index: this.step_index,
                                total: 0,
                            }
                            buffer = `\${R${this.step_index}}`
                            this.step_params.push(replace)
                            this.step_index += 1
                            end()
                            return;
                        }
                    }
                } else {
                    if (this.config.cleanSpace) {
                        buffer = this.config.insert
                        end()
                        return;
                    }
                }
            }
        }


        // this.tmp += buffer
        // this.op_type_stack.push(this.tmp_char_op_type)
        // this.char_type_stack.push(this.tmp_char_type)
        // this.tmp_char_stack = []
        // this.tmp_char_stack.push(current_char)
        // this.tmp_char_op_type = current_op_type
        end()
        return;
    };
}

class InsertFormat extends BaseFormat {
    constructor(config, step_callback, step_index, step_params, line_start) {
        super(config, step_callback, step_index, step_params);
        this.line_start = line_start
    }

    run(current_char, current_op_type) {
        let pre_char_type = this.get_top_char_type()
        let pre_op_type = this.get_top_op_type()

        // 刚开始新增
        if (this.tmp_char_stack.length === 0) {
            this.tmp_char_stack.push(current_char)
            this.tmp_char_op_type = current_op_type
            this.tmp_char_type = get_char_type(current_char)
            return
        }

        // 和栈中前一个字符串操作类型是否相同
        if (this.tmp_char_op_type === current_op_type) {
            // 判断字符类型：全角半角等
            this.tmp_char_stack.push(current_char)
            return;
        }

        // console.log("insert", this.tmp, this.tmp_char_stack, current_char, pre_op_type, this.tmp_char_op_type, current_op_type)
        let buffer = this.tmp_char_stack.join("")
        const end = () => {
            this.tmp += buffer
            this.op_type_stack.push(this.tmp_char_op_type)
            this.char_type_stack.push(this.tmp_char_type)
            this.tmp_char_stack = []
            this.tmp_char_stack.push(current_char)
            this.tmp_char_op_type = current_op_type
        }
        let replace = {}
        if (pre_op_type === CharOpTypeChinese) {
            this.line_start = true
            if (this.tmp_char_op_type === CharOpTypeEnglish) {
                if (this.step_callback) {
                    replace = {
                        from: "",
                        to: this.config.insert,
                        index: this.step_index,
                        total: 0,
                    }
                    buffer = `\${R${this.step_index}}` + this.tmp_char_stack.join("")
                    this.step_params.push(replace)
                    this.step_index += 1
                    end()
                    return;
                }
                buffer = this.config.insert + this.tmp_char_stack.join("")
                end()
                return;
            }
            if (this.tmp_char_op_type === CharOpTypeSymbol) {
                let b = buffer
                if (b.startsWith(this.config.insert)) {
                    end()
                    return;
                }
                buffer = this.config.insert + b
                if (this.step_callback) {
                    replace = {
                        from: "",
                        to: this.config.insert,
                        index: this.step_index,
                        total: 0,
                    }
                    buffer = `\${R${this.step_index}}` + b
                    this.step_params.push(replace)
                    this.step_index += 1
                    end()
                    return;
                }
                buffer = this.config.insert + b
                end()
                return;
            }
            if (this.tmp_char_op_type === CharOpTypeConvert) {
                const ct = get_char_type(this.tmp_char_stack[0])
                if (ct.width === HalfWidth && (ct.type === CharTypeEnglish || ct.type === CharTypeDigit)) {
                    if (this.step_callback) {
                        replace = {
                            from: "",
                            to: this.config.insert,
                            index: this.step_index,
                            total: 0,
                        }
                        buffer = `\${R${this.step_index}}` + this.tmp_char_stack.join("")
                        this.step_params.push(replace)
                        this.step_index += 1
                        end()
                        return;
                    }
                    buffer = this.config.insert + this.tmp_char_stack.join("")
                    end()
                    return;
                }
            }
        } else if (pre_op_type === CharOpTypeEnglish) {
            this.line_start = true
            if (this.tmp_char_op_type === CharOpTypeChinese) {
                if (this.step_callback) {
                    replace = {
                        from: "",
                        to: this.config.insert,
                        index: this.step_index,
                        total: 0,
                    }
                    buffer = `\${R${this.step_index}}` + this.tmp_char_stack.join("")
                    this.step_params.push(replace)
                    this.step_index += 1
                    end()
                    return;
                }
                buffer = this.config.insert + this.tmp_char_stack.join("")
                end()
                return;
            }
        } else if (pre_op_type === CharOpTypeConvert) {
            this.line_start = true
            if (this.tmp_char_op_type === CharOpTypeChinese) {
                if (this.tmp.length <= 0) {
                    end()
                    return;
                }

                let last_char_type = get_char_type(this.tmp[this.tmp.length - 1])
                if (last_char_type.width === HalfWidth) {
                    if (this.step_callback) {
                        replace = {
                            from: "",
                            to: this.config.insert,
                            index: this.step_index,
                            total: 0,
                        }
                        buffer = `\${R${this.step_index}}` + this.tmp_char_stack.join("")
                        this.step_params.push(replace)
                        this.step_index += 1
                        end()
                        return;
                    }
                    buffer = this.config.insert + this.tmp_char_stack.join("")
                    end()
                    return;
                }
            }
        } else if (pre_op_type === CharOpTypeSymbol) {
            if (this.tmp_char_op_type === CharOpTypeChinese) {
                if (this.line_start) {
                    if (this.tmp.endsWith(this.config.insert) || this.tmp.endsWith(" ") || this.tmp.endsWith("\t")) {
                        end()
                        return;
                    }
                    if (this.step_callback) {
                        replace = {
                            from: "",
                            to: this.config.insert,
                            index: this.step_index,
                            total: 0,
                        }
                        buffer = `\${R${this.step_index}}` + this.tmp_char_stack.join("")
                        this.step_params.push(replace)
                        this.step_index += 1
                        end()
                        return;
                    }
                    buffer = this.config.insert + this.tmp_char_stack.join("")
                    end()
                    return;

                }
                end()
                return;
            }
        } else if (pre_op_type === CharOpTypeSpace) {
            this.line_start = true
        }

        end()
        return;
    };

}

class ConvertFormat extends BaseFormat {
    constructor(config, step_callback, step_index, step_params) {
        super(config, step_callback, step_index, step_params);
    }

    run(current_char, current_op_type, convert_map) {
        let pre_char_type = this.get_top_char_type()
        let pre_op_type = this.get_top_op_type()

        // 刚开始新增
        if (this.tmp_char_stack.length === 0) {
            this.tmp_char_stack.push(current_char)
            this.tmp_char_op_type = current_op_type
            this.tmp_char_type = get_char_type(current_char)

            return
        }

        // 和栈中前一个字符串操作类型是否相同
        if (this.tmp_char_op_type === current_op_type) {
            // 判断字符类型：全角半角等
            this.tmp_char_stack.push(current_char)
            return;
        }


        // a1a的情况 convert + en + en
        if (this.tmp_char_op_type === CharOpTypeConvert && (current_op_type === CharOpTypeEnglish || current_op_type === CharOpTypeDigit)) {
            const ct = get_char_type(this.tmp_char_stack[0])
            if (ct.width === HalfWidth && (ct.type === CharTypeEnglish || ct.type === CharTypeDigit)) {
                this.tmp_char_stack.push(current_char)
                return;
            }
        }

        // console.log("convert", this.tmp, this.tmp_char_stack, current_char, pre_op_type, this.tmp_char_op_type, current_op_type)

        let buffer = this.tmp_char_stack.join("")
        const end = () => {
            this.tmp += buffer
            this.op_type_stack.push(this.tmp_char_op_type)
            this.char_type_stack.push(this.tmp_char_type)
            this.tmp_char_stack = []
            this.tmp_char_stack.push(current_char)
            this.tmp_char_op_type = current_op_type
        }
        const get_convert_buffer = () => {
            if (this.step_callback) {
                buffer = this.tmp_char_stack.map((v, index) => {
                    if (index < this.tmp_char_stack.length - 1) {
                        return v
                    }
                    replace = {
                        from: v,
                        to: convert_map[v],
                        index: this.step_index,
                        total: 0,
                    }
                    this.step_params.push(replace)
                    this.step_index += 1
                    return `\${R${this.step_index - 1}}`
                }).join("")
                return;
            }
            buffer = this.tmp_char_stack.map((v, index) => {
                if (index < this.tmp_char_stack.length - 1) {
                    return v
                }
                return convert_map[v]
            }).join("")
            return;
        }
        let replace = {}
        if (this.tmp_char_op_type === CharOpTypeConvert) {
            // 在词语中间 en.en
            if (pre_op_type === CharOpTypeEnglish && current_op_type === CharOpTypeEnglish) {
                end()
                return;
            }
            // 在英文词语结尾 en.
            if (this.tmp_char_stack.length === 1 && pre_op_type === CharOpTypeEnglish && !this.config.convertEnd) {
                const ct = get_char_type(this.tmp_char_stack[0])
                if (ct.width === HalfWidth && (ct.type === CharTypeEnglish || ct.type === CharTypeDigit)) {
                    get_convert_buffer()
                    end()
                    return;
                }

                end()
                return;
            }

            //  a好
            if (this.tmp_char_stack.length === 1 && pre_op_type !== CharOpTypeEnglish && current_op_type !== CharOpTypeEnglish) {
                const ct = get_char_type(this.tmp_char_stack[0])
                if (pre_op_type !== CharTypeSpace && current_op_type === CharTypeSpace) {
                    get_convert_buffer()
                    end()
                    return;
                }
                if (ct.width === HalfWidth && (ct.type === CharTypeEnglish || ct.type === CharTypeDigit)) {
                    end()
                    return;
                }

            }

            // 中文.id
            // 你a  b
            if (this.tmp_char_stack.length === 1 && pre_op_type !== CharOpTypeEnglish && current_op_type !== "") {
                if (get_char_type(this.tmp_char_stack[0]).width === FullWidth) {
                    end()
                    return;
                }
                get_convert_buffer()
                end()
                return;
            }

            if (this.tmp_char_stack.length === 1 && pre_op_type !== CharOpTypeEnglish && current_op_type === "") {
                // 被分隔的符号结尾，中文 .
                if (this.tmp_char_stack.length === 1 && (this.tmp.endsWith("\t") || this.tmp.endsWith(" ")) &&
                    current_op_type === "" && get_char_type(this.tmp_char_stack[0]).type === CharTypeSymbol) {
                    end()
                    return;
                }
                get_convert_buffer()
                end()
                return;
            }
            // 你a	 bb b aab	 bb b a1b	 bb b a好。
            if (this.tmp_char_stack.length > 1 && this.tmp_char_op_type === CharOpTypeEnglish) {
                get_convert_buffer()
                end()
                return;
            }

            get_convert_buffer()
            end()
            return;
        }

        end()
        return;
    };

}


function Format({str, config}) {
    let convert_map = {}
    for (let ci = 0; ci < config.convert.length; ci++) {
        convert_map[config.convert[ci][0]] = config.convert[ci][1]
    }
    let tmp = '';

    // 按照每一行单独处理
    let lines = str.split("\n")
    let step_params = []
    let step_index = 0
    let format = undefined

    //  runOrder:  [`cleanSpace`, `insert`, `convert`],
    for (let order of config.runOrder) {
        switch (order) {
            case "cleanSpace":
                // cleanSpace
                step_params = []
                step_index = 0
                for (let index = 0; index < lines.length; index++) {
                    let value = lines[index]
                    if ((typeof (config.cleanSpace) === "boolean" && config.cleanSpace) ||
                        (Array.isArray(config.cleanSpace) && config.cleanSpace.length > 0)) {
                        let format = new CleanSpaceFormat(config, true, step_index, step_params)
                        for (let i = 0; i < value.length; i++) {
                            let char_type = get_op_type(value[i], convert_map, config, order)
                            format.run(value[i], char_type)
                        }
                        if (format.tmp_char_stack.length > 0) {
                            format.run("", "")
                        }
                        lines[index] = format.tmp
                        step_index = format.step_index
                        step_params = format.step_params
                    }
                }
                // 执行step
                tmp = lines.join("\n")
                format = new CleanSpaceFormat(config, true, step_index, step_params)
                tmp = format.step(tmp)
                lines = tmp.split("\n")
                console.log("cleanSpace", tmp)
                break
            case "insert":
                // insert
                step_params = []
                step_index = 0
                let line_start = false
                for (let index = 0; index < lines.length; index++) {
                    const value = lines[index]
                    let format = new InsertFormat(config, true, step_index, step_params, line_start)
                    for (let i = 0; i < value.length; i++) {
                        let char_type = get_op_type(value[i], convert_map, config, order)
                        format.run(value[i], char_type)
                    }
                    if (format.tmp_char_stack.length > 0) {
                        format.run("", "")
                    }
                    lines[index] = format.tmp
                    step_index = format.step_index
                    step_params = format.step_params
                    line_start = format.line_start
                }
                // 执行step
                tmp = lines.join("\n")
                format = new InsertFormat(config, true, step_index, step_params, line_start)
                tmp = format.step(tmp)
                lines = tmp.split("\n")
                console.log("insert", tmp)
                break
            case "convert":
                // convert
                for (let ci = 0; ci < config.convert.length; ci++) {
                    let convert = {}
                    convert[config.convert[ci][0]] = config.convert[ci][1]

                    step_params = []
                    step_index = 0
                    for (let index = 0; index < lines.length; index++) {
                        const value = lines[index]
                        let format = new ConvertFormat(config, true, step_index, step_params)
                        for (let i = 0; i < value.length; i++) {
                            let char_type = get_op_type(value[i], convert, config, order)
                            format.run(value[i], char_type, convert)
                        }
                        if (format.tmp_char_stack.length > 0) {
                            format.run("", "", convert)
                        }
                        lines[index] = format.tmp
                        step_index = format.step_index
                        step_params = format.step_params
                    }
                    // 执行step
                    tmp = lines.join("\n")
                    format = new ConvertFormat(config, true, step_index, step_params)
                    tmp = format.step(tmp)
                    lines = tmp.split("\n")
                }
                tmp = lines.join("\n")
                console.log("convert", tmp)
                break
        }
    }


    return tmp;
}

module.exports = {
    Format,
};
