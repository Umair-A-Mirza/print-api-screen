<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps<{
  data: [string, Array<string | number>]
  submit: boolean
}>()
const emits = defineEmits(['submit', 'invalid', 'show', 'hide'])

const selectedValue = ref('')
const isFormat = props.data[0] === 'Format'

/**
 * If the attribute is 'Format', we need to watch in order to emit events to show/hide the 'Custom' input.
 */
if (isFormat) {
  watch(
    () => selectedValue.value,
    (value: string) => {
      if (value.includes('Custom')) {
        emits('show')
      } else {
        emits('hide')
      }
    }
  )
}

/**
 * Watch for the 'submit' prop to emit the relevant events.
 */
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

/**
 * Hardcoded name for 'quantity' attribute as it is lowercase in the API (inconsistent).
 */
const name = () => {
  return props.data[0] === 'quantity' ? 'Quantity' : props.data[0]
}

/**
 * Utility method to ensure that weights are in ascending order (e.g. 1 Gr, 2 Gr, 3 Gr).
 */
const order = (a: number, b: number) => {
  return a < b ? -1 : a > b ? 1 : 0
}

/**
 * Method to handle duplication of 'Quantity' attribute values from the API.
 */
const data = () => {
  const n = name()
  if (n === 'Quantity') {
    return Array.from(new Set(props.data[1]))
  } else if (n === 'Weight') {
    // Final .map() is to convert the object { value: ..., unit: ... } to a string, as was before.
    return props.data[1]
      .map((weight) => {
        weight = typeof weight === 'number' ? `${weight} Gr` : weight
        const [value, unit] = weight.split(' ')
        return { value: parseInt(value), unit }
      })
      .sort((a, b) => order(a.value, b.value))
      .map((item) => `${item.value} ${item.unit}`)
  }
  return props.data[1]
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
