<script lang="ts" setup>
const props = defineProps({
  text: String,
  subtext: String
})
</script>

<template>
  <div class="w-full px-6 py-4 font-normal">
    <p class="text-2xl font-bold">{{ props.text }}</p>
    <p class="mt-3 text-sm">{{ props.subtext }}</p>
  </div>
</template>
