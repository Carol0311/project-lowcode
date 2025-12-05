//domain层：领域层 纯TS类型和业务规则，不依赖Vue
// page schema
import type { ComponentSchema } from './component'
export interface PageSchema {
  id: string
  name: string
  rootComponentIds: string[]
  components: Record<string, ComponentSchema>
}
