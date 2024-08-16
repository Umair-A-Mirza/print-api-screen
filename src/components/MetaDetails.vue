<script lang="ts" setup>
import { defineProps } from 'vue'

const props = defineProps({
  label: String,
  data: String
})
</script>

<template>
  <div
    class="bg-secondary text-md mb-3 flex w-full max-w-80 items-center justify-center space-x-3 rounded-lg p-2 font-normal text-white"
  >
    <p class="font-bold">{{ props.label + ':' }}</p>
    <p class="font-bold">{{ props.data }}</p>
  </div>
</template>
