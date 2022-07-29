<template>
  <div ref="demo1">
    <span>{{score}}</span>
  </div>
</template>
<script>
import * as PIXI from "pixi.js";
import { Keyboard, interval } from '@js/utils';
export default {
  data () {
      return {
        canvasSize: [1280, 720],
        snackSize:  10,
        gameStatus: 2, // 1. 游戏前, 2.游戏中, 3.游戏后
        score: 100,
        direction: [],
        curDirection: '',
        foodNum: 1,
        foodList: [],
        head: null,
        body: null,
      }
  },
  mounted() {
    this.initApp();
  },
  methods: {
    initApp() {
      this.app = new PIXI.Application({
        width: this.canvasSize[0],
        height: this.canvasSize[1],
        antialias: true,
        backgroundAlpha: 0.1,
        resolution: window.devicePixelRatio,
      });
      this.$refs.demo1.appendChild(this.app.view);
      this.canvasBound = new PIXI.Rectangle(5, 5, this.canvasSize[0] - 10, this.canvasSize[1] - 10);
      this.createHead();
      this.createBody();
      this.createFood();
      this.initEvent();
    },
    initEvent () {
        let keyboard = new Keyboard()
        let left = keyboard.add('ArrowLeft'),
             up = keyboard.add("ArrowUp"),
             right = keyboard.add("ArrowRight"),
             down = keyboard.add("ArrowDown");
      left.press  = this.keyEvent; 
      right.press = this.keyEvent
      up.press = this.keyEvent;
      down.press = this.keyEvent;
      this.app.ticker.add(this.draw);
    },
    keyEvent (event) {
        if (this.gameStatus !== 2) return;
        let obj = {coor: [this.head.x, this.head.y], dir: [0,0]}
        // console.log(this.direction);
        if ([false])
        switch (event.key) {
            case 'ArrowLeft':
                this.head.vx += -0.5;
                this.head.vy = 0;
                this.head.angle = 270;
                obj.dir = [1, 0];
                break;
            case 'ArrowRight':
                this.head.vx += 0.5;
                this.head.vy = 0;
                this.head.angle = 90;
                obj.dir = [-1, 0];
                this.curDirection = 2;
                break;
            case 'ArrowUp':
                this.head.vx = 0;
                this.head.vy += -0.5;
                this.head.angle = 0;
                obj.dir = [0, 1];
                this.curDirection = 1;
                break;
            case 'ArrowDown':
                this.head.vx = 0;
                this.head.vy += 0.5;
                this.head.angle = 180;
                obj.dir = [0, -1];
                this.curDirection = 3;
                break;
            default:
                break;
        }
        this.curDirection = event.key;
        this.direction.unshift(obj);
    },
    // 渲染
    draw (delta) {
        let x = this.head.x + this.head.vx;
        let y = this.head.y + this.head.vy;
        // let point = new PIXI.Point(x, y);
        //  item.containsPoint({x, y})
        // 遍历食物判断与蛇相交
        this.foodList.forEach(item => {
            if (item.visible && (interval.intersect([this.head.x, this.head.y, this.head.x + this.head.width, this.head.y + this.head.width], [item.x, item.y, item.x + item.width, item.y + item.height]))) {
                item.visible = false;
                this.score++;
            }
        })
        // 超出边界
        if (!interval.containsPoint([5, 5, this.canvasSize[0] - 5, this.canvasSize[1] - 5], [x, y])) {
          this.head.vx = 0;
          this.head.vy = 0;
          this.app.ticker.remove(this.draw);
          this.gameStatus = 3; // 游戏结束
          this.gameOver();
        //   return;
        }
        this.head.x = x;
        this.head.y = y;
        this.drawBody();
    },
    gameOver () {
        this.app.stop();
        // this.app.stage.removeChildren();
        console.log('游戏结束');
    },
    createFood () {
        while (this.foodList.length < this.foodNum) {
            let food = new PIXI.Graphics();
            food.lineStyle(1, 0xaaddcc, 1);
            food.beginFill(0xffffff);
            food.drawRect(-5, -5, 10, 10);
            food.endFill();
            food.x = Math.random() * this.canvasSize[0];
            food.y = Math.random() * this.canvasSize[1];
            this.app.stage.addChild(food);
            this.foodList.push(food);
        }
    },
    // 创建头
    createHead () {
        this.head = new PIXI.Graphics();
        this.head.lineStyle(1, 0xaabbcc, 1);
        this.head.beginFill(0xffffff);
        this.head.drawPolygon([
            0, -5,
            5, 0,
            0, 10,
            -5, 0,
            0, -5
        ])
        this.head.endFill();
        this.head.x = 100;
        this.head.y = 100;
        this.head.vx = 0;
        this.head.vy = 0;
        this.head.zIndex = 1;
        this.app.stage.addChild(this.head);
    },
    // 创建身体
    createBody () {
        this.body = new PIXI.Graphics();
        this.drawBody();
        this.app.stage.addChild(this.body);
    },
    // 渲染身体
    drawBody () {
        this.body.clear();
        let firstPoint = [this.head.x, this.head.y];
        let prevPoint = {coor: [this.head.x, this.head.y], dir: [0, 0]};
        let length = this.score; // 身体长度
        let index = 0;
        this.body.lineStyle(3, 0xffffff, 1);
        this.body.moveTo(...firstPoint);
        while (length > 0) {
            let curPoint = this.direction[index];
            if (!curPoint) break;
            let lineLength = Math.max(Math.abs(curPoint.coor[0] - prevPoint.coor[0]), Math.abs(curPoint.coor[1] - prevPoint.coor[1]));
            length -= lineLength;
            let x = curPoint.coor[0];
            let y = curPoint.coor[1];
            x += length < 0 ? curPoint.dir[0] * length : 0;
            y += length < 0 ? curPoint.dir[1] * length : 0;
            this.body.lineTo(x, y);
            if (length < 0) {
                this.body.lineStyle(3, 0xffffff, 0.5);
                this.body.lineTo(x + curPoint.dir[0] * Math.abs(this.head.vx || this.head.vy ) * 5, y + curPoint.dir[1] * Math.abs(this.head.vx || this.head.vy) * 5);
                // console.log();
                this.direction.length = index + 1; // 只保存到最后一截的坐标
            } else {
            };
            if (index > 1) {
                // 碰到身体
                if (interval.intersect([this.head.x, this.head.y, this.head.x + this.head.width / 2, this.head.y + this.head.height / 2], [x, y, ...prevPoint.coor])) {
                    this.gameOver();
                    console.log([this.head.x, this.head.y, this.head.x + this.head.width / 2, this.head.y + this.head.height / 2], [x, y, ...prevPoint.coor])
                }
            }
            prevPoint = curPoint;
            index++;
        }
    }
  },
};
</script>
