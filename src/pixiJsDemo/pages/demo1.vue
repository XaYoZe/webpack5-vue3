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
        canvasSize: [500, 300],
        gameStatus: 2, // 1. 游戏前, 2.游戏中, 3.游戏后
        foodNum: 1,
        foodList: [],
        score: 0
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
      this.createFood();
      this.initEvent();
    },
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
        console.log(this.head);
        this.app.stage.addChild(this.head);
    },
    initEvent () {
        let keyboard = new Keyboard()
        let left = keyboard.add('ArrowLeft'),
             up = keyboard.add("ArrowUp"),
             right = keyboard.add("ArrowRight"),
             down = keyboard.add("ArrowDown");
      left.longTap = () => {
        if (this.gameStatus !== 2) return;
        this.head.vx += -0.5;
        this.head.vy = 0;
        this.head.angle = 270;
      }
      right.longTap = () => {
        if (this.gameStatus !== 2) return;
        this.head.vx += 0.5;
        this.head.vy = 0;
        this.head.angle = 90;
      }
      up.longTap = () => {
        if (this.gameStatus !== 2) return;
        this.head.vx = 0;
        this.head.vy += -0.5;
        this.head.angle = 0;
      }
      down.longTap = () => {
        if (this.gameStatus !== 2) return;
        this.head.vx = 0;
        this.head.vy += 0.5;
        this.head.angle = 180;
      }
      this.app.ticker.add(this.draw);
    },
    draw (delta) {
        let x = this.head.x + this.head.vx;
        let y = this.head.y + this.head.vy;
        // let point = new PIXI.Point(x, y);
        let score = 0;
        //  item.containsPoint({x, y})
        // 遍历食物判断与蛇相交
        this.foodList.forEach(item => {
            if (item.visible && (interval.intersect([this.head.x, this.head.y, this.head.x + this.head.width, this.head.y + this.head.width], [item.x, item.y, item.x + item.width, item.y + item.height]))) {
                this.app.stop();
                // item.visible = false
            }
            if (!item.visible) {
                score++;
            }
        })
        this.score = score;
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
    createHeadBody () {

    }
  },
};
</script>
