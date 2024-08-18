<script lang="ts" setup>
import { useFlyerData } from '../composables/utils/data'
import { ref, onMounted, computed, watch } from 'vue'
import type FlyerAttributes from '../types/products/flyer/flyer'
import type Category from '../types/categories/category'
import type ProductContainer from '../types/combinations/product_container'
import type SelectedAttribute from '../types/combinations/selected_attribute'
import type Price from '../types/combinations/price'
import type CustomPrice from '../types/custom/custom_price'
import AttributeSelect from '../components/AttributeSelect.vue'
import MetaDetails from '../components/MetaDetails.vue'
import FormSection from '../components/FormSection.vue'
import DimensionsInput from '../components/DimensionsInput.vue'
import PriceRow from '../components/PriceRow.vue'
import CustomPriceRow from '../components/CustomPriceRow.vue'

/**
 * loaded - Boolean value to determine if the data has been loaded from the API.
 * error - Boolean value to determine if an error occurred while loading the data.
 * flyerCat - The metadata of the product (flyer in this case).
 * attributes - The attributes of the product (flyer).
 * combinations - The combinations of the product (flyer).
 * selectedAttributes - The attributes selected by the user.
 * submit - Boolean value to determine if the user has submitted the form.
 * complete - Boolean value to determine if the submission process is completed successfully.
 * validSubmissions - Counter to keep track of the number of valid submissions. Will be used to determine whether a submission is complete.
 * custom - Boolean value to determine if the user will make a custom request (a custom request differs from a standard request as it will have custom dimensions).
 * prices - The prices of the product based on the selected attributes.
 * customPrice - The price of the product based on the custom dimensions.
 * refresh - Function to refresh the data from the API.
 * loadDataFromDB - Function to load the data from the database.
 * updateDB - Function to update the database with the new data.
 * getPrices - Function to get the prices based on the selected attributes.
 * getCustomPrice - Function to get the price based on the custom dimensions.
 * exclude - Array of attributes to exclude if performing a standard request (attributes specific to a custom request).
 */

const loaded = ref(false)
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
const customPrice = ref<CustomPrice>()
const refresh = ref<Function>()
const loadDataFromDB = ref<Function>()
const updateDB = ref<Function>()
const getPrices = ref<Function>()
const getCustomPrice = ref<Function>()
const exclude = ['Custom width', 'Custom height', 'quantity']

/**
 *Checks if the 'Custom width' attribute exists on the attributes object. Used to render the custom dimensions input fields.
 */
const width = () => {
  return attributes.value ? attributes.value['Custom width'][0] : null
}

/**
 * Checks if the 'Custom height' attribute exists on the attributes object. Used to render the custom dimensions input fields.
 */
const height = () => {
  return attributes.value ? attributes.value['Custom height'][0] : null
}

/**
 * Each individual input field will emit an event when the parent (MainView) is ready to submit the data. This emit sends the selected attribute to the parent (MainView).
 * Then, the parent will store the selected attribute in the selectedAttributes array.
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
 * This method is used to reset the submission process. It will set the submit and complete variables to false, and reset the validSubmissions counter.
 */
const cancel = () => {
  submit.value = false
  complete.value = false
  validSubmissions.value = 0
}

/**
 * Aside from the custom dimensions, all other attributes are stored in the remainingAttributes array. This is so that they can be dynamically rendered.
 * Custom Dimensions are not required - they are only available for custom requests.
 */
const remainingAttributes = computed<Array<[string, Array<string | number>]>>(() => {
  return attributes.value
    ? Object.entries(attributes.value).filter((key) => {
        return !exclude.includes(key[0])
      })
    : []
})

/**
 * Quantity should only be available for custom requests. This is because the quantity is not a standard attribute for the product.
 */
const quantity = computed<[string, Array<string | number>]>(() => {
  if (attributes.value) {
    const data = Object.entries(attributes.value).find((entry) => {
      return entry[0] === 'quantity'
    })
    if (data) {
      return data
    }
  }
  return ['quantity', ['Unavailable']]
})

/**
 * This watcher will remove the custom dimensions from the selectedAttributes array if the custom variable is set to false when it was true.
 * When custom is true, it means that the custom dimensions have a chance to have been selected, thus, they need to be removed from the selectedAttributes array.
 *
 */
