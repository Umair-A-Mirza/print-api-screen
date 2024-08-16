<script lang="ts" setup>
import { useFlyerData } from '../composables/utils/data'
import { ref, onMounted } from 'vue'
import MetaDetails from '../components/MetaDetails.vue'
import FormSection from '../components/FormSection.vue'
import DimensionsInput from '../components/DimensionsInput.vue'
import type FlyerAttributes from '../types/FlyerAttributes'

const accessData = ref(null)
const loaded = ref(false)
const getPrices = ref(null)
const error = ref(false)

const flyerCat = ref(null)
const attributes = ref<FlyerAttributes>(null)
const combinations = ref(null)

onMounted(async () => {
  try {
    const result = await useFlyerData()
    // Destructure into new variables.
    const { flyerCat: fc, attributes: attr, combinations: comb } = result.accessData()

    flyerCat.value = fc.value
    attributes.value = attr
    combinations.value = comb

    loaded.value = result.loaded.value
    getPrices.value = result.getPrices
    error.value = result.error.value

    if (loaded.value && !error.value) {
      console.log(flyerCat.value, attributes.value, combinations.value)
    } else {
      console.error('Data not loaded yet')
    }
  } catch (err) {
    console.error('Failed to load data', err)
  }
})

const width = () => {
  return attributes.value['Custom width'][0]
}

const height = () => {
  return attributes.value['Custom height'][0]
}
</script>

<template>
  <template v-if="loaded && !error">
    <div class="box-border w-full items-center justify-center pt-16 font-normal">
      <div class="border-outline m-6 flex min-w-[800px] flex-col rounded-lg border-2 border-slate-200 py-6 shadow-lg">
        <p class="pb-4 text-center text-3xl">Product Configuration and Price Menu</p>
        <div class="my-4 flex items-center justify-center space-x-4">
          <MetaDetails label="Name" :data="flyerCat.name" />
          <MetaDetails label="Date Modified" :data="flyerCat.combinationsModifiedAt.split(' ')[0]" />
        </div>
        <p class="text-center text-sm font-bold">Please select from the options below to see available prices.</p>
        <div class="mt-8 flex flex-col bg-slate-100">
          <FormSection
            text="1 - Select Dimensions"
            subtext="Please select the dimensions of the flyer and then proceed to the next section."
          />
          <div class="grid max-w-full grid-cols-2 gap-4 px-4 py-4">
            <DimensionsInput label="Custom Width" :dimensions="width()" />
            <DimensionsInput label="Custom Height" :dimensions="height()" />
          </div>
          <FormSection
            text="2 - Select Additional Parameters"
            subtext="Please make selections for the attributes below and then submit to see the prices."
          />
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <div>
      <h1>Loading...</h1>
    </div>
  </template>
</template>

<style scoped></style>
