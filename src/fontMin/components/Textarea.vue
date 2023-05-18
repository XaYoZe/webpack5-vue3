<template>
  <textarea ref="testTextInput" :style="{height: `${ testTextHeight }px`}" v-model="modelValue"></textarea>
</template>
<script setup>
import { ref, watch, nextTick, computed } from "vue";

let props = defineProps(['modelValue']);
let emits = defineEmits(['update:modelValue']);
let testTextHeight = ref(0);
let testTextInput = ref(null);

watch(computed(() => props.modelValue), (val) => {
  emits('update:modelValue', val)
  nextTick(() => {
    testTextHeight.value = 0;
    nextTick(() => {
      testTextHeight.value = testTextInput.value.scrollHeight + 2;
    })
  })
}, {immediate: true })

</script>
<style lang="scss" scoped>
textarea {
  min-height: 50px;
  padding: 5px;
  border: 1px solid #666;
  border-radius: 5px;
  resize: none;
  &:focus {
    outline: none;
  }
}
</style>