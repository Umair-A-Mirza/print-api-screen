<script lang="ts" setup>
import { computed, defineProps, ref } from 'vue'
import type Dimensions from '../types/products/dimensions.ts'

const props = defineProps<{ label: String; dimensions: Dimensions }>()

const inputValue = ref('')

const valid = computed(() => {
  const value = Number(inputValue.value)
  return value >= props.dimensions.minimum && value <= props.dimensions.maximum
})
</script>

<template>
  <div class="flex w-full flex-col space-y-2 px-6 py-4 font-normal">
    <p class="text-lg font-bold">{{ props.label }}</p>
    <p class="text-sm">
      {{
        'Type a value between the range ' +
        props.dimensions.minimum +
        ' - ' +
        props.dimensions.maximum +
        ' ' +
        props.dimensions.unitOfMeasure +
        '. Increment: ' +
        props.dimensions.increment +
        ' ' +
        props.dimensions.unitOfMeasure +
        '.'
      }}
    </p>
    <div class="flex space-x-4 pt-4">
      <input
        v-model="inputValue"
        type="number"
        class="input-focus w-3/4 rounded-md border-2 border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
        :min="props.dimensions.minimum"
        :max="props.dimensions.maximum"
        :step="props.dimensions.increment"
        :placeholder="props.dimensions.minimum + ' ' + props.dimensions.unitOfMeasure"
      />
      <template v-if="!valid">
        <svg
          class="mt-2"
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#f70548"
        >
          <path
            d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z"
          />
        </svg>
      </template>
      <template v-else>
        <svg
          class="mt-2"
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#0f7020"
        >
          <path
            d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
          />
        </svg>
      </template>
    </div>
  </div>
</template>

<style scoped>
.input-focus {
  transition: box-shadow 0.4s ease-in-out;
}
</style>
