<template>
  <div class="scroll-text">
    <div class="scroll-text-content" :class="[direction, {autoTurn: autoScroll}]" ref="content">
      <slot ref="rows"></slot>
    </div>
  </div>
</template>
<script>
import { nextTick } from 'process';
export default {
  data () {
    return {
      scrollEl: null,
      autoScroll: false,
      lastVNode: null,
      firstRowEl: null,
      lastNodeheight: 0,
      contentHeight: 0,
      dataset: {}
    }
  },
  updated () {
  },
  props: {
    direction: {
      type: String,
      default: 'left'
    },
    change: {
      type: Date
    }
  },
  computed: {
    rotate () {
      return 360 / this.scrollSize
    },
    translateZ () {
      return (this.itemHeight / 2) / Math.tan((this.rotate / 2 / 180) * Math.PI)
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.rederList();
    })
  },
  methods: {
    rederList () {
      this.scrollEl = this.$refs['content'];
      this.scrollSize = this.$slots['default'].length;
      this.lastNodeheight = 0;
      this.autoScroll = true;
      this.createNode();
        this.computedTop();
    },
    createNode () {
      let scrollEl = this.$refs['content'];
      let vnode = this.$slots['default'][0];
      let attrs = {};
      if (vnode.elm && !this.lastNodeheight) {
        vnode.elm && Object.keys(vnode.elm.dataset).forEach(key => {
          this.dataset[`data-${key}`] = vnode.elm.dataset[key];
        })
        this.lastNodeheight = vnode.elm.offsetHeight;
        console.log(vnode.elm.offsetHeight)
      }
      this.lastVNode = this.$createElement(vnode.tag, Object.assign({}, vnode.data, {key: 99999999, attrs: this.dataset}), vnode.children);
      this.$slots['default'].push(this.lastVNode);
    },
    computedTop (isAdd) {
      console.log(this.scrollEl.offsetHeight, this.lastNodeheight);
      // this.$nextTick(() => {
        this.scrollEl.style.setProperty('--time', `10s`);
        this.scrollEl.style.setProperty('--top', `-${this.scrollEl.offsetHeight - this.lastNodeheight}px`);
        this.scrollEl.style.setProperty('--end', `${isAdd ? this.lastNodeheight : 0}px`);
      // })
    }
  },
  watch: {
    change: {
      handler  (lala) {
        this.$slots['default'].push(this.lastVNode);
        this.computedTop(true);
        console.log(this.scrollEl.offsetHeight)
        // this.rederList();
      },
      deep: true,
    }
  }
}
</script>
<style lang="scss" scoped>

.scroll-text {
  $top: var(--top);
  $time: var(--time);
  $end: var(--end);
  position: relative;
  height: 100%;
  @keyframes topScroll {
    from {
      top: 0;
    }
    to {
      top: var(--top);
    }
  }
   overflow: hidden;
  .scroll-text-content {
    display: flex;
    width: 100%;
    position: absolute;
    &.top {
      &.autoTurn {
        animation: topScroll $time infinite linear;  
      }
      transform-style: preserve-3d;
      top: 0;
      left: 0;
      flex-direction: column;
      width: 100%;
      text-align: center;
      word-break: break-all;
      white-space: pre-line;
    }
  }
}
</style>