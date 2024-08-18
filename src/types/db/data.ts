import Category from '../categories/category'
import ProductContainer from '../combinations/product_container'
import FlyerAttributes from '../products/flyer/flyer'

export default interface Data {
  flyerCat: Category
  attributes: FlyerAttributes
  combinations: ProductContainer[]
}
