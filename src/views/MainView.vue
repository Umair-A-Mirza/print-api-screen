<script lang="ts" setup>
import { useFlyerData } from '../composables/utils/data'
import { ref, onMounted } from 'vue'

const accessData = ref(null)
const loaded = ref(false)
const getPrices = ref(null)
const error = ref(false)

onMounted(async () => {
  try {
    const result = await useFlyerData()
    accessData.value = result.accessData
    loaded.value = result.loaded.value
    getPrices.value = result.getPrices
    error.value = result.error.value
  } catch (err) {
    console.error('Failed to load data', err)
  }
})

const click = () => {
  if (loaded.value && !error.value) {
    const { flyerCat, attributes, combinations } = accessData.value()
    console.log(flyerCat.value, attributes, combinations)
  } else {
    console.log(loaded.value)
    console.log(error.value)
    console.error('Data not loaded yet')
  }
}
</script>

<template></template>

<style scoped></style>
