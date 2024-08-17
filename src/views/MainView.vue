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
import Price from '../types/combinations/price'
import PriceRow from '../components/PriceRow.vue'

const loaded = ref(false)
const getPrices = ref<Function>()
const error = ref(false)

const flyerCat = ref<Category>()
const attributes = ref<FlyerAttributes>()
const combinations = ref<ProductContainer[]>([])

const selectedAttributes = ref<SelectedAttribute[]>([])
const submit = ref(false)
const complete = ref(false)

const validSubmissions = ref(0)
const custom = ref(false)
const prices = ref<Price[]>([])

const refresh = ref<Function>()

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
  validSubmissions.value++
}

/**
 * If a single input field is invalid, the submission is cancelled.
 */
const cancel = () => {
  submit.value = false
  complete.value = false
  validSubmissions.value = 0
}

/**
 * In order to add inputs in v-for, array format will be returned (array of key-value pairs).
 */
const remainingAttributes = computed<Array<[string, Array<string | number>]>>(() => {
  const exclude = ['Custom width', 'Custom height', 'quantity']
  return attributes.value
    ? Object.entries(attributes.value).filter((key) => {
        return !exclude.includes(key[0])
      })
    : []
})

/**
 * Based on whether custom dimensions are selected, the watcher will determine if the submission is complete, and then executes the getPrices function.
 */
watch(validSubmissions, (newVal) => {
  if (custom.value) {
    if (attributes.value) {
      if (newVal === Object.keys(attributes.value).length) {
        complete.value = true
        if (typeof getPrices?.value === 'function') {
          prices.value = getPrices.value(selectedAttributes.value)
          cancel()
        }
      }
    }
  } else {
    if (newVal === Object.keys(remainingAttributes.value).length) {
      complete.value = true
      if (typeof getPrices?.value === 'function') {
        prices.value = getPrices.value(selectedAttributes.value)
        cancel()
      }
    }
  }
})

/**
 * The data is loaded from the API and stored in the respective variables.
 */
onMounted(async () => {
  try {
    const result = useFlyerData()
    // TODO: Add logic here to determine if the database needs to be updated (new query to API), or the data we use comes from the database.

    refresh.value = result.refresh
    await refresh.value()
    // Destructure into new variables.
    const { flyerCat: fc, attributes: attr, combinations: comb } = result.accessData()

    flyerCat.value = fc.value
    attributes.value = attr.value
    combinations.value = comb.value

    loaded.value = result.loaded.value
    getPrices.value = result.getPrices
    error.value = result.error.value

    if (loaded.value && !error.value) {
      console.log('Data Loaded Successfully')
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
    <div class="box-border flex w-full items-center justify-center pt-16 font-normal">
      <div class="border-outline m-6 flex max-w-[1200px] flex-col rounded-lg border-2 border-slate-200 py-6 shadow-lg">
        <p class="pb-4 text-center text-3xl">Product Configuration and Price Menu</p>
        <div class="my-4 flex items-center justify-center space-x-4">
          <template v-if="flyerCat">
            <MetaDetails label="Name" :data="flyerCat.name" />
            <MetaDetails label="Date Modified" :data="flyerCat.combinationsModifiedAt.split(' ')[0]" />
          </template>
        </div>
        <div class="mt-8 flex flex-col bg-slate-100">
          <FormSection
            text="1 - Select Base Parameters"
            subtext="Please make selections for the attributes below and then submit to see the prices."
          />
          <div class="grid max-w-full grid-cols-2 gap-4 px-4 py-4">
            <template v-for="attribute in remainingAttributes">
              <AttributeSelect
                :submit="submit"
                :data="attribute"
                @submit="handleSubmission"
                @invalid="cancel"
                @show="custom = true"
                @hide="custom = false"
              />
            </template>
          </div>
          <template v-if="custom">
            <FormSection
              text="2 - Select Custom Dimensions"
              subtext="If you selected custom sizes, please set the width and height below."
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
          </template>
        </div>
        <div class="mb-8 mt-8 flex w-full justify-center">
          <button
            @click="
              () => {
                submit = true
              }
            "
            class="w-1/2 rounded-lg bg-secondary px-4 py-2 font-bold text-white shadow-lg duration-300 hover:bg-rose-700"
          >
            Check Prices
          </button>
        </div>
        <FormSection text="Prices" subtext="The prices for the selected attributes are displayed below." />
        <p class="pb-3 pr-6 text-right text-sm text-slate-600">{{ 'Items: ' + prices.length }}</p>
        <div class="grid max-w-full grid-cols-3 gap-0 px-4 py-4">
          <p class="border-b-2 border-secondary pb-3 text-center text-xl">Quantity</p>
          <p class="border-x-2 border-b-2 border-secondary pb-3 text-center text-xl">Price (€)</p>
          <p class="border-b-2 border-secondary pb-3 text-center text-xl">Additional Information</p>
          <template v-for="price in prices">
            <PriceRow :price="price" />
          </template>
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