watch(custom, (newVal: boolean, oldVal: boolean) => {
  if (oldVal && !newVal) {
    selectedAttributes.value = selectedAttributes.value.filter((attr) => {
      return !['Custom width', 'Custom height', 'quantity'].includes(attr.attribute)
    })
  }
})

/**
 * Depending on whether a custom request is made or not, the selectedAttributes array will be used to determine the price.
 * If a custom request is made, the getCustomPrice function (sends request to API - refer to /composables/api/flyer/custom.ts) will be used to determine the price.
 * If a standard request is made, the getPrices function (searches through data from DB - refer to /composables/utils/data.ts) will be used to determine the price.
 */
const fetchPrices = async () => {
  if (custom.value) {
    if (attributes.value && validSubmissions.value === Object.keys(attributes.value).length) {
      complete.value = true
      if (typeof getCustomPrice?.value === 'function') {
        try {
          customPrice.value = await getCustomPrice.value(selectedAttributes.value)
        } catch (error) {
          console.error('Error fetching custom price:', error)
        }
        cancel()
      }
    }
  } else {
    if (validSubmissions.value === Object.keys(remainingAttributes.value).length) {
      complete.value = true
      if (typeof getPrices?.value === 'function') {
        try {
          prices.value = await getPrices.value(selectedAttributes.value)
        } catch (error) {
          console.error('Error fetching prices:', error)
        }
        cancel()
      }
    }
  }
}

/**
 * Watcher to execute the fetchPrices function when the submit variable is set to true.
 */
watch(validSubmissions, fetchPrices)

/**
 * The data is loaded from the database when the component is mounted. Then, the variables are set with respect to the incoming data.
 */
onMounted(async () => {
  try {
    const result = useFlyerData()

    refresh.value = result.refresh
    loadDataFromDB.value = result.loadDataFromDB
    updateDB.value = result.updateDB

    await refresh.value()

    // Destructure into new variables.
    const { flyerCat: fc, attributes: attr, combinations: comb } = result.accessData()

    flyerCat.value = fc.value
    attributes.value = attr.value
    combinations.value = comb.value

    loaded.value = result.loaded.value
    getPrices.value = result.getPrices
    error.value = result.error.value
    getCustomPrice.value = result.getCustomPrice

    // TODO: Determine how to compress the data to be stored in the database.

    // await updateDB.value({ flyerCat: flyerCat.value, attributes: attributes.value, combinations: combinations.value })
    // await loadDataFromDB.value()

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
            subtext="Please make selections for all the attributes below and then submit to see the prices. 
            If 'Unavailable' is displayed, your selections do not correlate to a valid product configuration. Make sure you fill all the required fields."
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
                <AttributeSelect :submit="submit" :data="quantity" @submit="handleSubmission" @invalid="cancel" />
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
        <p class="pb-3 pr-6 text-right text-sm text-slate-600">{{ custom ? 'Items: 1' : 'Items: ' + prices.length }}</p>
        <div class="grid max-w-full grid-cols-3 gap-0 px-4 py-4">
          <template v-if="!custom">
            <p class="border-b-2 border-secondary pb-3 text-center text-xl">Quantity</p>
            <p class="border-x-2 border-b-2 border-secondary pb-3 text-center text-xl">Price (€)</p>
            <p class="border-b-2 border-secondary pb-3 text-center text-xl">Additional Information</p>
            <template v-for="price in prices">
              <PriceRow :price="price" />
            </template>
          </template>
          <template v-else>
            <p class="border-b-2 border-secondary pb-3 text-center text-xl">Price (€)</p>
            <p class="border-x-2 border-b-2 border-secondary pb-3 text-center text-xl">Delivery Days</p>
            <p class="border-b-2 border-secondary pb-3 text-center text-xl">Promised Arrival Date</p>
            <CustomPriceRow :price="customPrice" />
          </template>
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="flex h-screen flex-col items-center justify-center">
      <img class="h-16 w-16" src="https://icons8.com/preloaders/preloaders/1488/Iphone-spinner-2.gif" alt="" />
      <p class="mt-6 font-normal text-2xl font-bold">Loading...</p>
    </div>
  </template>
</template>

<style scoped></style>
