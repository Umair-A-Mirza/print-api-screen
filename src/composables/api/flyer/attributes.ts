import { useApi } from '../core'

export const useAttributes = () => {
  const api = useApi('products')

  const getAttributes = async (id: string, additional: string) => {
    return api.get(id, additional)
  }

  // Other API methods can be added when required.

  return { getAttributes }
}
