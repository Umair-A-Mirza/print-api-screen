<script lang="ts" setup>
import Price from '../types/combinations/price'
const props = defineProps<{ price: Price }>()
</script>

<template>
  <p class="text-md py-1 text-center">{{ props.price.quantity }}</p>
  <p class="text-md py-1 text-center">{{ props.price.price }}</p>
  <p class="text-md py-1 text-center">{{ props.price.information.deliveryDays + ' delivery days.' }}</p>
</template>
