export default class BitReader {
    buffer = [];
    index = 0; // 當前索引
    total = 0;

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
        let isUnicode = arr[0] === 0 && arr[1] === 255 && arr[2] === 254;
        if (encoding === 1) {
            let str = '';
            for (let i = isUnicode ? 3 : 0; i < arr.length; i += 2) {
                let code = BitReader.hex2Num([arr[i + 1], arr[i]]);
                if (code === 0) {
                    break;
                }
                str += String.fromCodePoint(code);
            }
            return str
        }
        let nullIndex = arr.findIndex(val => val === 0);
        if (nullIndex !== -1) {
            arr = arr.slice(0, nullIndex);
        }
        return String.fromCodePoint(...arr);
    }

    constructor(buffer) {
        this.bitCache = new Uint8Array();
        this.bitCache.__proto__.toStr = this.toStr;
        this.bitCache.__proto__.toNum = this.toNum;
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
        // this.bitCache.length = 0;
        this. bitCache = this.buffer.slice(this.index, this.index + count);
        // for (let index = this.index;index < this.index + count; index++) {
        //     this.bitCache.push(this.buffer.at(index));
        // }
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
    /**
     * 在數據裡找找結束標識
     * @param {*} flag 結束標識
     * @param {*} start 開始位置
     * @param {*} end 結束位置
     * @returns {number} 相對開始得索引, 未找到-1
     */
    findIndex(flag, start = this.index, end = this.buffer.length) {
        let seachArr = flag.length ? flag : [flag];
        let startIndex = start;
        let endIndex = end;
        let index = startIndex;
        while (this.buffer[index] !== undefined) {
            let allTrue = seachArr.every((val, i) => val === this.buffer[index + i]);
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
