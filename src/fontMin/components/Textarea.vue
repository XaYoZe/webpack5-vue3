<template>
  <textarea ref="testTextInput" :style="{height: `${ testTextHeight }px`}" v-model="$model"></textarea>
</template>
<script setup>
import { ref, watch, nextTick, computed, defineModel } from "vue";

let props = defineProps(['modelValue']);
let $model = defineModel()
// let emits = defineEmits(['update:modelValue']);
let testTextHeight = ref(0);
let testTextInput = ref(null);

watch($model, (val) => {
  // emits('update:modelValue', val)
  $model.value = val
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