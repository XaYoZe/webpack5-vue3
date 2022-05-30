<template>
  <div class="game">
    <div>{{ timeData.time }}</div>
    <canvas ref="canvas" @click="clickCanvas"></canvas>
    <div>
      <button @click="start">开始</button>
      <button @click="stop">停止</button>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      imgs: {
        fish: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
        battery: ['batteryAfter', 'batteryBefore'],
        bullet: ['bullet1', 'bullet2', 'bullet3', 'bullet4', 'bullet5', 'bullet6'],
        bag: ['bag'],
        count: ['start', 'cd1', 'cd2', 'cd3'],
        hit: ['hit']
      },
      names: ['垂耳兔', '團團熊', '咕咕雞', '雪球鼠', '可可熊', '橘皮貓'],
      canvas: {
        el: null,
        ctx: null,
        width: this.toCurPX(750),
        height: this.toCurPX(800),
        cssWidth: this.toCurPX(750, true),
        cssHeight: this.toCurPX(800, true),
        runing: false
      },
      fishData: {
        has: 0,
        height: this.toCurPX(100),
        matrix: [
          [{id: 4, type: 0},{id: 4, type: 1},{id: 4, type: 2}],
          [{id: 3, type: 3},{id: 3, type: 4},{id: 3, type: 5},{id: 3, type: 4},{id: 3, type: 3}],
          [{id: 2, type: 6},{id: 2, type: 7},{id: 2, type: 8},{id: 2, type: 6},{id: 2, type: 7},{id: 2, type: 8}],
          [{id: 1, type: 9},{id: 1, type: 10},{id: 1, type: 9},{id: 1, type: 10},{id: 1, type: 9}],
          [{id: 1, type: 10},{id: 1, type: 9},{id: 1, type: 10},{id: 1, type: 9},{id: 1, type: 10}],
        ],
        list: []
      },
      bulletData: {
        width: this.toCurPX(20),
        height: this.toCurPX(60),
        color: '#000',
        num: 10000,
        use: 0,
        list: [],
        type: 1
      },
      timeData: {
        timestamp: 0, // 保存时间戳
        runTime: 0, // 运行时间
        time: 200, // 倒计时
        gameLength: 200 // 游戏时长
      },
      batteryData: { // 炮弹数据
        color: "#fac",
        height: this.toCurPX(60),
        width: this.toCurPX(20),
        centerX: 0, // 原坐标x
        centerY: 0, // 原坐标y
        targFishList: [], // 目标线上的鱼
        runing: false // 飞行中
      }
    }
  },
  computed: {
    },
  async mounted () {
    await this.loadImgs();
    this.$nextTick(() => {
      this.init();
    })
  },
  methods: {
    // 加载图片
    loadImgs () {
      return new Promise((res, rej) => {
        let count = 0;
        let total = 0;
        let errorImg = [];
        for (let key in this.imgs) {
          total += this.imgs[key].length;
          this.imgs[key].forEach((imgStr, index) => {
            let img = new Image();
            img.src = require(`../assets/image/game/${imgStr}.png`);
            img.onload = () => {
              count++;
              this.imgs[key][index] = img;
              if (count >= total) {
                res(errorImg);
                console.log('加载完成');
              }
            }
            img.onerror = () => {
              total --;
              errorImg.push(imgStr)
              if (count >= total) {
                res(errorImg);
                console.log('加载完成');
              }
            }
          })
        }
      })
    },
    toCurPX (px, isCss = false) { // 轉換為當前屏幕大小的像素
      return px / (750 / 100) * (window.innerWidth / 100) * (isCss ? 1 : window.devicePixelRatio);
    },
    init () { // 初始化
      if (!this.canvas.el) {
        this.canvas.el = this.$refs.canvas;
        this.canvas.ctx = this.canvas.el.getContext('2d');
        this.canvas.el.style.width = this.canvas.cssWidth + 'px';
        this.canvas.el.style.height = this.canvas.cssHeight + 'px';
        this.canvas.el.width = this.canvas.width;
        this.canvas.el.height = this.canvas.height;
      }
      this.bulletData.list = [];
      this.initFish();
      this.initBattery();
      this.initBag();
      this.draw();
    },
    // 初始化鱼数据
    initFish () {
      this.fishData.list = [];
      // 初始化矩阵数据
      this.fishData.matrix.forEach((fishRow, index) => {
        fishRow.forEach((cage, i) => {
          cage.row = index;
          cage.cel = i;
          // 容器宽高
          cage.height = this.fishData.height;
          cage.width = this.canvas.width / fishRow.length;
          // 容器左上角,右下角坐标
          cage.x = i * cage.width;
          cage.y = index * cage.height
          cage.x1 = (i + 1) * cage.width;
          cage.y1 = (index + 1) * cage.height;
          // 容器中心点
          cage.centerX = cage.x + cage.width / 2;
          cage.centerY = cage.y + cage.height / 2;

          // 鱼图片
          let itemImg = this.imgs.fish[cage.type];
          // 鱼大小
          let itemWidth = 0.5 * cage.width;
          let itemHeight = itemWidth / itemImg.width * itemImg.height;
          // 鱼坐标
          let itemX = cage.centerX - itemWidth / 2;
          let itemY = cage.centerY - itemHeight / 2;
          let itemX1 = itemX + itemWidth;
          let itemY1 = itemY + itemHeight;
          cage.fish = {
            img: itemImg,
            isDead: false, // 鱼死亡
            height: itemHeight,
            width: itemWidth,
            x: itemX,
            y: itemY,
            x1: itemX1,
            y1: itemY1,
            stepX: Math.random() * (Math.random() > 0.5 ? -0.5 : 0.5),
            stepY: Math.random() * (Math.random() > 0.5 ? -0.5 : 0.5),
            isPlay: false,
            hitImg: this.imgs.hit[0],
            showHit: false, // 显示命中效果
            play: () => { // 鱼游动
              let fishItem = cage.fish;
              if (fishItem.isPlay) return;
              fishItem.isPlay = true;
              fishItem.timer = this.fps60Timer(() => {
                if (fishItem.y1 + fishItem.stepY > cage.y1 || fishItem.y + fishItem.stepY < cage.y) {
                // if (fishItem.y1 + fishItem.stepY > this.canvas.height - this.toCurPX(200) || fishItem.y + fishItem.stepY < 0) {
                  fishItem.stepY = -fishItem.stepY;
                }
                if (fishItem.x1 + fishItem.stepX > cage.x1 || fishItem.x + fishItem.stepX < cage.x) {
                // if (fishItem.x1 + fishItem.stepX > this.toCurPX(750) || fishItem.x + fishItem.stepX < 0) {
                  fishItem.stepX = -fishItem.stepX;
                }
                fishItem.x+=fishItem.stepX;
                fishItem.x1+=fishItem.stepX;
                fishItem.y+=fishItem.stepY;
                fishItem.y1+=fishItem.stepY;
                if (cage.fish.isDead || !this.canvas.runing) {
                  clearInterval(fishItem.timer)
                }
              }, 60)
            },
            stop: () => {
              clearTimeout(cage.fish.timer);
            },
            hit: (isDead) => {
              let fishItem = cage.fish;
              let _this = fishItem.hit;
              if (isDead) {
                if (fishItem.showHit) return false;
                fishItem.stop();
                fishItem.showHit = true;
                _this.width = this.toCurPX(fishItem.hitImg.width);
                _this.height = _this.width / fishItem.hitImg.width * fishItem.hitImg.height;
                _this.x = fishItem.x + fishItem.width / 2 - _this.width / 2;
                _this.y = fishItem.y + fishItem.height / 2 - _this.height / 2;
                console.log('死掉的鱼', cage);
                setTimeout(() => {
                  fishItem.isDead = true; // 鱼死亡
                  fishItem.showHit = false;
                  this.bulletData.curBullet = null;
                  this.bagData.showGetStyle() // 显示+1
                  this.bagData.num++;
                  // if (!this.batteryData.text.getText()) {
                  //   this.stop();
                  // }
                }, 500);
              } else {
                fishItem.taunt();
              }
            },
            taunt: () => {
              let fishItem = cage.fish;
              let _this = fishItem.taunt;
              _this.left = (fishItem.x / window.devicePixelRatio) + 'px';
              _this.top = (fishItem.y / window.devicePixelRatio) + 'px';
              _this.display = 'block';
              _this.text = ['哈哈, 我比你強', '哈哈, 你沒瞄準我', '哈哈, 我避開了', '追上我, 我就給你嘿嘿嘿'][Math.floor(Math.random() * 4)]
              console.log(_this.text);
              setTimeout(() => {
                // fish.isDead = true; // 鱼死亡
                this.bulletData.curBullet = null;
                _this.display = 'none';
                // if (!this.batteryData.text.getText()) {
                //   this.stop();
                // }
              }, 500);
            }
          }
          this.fishData.list.push(cage);
        })
      });
    },
    // 渲染鱼
    drawFish (times) {
      this.fishData.list.forEach((cage, index) => {
        if (!cage.fish.isDead) {
          // this.canvas.ctx.fillStyle = fish.color;
          // this.canvas.ctx.fillRect(fish.x, fish.y, fish.width, fish.height);
          // 渲染鱼图片
          this.canvas.ctx.drawImage(cage.fish.img, cage.fish.x, cage.fish.y, cage.fish.width, cage.fish.height)
          times && cage.fish.play()
        }
        
        if (cage.fish.showHit) {
          this.canvas.ctx.drawImage(cage.fish.hitImg, cage.fish.hit.x, cage.fish.hit.y, cage.fish.hit.width, cage.fish.hit.height)
        }
      });
    },
    // 初始化炮台数据
    initBattery () {
      this.batteryData.x = this.canvas.width / 2 - this.batteryData.width / 2;
      this.batteryData.y = this.canvas.height - this.batteryData.height;
      this.batteryData.img = this.imgs['battery'][0];
      this.batteryData.centerX = this.canvas.width / 2;
      this.batteryData.centerY = this.canvas.height - this.batteryData.height / 2;


      
      this.bulletData.x = this.canvas.width / 2 - this.bulletData.width / 2;
      this.bulletData.y = this.canvas.height - this.toCurPX(45) - this.bulletData.height;
      this.bulletData.centerX = this.canvas.width / 2;
      this.bulletData.centerY = this.canvas.height - this.toCurPX(45) - this.bulletData.height / 2;
      this.bulletData.fishImg = this.imgs.bullet[this.bulletData.type];
      this.bulletData.imgs = Array.from(new Array(3), (item, index) => {
        let img = index === 1? this.imgs.bullet[this.bulletData.type] : this.imgs.battery[Number(!!index)];
        let width = this.toCurPX(img.width);
        let height = width / img.width * img.height;
        let x = this.canvas.width / 2 - width / 2;
        let y = this.canvas.height - height;
        switch (index) {
          case 0:
            y -= this.toCurPX(57);
            break;
          case 1:
            y -= this.toCurPX(81);
            break;
          case 2:
            y -= this.toCurPX(45);
            break;
        }
        return {
          width,
          height,
          x,
          y,
          img
        }
      });
      let  textBgSrc = { // 圆角矩形左上角坐标
        height: this.toCurPX(30),
        x: this.toCurPX(422),
        y: this.canvas.height - this.toCurPX(108)
      }
      this.bulletData.text = {
        getText: () => this.bulletData.num - this.bulletData.use,
        fillStyle: '#ffffff',
        strokeStyle: '#286812',
        x: this.toCurPX(430),
        y: this.canvas.height - this.toCurPX(85)
      }
      this.bulletData.textBg = {
        fillStyle: '#fff', 
        getData: (index) => {
          let fontWidth = this.canvas.ctx.measureText(this.bulletData.num - this.bulletData.use).width;
          if (index === 0) {
            return [textBgSrc.x + this.toCurPX(15), textBgSrc.y + this.toCurPX(15), textBgSrc.height / 2, Math.PI / 2 * 3, Math.PI / 2, true]
          } else {
            return [textBgSrc.x + fontWidth, textBgSrc.y + this.toCurPX(15), textBgSrc.height / 2, Math.PI / 2, Math.PI / 2 * 3, true]
          }
        }
      };
      this.bulletData.name = {
        text: this.names[this.bulletData.type],
        fillStyle: '#ffffff',
        strokeStyle: '#286812',
        fontSize: 26,
        x: this.bulletData.centerX - this.toCurPX(35),
        y: this.bulletData.centerY + this.toCurPX(65),
      }
    },
    // 渲染炮台
    drawBullet () {
      let ctx = this.canvas.ctx;
      this.canvas.ctx.font = `bold ${this.toCurPX(22)}px PingFang SC`;
      this.bulletData.imgs.forEach((img, index) => {
        if (index === 1) {
          ctx.drawImage(this.bulletData.fishImg, img.x, img.y, img.width, img.height);
        } else {
          ctx.drawImage(img.img, img.x, img.y, img.width, img.height);
        }
      });

      let {textBg, text, type, name} = this.bulletData;
      this.canvas.ctx.beginPath();
      this.canvas.ctx.fillStyle = textBg.fillStyle;
      this.canvas.ctx.arc(...textBg.getData(0));
      // this.canvas.ctx.fillRect(...textBg.getData(1));
      this.canvas.ctx.arc(...textBg.getData(1));
      this.canvas.ctx.fill();
      this.canvas.ctx.closePath();
      this.canvas.ctx.lineWidth = this.toCurPX(1);
      this.canvas.ctx.fillStyle = text.fillStyle;
      this.canvas.ctx.strokeStyle = text.strokeStyle;
      this.canvas.ctx.fillText(text.getText(), text.x, text.y);
      this.canvas.ctx.strokeText(text.getText(), text.x, text.y);

      this.canvas.ctx.font = `bold ${this.toCurPX(26)}px PingFang SC`;
      this.canvas.ctx.lineWidth = this.toCurPX(1);
      this.canvas.ctx.fillStyle = text.fillStyle;
      this.canvas.ctx.strokeStyle = text.strokeStyle;
      this.canvas.ctx.fillText(name.text, name.x, name.y);
      this.canvas.ctx.strokeText(name.text, name.x, name.y);
    },
    // 初始化背包
    initBag () {
      let num = 0;
      let img = this.imgs.bag[0];
      let width = this.toCurPX(img.width);
      let height = width / img.width * img.height;
      let x = this.toCurPX(24);
      let y = this.canvas.height - height - this.toCurPX(39);
      let textBgSrc = { // 圆角矩形左上角坐标
        height: this.toCurPX(30),
        width: this.toCurPX(50),
        x: this.toCurPX(51),
        y: this.canvas.height - this.toCurPX(60)
      }
      let bgColor = '#ffffffdd';
      let textColor = `#0834AE`;
      let fontSize = this.toCurPX(22);
      let textBg = [
        [textBgSrc.x + this.toCurPX(15), textBgSrc.y + this.toCurPX(15), textBgSrc.height / 2, Math.PI / 2 * 3, Math.PI / 2, true],
        [textBgSrc.x + this.toCurPX(65), textBgSrc.y + this.toCurPX(15), textBgSrc.height / 2, Math.PI / 2, Math.PI / 2 * 3, true]
      ]
      let getFishStyle = {
        srcY: this.canvas.height - this.toCurPX(39 + 127),
        x: this.toCurPX(24 + 67),
        y: this.canvas.height - this.toCurPX(39 + 127),
        text: '+1',
        fontSize: this.toCurPX(30),
        fillStyle: 'rgba(255,255,255,1)',
        show: false,
        timer: null
      }
      // 显示+1
      let showGetStyle = () => {
        if (getFishStyle.show) return;
        let i = 120;
        getFishStyle.fillStyle = '#adc';
        getFishStyle.y = getFishStyle.srcY;
        getFishStyle.show = true;
        clearInterval(getFishStyle.timer);
        getFishStyle.timer = this.fps60Timer(() => {
          i--;
          getFishStyle.fillStyle = `rgba(40,102,90,${i / 120})`;
          getFishStyle.y-= this.toCurPX(0.5);
          if (i <= 0) {
            clearInterval(getFishStyle.timer);
            getFishStyle.show = false;
          }
        })
      }
      this.bagData = {img, width, height, x, y, num, textBg, bgColor, textColor, fontSize, getFishStyle, showGetStyle};
    },
    // 渲染背包
    drawBag () {
      this.canvas.ctx.beginPath();
      this.canvas.ctx.drawImage(this.bagData.img, this.bagData.x, this.bagData.y, this.bagData.width, this.bagData.height)
      this.canvas.ctx.fillStyle = this.bagData.bgColor;
      this.canvas.ctx.arc(...this.bagData.textBg[0]);
      this.canvas.ctx.arc(...this.bagData.textBg[1]);
      this.canvas.ctx.fill();
      this.canvas.ctx.fillStyle =  this.bagData.textColor;
      this.canvas.ctx.font = `bold ${this.bagData.fontSize}px PingFang SC`;
      let fontWidth = this.canvas.ctx.measureText(this.bagData.num).width;
      this.canvas.ctx.fillText(this.bagData.num, this.toCurPX(91) - fontWidth / 2, this.canvas.height - this.toCurPX(37));
      this.canvas.ctx.closePath();
      if (this.bagData.getFishStyle.show) {
        this.canvas.ctx.font = `bold ${this.bagData.getFishStyle.fontSize}px PingFang SC`;
        this.canvas.ctx.fillStyle = this.bagData.getFishStyle.fillStyle;
        this.canvas.ctx.fillText(this.bagData.getFishStyle.text, this.bagData.getFishStyle.x, this.bagData.getFishStyle.y);
      }
    },
    // 60帧定时器
    fps60Timer (fn, fps = 60) {
      return setInterval(fn, 1000 / fps);
    },
    // 渲染画布
    draw (times) {
      // 清空画布
      // this.canvas.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      this.canvas.ctx.fillStyle = 'rgba(255,255,255,0.3)';
      this.canvas.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      // 绘制背包
      this.drawBag();
      // 绘制枪
      this.drawBullet();
      // 绘制鱼
      this.drawFish(times);
      // 绘制子弹
      this.canvas.ctx.fillStyle = this.bulletData.color;
      this.bulletData.list.forEach(item => {
        this.canvas.ctx.save();
        this.canvas.ctx.translate(item.centerX, item.centerY);
        this.canvas.ctx.rotate(item.deg);
        this.canvas.ctx.drawImage(item.img, -this.bulletData.width / 2, -this.bulletData.height / 2, this.bulletData.width, this.bulletData.height);
        this.canvas.ctx.restore();
        // this.canvas.ctx.fillRect(item.x, item.y, this.bulletData.width, this.bulletData.height);
      })
      if (times) {
        // 记录时间戳
        if (!this.timeData.timestamp) this.timeData.timestamp = times;
        this.timeData.runTime = times - this.timeData.timestamp;
        this.timeData.time = Math.ceil(this.timeData.gameLength - this.timeData.runTime / 1000);
        this.canvas.animationFrame = requestAnimationFrame(this.draw);
        if (this.timeData.time <= 0) {
          this.stop();
        }
      }
    },
    // 获取坐标点上的鱼
    getXYofFish (x, y) {
      let atFish = this.fishData.list.filter(item => x >= item.x && x < item.x1 && y > item.y && y <= item.y1);
      return atFish.length ? atFish[0] : {};
    },
    // 点击画布
    clickCanvas (event) {
      if (!this.canvas.runing) return;
      if (this.bulletData.use >= this.bulletData.num) return;
      // 子弹终点
      let bulletEnd = this.distanceToXY(event.offsetX, event.offsetY, this.canvas.height + 100);
      let bullet = this.initBullet(bulletEnd.x, bulletEnd.y);
      this.bulletData.list.push(bullet);
    },
    // 生成子弹
    initBullet (targX, targY) {
      this.bulletData.use++;
      // 在弹道上的鱼
      // let targetFish = this.getXYofFish(targX, targY);
      let routerFish = this.forecastRoute(targX, targY);
      let bullet = {
        centerX: this.batteryData.centerX,
        centerY: this.batteryData.centerY,
        x: this.batteryData.centerX - this.bulletData.width / 2,
        y: this.batteryData.centerY - this.bulletData.height / 2,
        x1: this.batteryData.centerX + this.bulletData.width / 2,
        y1: this.batteryData.centerY + this.bulletData.height / 2,
        targX: targX - this.bulletData.width / 2, // 目标坐标
        targY: targY - this.bulletData.height / 2,
        curX: this.batteryData.centerX - this.bulletData.width / 2, // 当前坐标
        curY: this.batteryData.centerY - this.bulletData.height,
        timmer: null,
        invalid: false, // 子弹失效
        fishList: routerFish, // 弹道上的鱼列表
        img: this.imgs['bullet'][0],
        deg: Math.atan2((targY - this.batteryData.centerY), (targX - this.batteryData.centerX)) + Math.PI / 2
      }
      let s = 3; // 小球到终点所用时间
      let x = bullet.targX - bullet.x;
      let y = bullet.targY - bullet.y;
      // 每帧速度
      let stepX = x * 60 / (1000 * s);
      let stepY = y * 60 / (1000 * s);
      bullet.timmer = this.fps60Timer(() => {
        // 改变子弹坐标
        bullet.x += stepX;
        bullet.y += stepY;
        bullet.x1 += stepX;
        bullet.y1 += stepY;
        bullet.centerX += stepX;
        bullet.centerY += stepY;
        let overstepX = stepX >= 0 ? bullet.x >= bullet.targX : bullet.x <= bullet.targX;
        let overstepY = bullet.y <= bullet.targY;
        // 遍历经过哪些鱼，跳过打过的鱼
        for (let cage of routerFish) {
          if (this.rectCollision(bullet, cage.fish) && !cage.fish.isDead) {
              bullet.invalid = true; // 让子弹失效
              cage.fish.hit(Math.random() > 0.5);
              break;
          }
        }
        // 到达终点或打到鱼后消失
        if (overstepX && overstepY || bullet.invalid) {
          clearInterval(bullet.timmer);
          this.bulletData.list.splice(this.bulletData.list.indexOf(bullet), 1);
        }
      });
      return bullet;
    },
    // 计算在子弹路线上的鱼
    forecastRoute (targX, targY) {
      let length = Math.ceil(Math.sqrt(Math.pow(targX - this.batteryData.centerX, 2) + Math.pow(targY - this.batteryData.centerY, 2)));
      let fishList = [];
      Array.from(new Array(length), (v, i) => {
        let dot = this.distanceToXY(targX, targY, i);
        let x = dot.x - this.bulletData.width / 2;
        let y = dot.y - this.bulletData.height / 2;
        let x1 = x + this.bulletData.width;
        let y1 = y + this.bulletData.height;
        // this.canvas.ctx.fillRect(x1, y1, this.bulletData.width, this.bulletData.height);
        let atFish = this.fishData.list.filter(fish => {
          return this.rectCollision({x, y, x1, y1}, fish)
        })
        atFish.forEach(fish => {
          if (fishList.indexOf(fish) === -1) {
            fishList.push(fish);
          }
        })
      })
      return fishList;
    },
    // 计算枪中心点到目标点间,
    distanceToXY (targX, targY, length) {
      let ox = this.batteryData.centerX;
      let oy = this.batteryData.centerY;
      let x = targX - this.batteryData.centerX;
      let y = targY - this.batteryData.centerY;
      let proportion = length / (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
      let x1 = ox + x * proportion;
      let y1 = oy + y * proportion;
      return {x: x1, y: y1}
    },
    // 碰撞计算
    rectCollision (obj, obj1) {
      let x = Math.max.apply(null, [obj.x, obj1.x]) <= Math.min.apply(null, [obj.x1, obj1.x1]);
      let y = Math.max.apply(null, [obj.y, obj1.y]) <= Math.min.apply(null, [obj.y1, obj1.y1]);
      if (x && y) {
        return true
      }
      return false;
    },
    start () {
      this.canvas.runing = true;
      this.timeData.timestamp = 0;
      this.canvas.animationFrame = requestAnimationFrame(this.draw);
    },
    stop () {
      this.init();
      this.canvas.runing = false;
      this.timeData.time = 20;
      cancelAnimationFrame(this.canvas.animationFrame)
    }
  }
}
</script>
<style lang="scss" scoped>
.game {
  canvas {
    user-select: none;
    // width: 750px;
    // height: 800px;
  }
}
</style>