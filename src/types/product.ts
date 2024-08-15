import Attribute from './attribute'
import Price from './price'

export default interface Product {
  attributes: Attribute[]
  prices: Price[]
}
