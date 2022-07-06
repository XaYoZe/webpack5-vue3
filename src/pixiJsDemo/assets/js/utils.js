
// 按键事件
export class Keyboard {
    constructor () {
        // 事件列表
        this.keyEventList = [];
        // 事件id
        this.eventId = 0;
        this.keyEventList.id = [];
        // 按下事件
        this.press = (event) => {
            this.keyEventList.forEach(item => {
                if (event.key === item.key) {
                    if (item.longTap) item.longTap();
                    if (item.isDown && item.release) item.release();
                    item.isDown = true;
                    item.isUp = false;
                    event.preventDefault();
                }
            })
        }
        // 弹起事件
        this.release = (event) => {
            this.keyEventList.forEach(item => {
                if (event.key === item.key) {
                    if (item.isDown && item.release) item.release();
                    item.isDown = false;
                    item.isUp = true;
                    event.preventDefault();
                }
            })
        }
    
        window.addEventListener("keydown", this.press, false);
        window.addEventListener("keyup", this.release, false);
    }
    // 卸载
    destory () {
        this.keyEventList.length = 0;
        window.removeEventListener("keydown", this.press);
        window.removeEventListener("keyup", this.release);
    };
    // 添加事件
    add (value) {
        let obj = {
            isUp: true,
            isDown: false,
        };
        obj.key = value;
        obj.id = this.keyEventList.id++;
        obj.remove = () => {
            let index = this.keyEventList.findIndex((item) => item.id === obj.id);
            this.keyEventList.splice(index, 1);
        }
        this.keyEventList.push(obj);
        return obj;
    }
}

export let interval = {
    // 相交
    intersect (rect1, rect2) {
        return (Math.max(rect1[0], rect1[2]) >= Math.min(rect2[0], rect2[2]) && Math.max(rect1[0], rect1[2]) <= Math.max(rect2[0], rect2[2]) || Math.min(rect1[0], rect1[2]) >= Math.min(rect2[0], rect2[2]) && Math.min(rect1[0], rect1[2]) <= Math.max(rect2[0], rect2[2])) &&
        (Math.max(rect1[1], rect1[3]) >= Math.min(rect2[1], rect2[3]) && Math.max(rect1[1], rect1[3]) <= Math.max(rect2[1], rect2[3]) || Math.min(rect1[1], rect1[3]) >= Math.min(rect2[1], rect2[3]) && Math.min(rect1[1], rect1[3]) <= Math.max(rect2[1], rect2[3]));
    },
    // 包含 a 包含 b
    contains (rect1, rect2) {
        return Math.max(rect1[0], rect1[2]) >= Math.max(rect2[0], rect2[2]) &&
        Math.min(rect1[0], rect1[2]) <= Math.min(rect2[0], rect2[2]) &&
        Math.max(rect1[1], rect1[3]) >= Math.max(rect2[1], rect2[3]) &&
        Math.min(rect1[1], rect1[3]) <= Math.min(rect2[1], rect2[3])
    },
    // 包含点
    containsPoint (rect, point) {
        return Math.max(rect[0], rect[2]) >= point[0] && point[0] >= Math.min(rect[0], rect[2]) &&
        Math.max(rect[1], rect[3]) >= point[1] && point[1] >= Math.min(rect[1], rect[3]);
    }
}