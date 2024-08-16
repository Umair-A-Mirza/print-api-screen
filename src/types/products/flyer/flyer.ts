import type Dimensions from '../dimensions'

export default interface FlyerAttributes {
  'Custom width': Dimensions[]
  'Custom height': Dimensions[]
  quantity: number[]
  [key: string]: any
}
