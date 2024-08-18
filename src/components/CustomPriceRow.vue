<script lang="ts" setup>
import CustomPrice from '../types/custom/custom_price'
const props = defineProps<{ price: CustomPrice | undefined }>()
</script>

<template>
  <template v-if="props.price">
    <p class="text-md py-1 text-center">{{ props.price.price }}</p>
    <p class="text-md py-1 text-center">{{ props.price.deliveryDays + ' delivery days.' }}</p>
    <p class="text-md py-1 text-center">{{ props.price.promisedArrivalDate }}</p>
  </template>
  <template v-else>
    <p class="text-md py-1 text-center">Unavailable</p>
    <p class="text-md py-1 text-center">Unavailable</p>
    <p class="text-md py-1 text-center">Unavailable</p>
  </template>
</template>
