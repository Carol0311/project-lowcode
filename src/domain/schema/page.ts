//domain层：领域层 纯TS类型和业务规则，不依赖Vue
// page schema
import type { ComponentSchema } from './component'
export interface PageSchema {
  id: string
  name: string
  rootComponentIds: string[] //页面根节点id
  components: Record<string, ComponentSchema> //存放id-->nodes映射
  children: Record<string, string[]> //存放id--->childrenIds映射
}
