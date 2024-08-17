<script lang="ts" setup>
import { useFlyerData } from '../composables/utils/data'
import { ref, onMounted, computed, watch } from 'vue'
import MetaDetails from '../components/MetaDetails.vue'
import FormSection from '../components/FormSection.vue'
import DimensionsInput from '../components/DimensionsInput.vue'
import type FlyerAttributes from '../types/products/flyer/flyer'
import type Category from '../types/categories/category'
import type ProductContainer from '../types/combinations/product_container'
import SelectedAttribute from '../types/combinations/selected_attribute'
import AttributeSelect from '../components/AttributeSelect.vue'

const loaded = ref(false)
const getPrices = ref<Function>()
const error = ref(false)

const flyerCat = ref<Category>()
const attributes = ref<FlyerAttributes>()
const combinations = ref<ProductContainer[]>([])

const selectedAttributes = ref<SelectedAttribute[]>([])
const submit = ref(false)
const complete = ref(false)

const width = () => {
  return attributes.value ? attributes.value['Custom width'][0] : null
}

const height = () => {
  return attributes.value ? attributes.value['Custom height'][0] : null
}

/**
 * From each individual input, the selected attribute is added/updated in the selectedAttributes array.
 * @param attribute The attribute corresponding to the input element.
 */
const handleSubmission = (attribute: SelectedAttribute) => {
  if (selectedAttributes.value.length === 0) {
    selectedAttributes.value.push(attribute)
  } else {
    const index = selectedAttributes.value.findIndex((attr) => attr.attribute === attribute.attribute)
    if (index !== -1) {
      selectedAttributes.value[index] = attribute
    } else {
      selectedAttributes.value.push(attribute)
    }
  }
}

const cancel = () => {
  complete.value = false
  submit.value = false
}

/**
 * In order to add inputs in v-for, array format will be returned (array of key-value pairs).
 */
const remainingAttributes = computed<Array<[string, Array<string | number>]>>(() => {
  const exclude = ['Custom width', 'Custom height']
  return attributes.value
    ? Object.entries(attributes.value).filter((key) => {
        return !exclude.includes(key[0])
      })
    : []
})

// const handlePrices = () => {
//   if (complete.value && typeof getPrices?.value === 'function') {
//     console.log(getPrices.value(selectedAttributes.value))
//     cancel()
//   }
// }

// watch(submit, (newVal) => {
//   if (newVal) {
//     // After all emits are processed and if there are no invalid inputs
//     handlePrices()
//   }
// })

/**
 * The data is loaded from the API and stored in the respective variables.
 */
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
      console.log(attributes.value)
      console.log(remainingAttributes.value)
    } else {
      console.error('Data not loaded yet')
    }
  } catch (err) {
    console.error('Failed to load data', err)
  }
})
</script>

<template>
  <template v-if="loaded && !error">
    <div class="box-border w-full items-center justify-center pt-16 font-normal">
      <div class="border-outline min-w-[800px]border-2 m-6 flex flex-col rounded-lg border-slate-200 py-6 shadow-lg">
        <p class="pb-4 text-center text-3xl">Product Configuration and Price Menu</p>
        <div class="my-4 flex items-center justify-center space-x-4">
          <template v-if="flyerCat">
            <MetaDetails label="Name" :data="flyerCat.name" />
            <MetaDetails label="Date Modified" :data="flyerCat.combinationsModifiedAt.split(' ')[0]" />
          </template>
        </div>
        <p class="text-center text-sm font-bold">Please select from the options below to see available prices.</p>
        <div class="mt-8 flex flex-col bg-slate-100">
          <FormSection
            text="1 - Select Dimensions"
            subtext="Please select the dimensions of the flyer and then proceed to the next section."
          />
          <div class="grid max-w-full grid-cols-2 gap-4 px-4 py-4">
            <template v-if="width() != null && height() != null">
              <DimensionsInput
                :submit="submit"
                label="Custom Width"
                original="Custom width"
                :dimensions="width()!"
                @submit="handleSubmission"
                @invalid="cancel"
              />
              <DimensionsInput
                :submit="submit"
                label="Custom Height"
                original="Custom height"
                :dimensions="height()!"
                @submit="handleSubmission"
                @invalid="cancel"
              />
            </template>
          </div>
          <FormSection
            text="2 - Select Additional Parameters"
            subtext="Please make selections for the attributes below and then submit to see the prices."
          />
          <div class="grid max-w-full grid-cols-2 gap-4 px-4 py-4">
            <template v-for="attribute in remainingAttributes">
              <AttributeSelect :submit="submit" :data="attribute" @submit="handleSubmission" @invalid="cancel" />
            </template>
          </div>
        </div>
        <div class="mt-8 flex w-full justify-center">
          <button
            @click="
              () => {
                submit = true
                complete = true
              }
            "
            class="w-1/2 rounded-lg bg-secondary px-4 py-2 font-bold text-white shadow-lg duration-300 hover:bg-rose-700"
          >
            Check Prices
          </button>
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
