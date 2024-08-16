import { useApi } from '../core'

export const useCategories = () => {
  const api = useApi('products')

  const getCategories = async (id: string, additional: string) => {
    return api.get(id, additional)
  }

  // Other API methods can be added when required.

  return { getCategories }
}
