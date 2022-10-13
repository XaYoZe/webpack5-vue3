let Latin1 = new TextDecoder('ISO-8859-1'); // ASCII
const utf16le = new TextDecoder('utf-16le');
const utf16be = new TextDecoder('utf-16be');
const utf8 = new TextDecoder('utf-8');
// let unicode = new TextDecoder('Unicode');
let gbk = new TextDecoder('gbk');
export default class BitReader {
    buffer = [];
    index = 0; // 當前索引
    totalSize = 0;

    static hex2Num(arr) {
        let length = arr.length;
        if (!length) return arr;
        let num = 0;
        for (let i = 0; i < length; i++) {
            // 將數組左移後相加, 16進制每次移動8位
            num += arr[i] << 8 * (length - 1 - i);
        }
        return num
    }
    static hex2Str(arr, encoding) {
        if (!arr.length) return '';
        if ((encoding === 0 || encoding === 3) ? arr[arr.length  - 1]=== 0 : arr[arr.length  - 1]=== 0 && arr[arr.length - 2] === 0) {
            arr = arr.slice(0, (encoding === 0 || encoding === 3) ? -1 : -2);
        }
        switch (encoding) {
            case 1:
            case 2: 
                // return utf16be.decode(arr);
                if (arr[0] === 255 && arr[1] == 254)
                    return utf16le.decode(arr);
                return utf16be.decode(arr);
            case 3:
                return utf8.decode(arr);
            default:
                if (arr[arr.length - 1] === 0) {
                    return Latin1.decode(arr.slice(0, -1));
                }
                // 超過編碼範圍的 0x7f
                if (arr.some(val => val > 0x7f)) return gbk.decode(arr);
                return Latin1.decode(arr);
        }
    }

    constructor(buffer) {
        this.bitCache = new Uint8Array();
        this.bitCache.__proto__.toStr = this.toStr;
        this.bitCache.__proto__.toNum = this.toNum;
        this.totalSize = buffer.length;
        if (buffer.constructor === Uint8Array) {
            this.buffer = buffer;
        } else if (buffer.constructor === ArrayBuffer) {
            this.buffer = new Uint8Array(buffer);
        } else {
            console.error('格式錯誤');
            return
        }
    }
    read (count, skip = 0) {
        this. bitCache = this.buffer.slice(this.index, this.index + count);
        this.index += count + skip;
        return this.bitCache;
    }
    toStr (encoding) {
        return BitReader.hex2Str(this, encoding);
    }
    toNum () {
        return BitReader.hex2Num(this);
    }
    skip(count) {
        this.index += count;
    }
    // 查找結尾
    findTextEnd (encoding) {
        let flag  = encoding == 0 || encoding === 3 ? [0x00] : [0x00, 0x00];
        let index = this.findIndex(flag);
        // 加上結尾字符數
        return index + ((encoding === 0 || encoding === 3) ? 1 : 2);
    }
    /**
     * 在數據裡找找結束標識
     * @param {*} flag 標識 * 為通用符
     * @param {*} start 開始位置
     * @param {*} end 結束位置
     * @returns {number} 相對開始得索引, 未找到-1
     */
    findIndex(flag, option = { start: this.index, end: this.buffer.length}) {
        let seachArr = flag.length ? flag : [flag];
        let startIndex = option.start;
        let endIndex = option.end;
        let index = startIndex;
        while (this.buffer[index] !== undefined) {
            let allTrue = seachArr.every((val, i) => val === '*' || val === this.buffer[index + i]);
            // 找到拋出索引
            if (allTrue) {
                return index - startIndex;
            }
            // 超過限制還沒有找到, 退出
            if (index > endIndex) {
                return -1
            }
            index++;
        }
        return -1;
    }
}
