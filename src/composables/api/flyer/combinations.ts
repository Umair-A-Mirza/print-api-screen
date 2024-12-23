import { useApi } from '../core'

export const useCombinations = () => {
  const api = useApi('products')

  const getCombinations = async (id: string, additional: string) => {
    return api.get(id, additional)
  }

  // Other API methods can be added when required.

  return { getCombinations }
}
