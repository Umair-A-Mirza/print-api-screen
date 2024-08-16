import SelectedAttribute from './selected_attribute'
import Price from './price'

export default interface Product {
  attributes: SelectedAttribute[]
  prices: Price[]
}
