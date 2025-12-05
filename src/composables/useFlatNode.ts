import { reactive } from 'vue'
interface FlatTree {
  id: string
  parentId?: string | null
  data?: Record<string, any>
  depth: number
}

export class FlatTreeManager {
  //节点map
  private nodes = reactive<Map<string, FlatTree>>(new Map())
  //子节点路径map
  private childrens = reactive<Map<string, string[]>>(new Map())

  //新增节点
  addNode(id: string, parentId: string | null, data: any) {
    const depth = parentId ? (this.nodes.get(parentId)?.depth || 0) + 1 : 0
    //新节点加入到节点映射中
    this.nodes.set(id, {
      id,
      parentId,
      data,
      depth,
    })
    //新节点加入到路径映射中
    if (parentId) {
      const depthArr = this.childrens.get(parentId) || []
      depthArr.push(id)
      this.childrens.set(parentId, depthArr)
    }
  }
  //删除节点
  deleteNode = (id: string, parentId: string | null) => {
    const deleteRelative = (cid: string) => {
      const childrens = this.childrens.get(cid) || []
      childrens.forEach((childId) => deleteRelative(childId))
      //删除cid所在的节点和路径映射
      this.nodes.delete(cid)
      this.childrens.delete(cid)
    }
    //删除目标节点相关的所有节点映射和路径映射
    deleteRelative(id)
    //从目标节点的父节点中删除相关数据
    if (parentId) {
      const siblings = this.childrens.get(parentId)
      if (siblings) {
        const index = siblings.indexOf(id)
        if (index > -1) {
          siblings.splice(index, 1)
        }
      }
    }
  }
  //插入节点
  inserNode = () => {}
  //获取目标节点的所有子节点
  getChildren = (targetId: string) => {
    const childrens = this.childrens.get(targetId) || []
    return childrens.map((childId) => this.nodes.get(childId))
  }
  //获取根节点
  getRoot = () => {
    return Array.from(this.nodes.values()).filter((node) => node.parentId === null)
  }
}
