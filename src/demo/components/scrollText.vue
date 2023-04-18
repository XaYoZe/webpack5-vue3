<template>
  <div class="scroll-text">
    <div
      class="scroll-text-content"
      :class="[direction, { autoTurn: autoScroll }]"
      ref="content"
    >
        <slot></slot>
        <!-- <slot v-if="itemSize <= 1 && itemSize > 0"></slot>
        <slot v-if="itemSize <= 2 && itemSize > 0"></slot>
        <slot v-if="itemSize <= 3 && itemSize > 0"></slot> -->
      <!-- <slot ref="rows"></slot> -->
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      itemSize: 0,
      scrollEl: null,
      autoScroll: false,
      lastVNode: null,
    };
  },
  props: {
    duration: {
      type: Number,
      default: 1000,
    },
    direction: {
      type: String,
      default: "left",
    },
    change: {
      type: Date,
    },
  },
  computed: {
    rotate() {
        return 360 / this.itemSize;
    },
    translateZ() {
      return (['top', 'bottom'].includes(this.direction)  ? this.itemHeight : this.itemWidth) / 2 / Math.tan((this.rotate / 2 / 180) * Math.PI);
    },
  },
  mounted() {
    this.getItemSize();
    this.$nextTick(() => {
      this.rederList();
      let inter = new MutationObserver((e) => {
          console.log(1111, e);
          this.rederList();
      })
      inter.observe(this.$refs["content"], {childList: true});
    });
  },
  methods: {
      getItemSize () {
        this.scrollEl = this.$refs["content"];
        this.itemSize =  this.$refs["content"].children?.length;
        this.itemWidth= this.$refs["content"].children[0]?.offsetWidth;
        this.itemHeight = this.$refs["content"].children[0]?.offsetHeight;
      },
    rederList() {
      this.getItemSize();
      //   this.scrollEl.style.setProperty('--rotateX', `${this.rotate}deg`)
      //   this.scrollEl.style.setProperty('--translateZ', `${this.translateZ}px`)
      this.autoScroll = this.itemSize > 0 ? true : false;
      this.setStyle();
      this.computedTop();
    },
    setStyle() {
      Array.from(this.scrollEl.children, (el, index) => {
        el.style.setProperty("--translateZ", `${this.translateZ}px`);
        el.style.setProperty("--rotateX", `${this.rotate * index}deg`);
        el.style.setProperty("--rotateY", `${this.rotate * index}deg`);
      });
    },
    computedTop() {
      // this.$nextTick(() => {
      this.scrollEl.style.setProperty(
        "--duration",
        `${this.duration * this.itemSize}ms`
      );
      // })
    },
  },
  watch: {
    change: {
      handler(lala) {
      },
      deep: true,
    },
  },
};
</script>
<style lang="scss" scoped>
@keyframes topScroll {
  from {
    transform: rotateX(0deg);
  }
  to {
    transform: rotateX(360deg);
  }
}
@keyframes bottomScroll {
  from {
    transform: rotateX(360deg);
  }
  to {
    transform: rotateX(0deg);
  }
}
@keyframes rightScroll {
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(360deg);
  }
}
@keyframes leftScroll {
  from {
    transform: rotateY(360deg);
  }
  to {
    transform: rotateY(0deg);
  }
}
.scroll-text {
  $duration: var(--duration);
  $rotateX: var(--rotateX);
  $rotateY: var(--rotateY);
  $translateZ: var(--translateZ);
  position: relative;
  height: 100%;
//   overflow: hidden;
  .scroll-text-content {
    // display: flex;
    width: 100%;
    position: absolute;
    perspective: 999999px;
    transform-style: preserve-3d;
    perspective-origin: center;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    &:deep(*) {
      backface-visibility: hidden;
      position: absolute;
    }
    &.top, &.bottom {
        &:deep(*) {
        //   width: 100%;
          transform: rotateX(#{$rotateX}) translateZ(#{$translateZ});
        }
    }
    &.left, &.right {
        &:deep(*) {
           transform: rotateY(#{$rotateY}) translateZ(#{$translateZ});
        }
    }
    &.autoTurn {
        &.top {
          animation: topScroll $duration infinite linear;
        }
        &.bottom {
            animation: bottomScroll $duration infinite linear;
        }
        &.left {
          animation: leftScroll $duration infinite linear;
        }
        &.right {
          animation: rightScroll $duration infinite linear;
        }
    }
  }
}
</style>