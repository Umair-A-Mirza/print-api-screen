<script lang="ts" setup>
import { useAttributes } from '../composables/api/flyer/attributes'

const { getAttributes } = useAttributes()

const click = () => {
  console.log(getAttributes('f7aa1764-e849-4211-bdce-2f7dedc850f8', '/attributes'))
}
</script>

<template>
  <button @click="click()" class="bg-slate-200 p-6 text-center text-xl">Click me</button>
</template>

<style scoped></style>
