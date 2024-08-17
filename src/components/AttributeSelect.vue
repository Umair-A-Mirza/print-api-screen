<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps<{
  data: [string, Array<string | number>]
  submit: boolean
}>()
const emits = defineEmits(['submit', 'invalid'])

const selectedValue = ref('')

watch(
  () => props.submit,
  (value: boolean) => {
    if (value) {
      if (selectedValue.value) {
        emits('submit', { attribute: props.data[0], value: selectedValue.value })
      } else {
        emits('invalid')
      }
    }
  }
)

const name = () => {
  return props.data[0] === 'quantity' ? 'Quantity' : props.data[0]
}

/**
 * The data for 'quantity' is duplicated for some reason, from the API itself.
 */
const data = () => {
  return name() === 'Quantity' ? Array.from(new Set(props.data[1])) : props.data[1]
}
</script>

<template>
  <div class="flex w-full flex-col space-y-2 px-6 py-4 font-normal">
    <p class="text-lg font-bold">{{ name() }}</p>
    <div class="flex space-x-4 pt-4">
      <select
        v-model="selectedValue"
        class="input-focus w-full appearance-none rounded-md border-2 border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
      >
        <option value="" disabled>Select an option</option>
        <option v-for="option in data()" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.input-focus {
  transition: box-shadow 0.3s ease-in-out;
}
</style>
