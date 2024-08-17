import { ref } from 'vue'
import { useAttributes } from '../api/flyer/attributes'
import { useCategories } from '../api/flyer/categories'
import { useCombinations } from '../api/flyer/combinations'
import type Category from '../../types/categories/category'
import FlyerAttributes from '../../types/products/flyer/flyer'
import ProductContainer from '../../types/combinations/product_container'
import SelectedAttribute from '../../types/combinations/selected_attribute'
import Price from '../../types/combinations/price'

export const useFlyerData = () => {
  const { getCategories } = useCategories()
  const { getAttributes } = useAttributes()
  const { getCombinations } = useCombinations()

  const flyerCat = ref<Category>({ name: '', sku: '', combinationsModifiedAt: '' })
  const loaded = ref(false)
  const error = ref(false)

  const attributes = ref<FlyerAttributes>()
  const combinations = ref<ProductContainer[]>([])

  /**
   * Fetches data from the API and processes it to be used in the application.
   */
  const refresh = async () => {
    const categories: Category[] = await getCategories('', '/categories')

    if (!categories) {
      error.value = true
    }

    flyerCat.value = categories.find((cat: Category) => cat.name === 'Flyers') as Category

    if (!flyerCat.value || !(Object.keys(flyerCat.value).length > 0)) {
      error.value = true
    }
    const id = flyerCat.value.sku

    attributes.value = await getAttributes(id, '/attributes')

    if (!attributes) {
      error.value = true
    }

    combinations.value = await getCombinations(id, '/combinations')

    if (!combinations) {
      error.value = true
    }

    loaded.value = true
  }

  const accessData = () => {
    return { flyerCat, attributes, combinations }
  }

  /**
   * A search function for the prices of a product based on the selected attributes.
   * @param userAttributes The attributes selected by the user from the input fields.
   * @returns Price[] The prices of the product based on the selected attributes.
   */
  const getPrices = (userAttributes: SelectedAttribute[]): Price[] => {
    return combinations.value
      .filter((container: ProductContainer) => {
        const productAttrs = container.product.attributes

        // Boolean to check if all the user-selected attributes match the product attributes.
        const allMatch = userAttributes.every((attr: SelectedAttribute) =>
          productAttrs.some(
            (productAttr: SelectedAttribute) =>
              productAttr.attribute === attr.attribute && productAttr.value === attr.value
          )
        )

        // We are looking for an exact match, so the length of the product attributes should be the same as the user-selected attributes.
        const exact = allMatch && productAttrs.length === userAttributes.length

        return exact
      })
      .flatMap((container: ProductContainer) => container.product.prices)
  }

  return { refresh, accessData, loaded, getPrices, error }
}
