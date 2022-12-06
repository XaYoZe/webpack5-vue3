let Latin1 = new TextDecoder('ISO-8859-1'); // ASCII
const utf16le = new TextDecoder('utf-16le');
const utf16be = new TextDecoder('utf-16be');
const utf8 = new TextDecoder('utf-8');
const gbk = new TextDecoder('gbk');
class BitReader {
    buffer = [];
    index = 0; // 當前索引
    totalSize = 0;
    bitCache = {};

    static HexToNum(arr) {
        let length = arr.length;
        if (!length) return arr;
        let num = 0;
        for (let i = 0; i < length; i++) {
            // 將數組左移後相加, 16進制每次移動8位
            num += arr[i] << 8 * (length - 1 - i);
        }
        return num
    }
    static HexToStr(arr, encoding) {
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
                // 超過編碼範圍的 0x7f
                if (arr.some(val => val > 0x7f)) return gbk.decode(arr);
                return Latin1.decode(arr);
        }
    }

    /**
     * 10轉其他進制並填充長度
     * @param {*} arr 數值
     * @param {*} radix 進制
     * @param {*} padding 每個值長度, 不夠前面填0, 多了切除
     * @returns 
     */
    static DecTranslate (arr, radix  = 2, padding = 8) {
        if (!arr) return;
        let str = '';
        (arr.length ? arr : [arr]).map(num => {
            let val = num.toString(radix);
            str += val.length > padding ? val.slice(-padding) : val.padStart(padding, 0);
        });
        return str;
    }

    // 簡易截取數據方法, 對src進行取值
    static Slice(src) {
        let index = 0;
        let sliceSrc = src;
        return (size) => {
            let res = sliceSrc.slice(index, index + size);
            index += size;
            if (index === sliceSrc.length) { sliceSrc = ''; };
            return res;
        }
    }

    constructor(buffer) {
        // 掛載方法
        this.bitCache = new Uint8Array();
        this.bitCache.__proto__.toStr = this.toStr;
        this.bitCache.__proto__.toNum = this.toNum;
        this.bitCache.__proto__.toBit = this.toBit;
        
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
        this.bitCache = this.buffer.slice(this.index, this.index + count);
        this.index += count + skip;
        return this.bitCache;
    }
    toStr (encoding = 0) {
        return BitReader.HexToStr(this, encoding);
    }
    toNum () {
        return BitReader.HexToNum(this);
    }
    toBit (padding = 8) {
        return BitReader.DecTranslate(this, 2, padding);
    }
    skip(count) {
        this.index += count;
    }
    // 查找結尾
    findTextEnd (encoding) {
        // 编码结尾
        let flag  = (encoding == 0 || encoding === 3) ? [0x00] : [0x00, 0x00];
        let index = this.findIndex(flag);
        // 结尾算上标识， 模是为防止结尾有3个0
        index = (index + flag.length) + ( index % flag.length);
        // 加上結尾字符數
        return index;
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
            // 篩選匹配結果
            let allTrue = seachArr.every((val, i) => {
                if (val === '*' || val === this.buffer[index + i]) return true;
                if (/^</.test(val)) {
                    return this.buffer[index + i] < Number(val.slice(1))
                }
                if (/^>/.test(val)) {
                    return this.buffer[index + i] >  Number(val.slice(1))
                }
            });
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
    resetIndex (index) {
        this.index = index;
        this.bitCache = [];
    }
}

module.exports = BitReader;