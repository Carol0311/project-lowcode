//组件数增删改，移动
// domain/editor/treeOperations.ts
import type { ComponentSchema, PageSchema } from '../schema/index'

/**
 * 组件树操作 - 纯函数
 * 不依赖任何框架，只有业务逻辑
 */

//根据id查找组件
export function findComponentById(page: PageSchema, componentId: string): ComponentSchema | null {
  const components = page?.components || {}
  if (components.hasOwnProperty(componentId)) {
    return components[componentId]
  }
  return null
}

///更新指定组件的属性值
export function updateComponentById(
  page: PageSchema,
  componentId: string,
  data: Record<string, any>,
) {
  const component = findComponentById(page, componentId)
  if (component) {
    component.props = Object.assign(component.props, data)
  }
}

// 添加组件
export function addComponent() {}

// 删除组件
export function deleteComponent(page: PageSchema, componentId: string): PageSchema {
  const component = findComponentById(page, componentId)
  if (!component) return page

  const newPage = JSON.parse(JSON.stringify(page))

  // 从父组件移除
  if (component.parentId) {
    const parent = findComponentById(newPage, component.parentId)
    if (parent) {
      parent.children = parent.children.filter((id) => id !== componentId)
      newPage.components[component.parentId] = { ...parent }
    }
  } else {
    // 从根组件移除
    newPage.rootComponentIds = newPage.rootComponentIds.filter((id) => id !== componentId)
  }

  // 递归删除子组件
  const deleteRecursive = (id: string) => {
    const comp = findComponentById(newPage, id)
    if (comp) {
      comp.children.forEach((childId) => deleteRecursive(childId))
      delete newPage.components[id]
    }
  }

  deleteRecursive(componentId)
  return newPage
}

// 复制组件
export function copyComponent(
  page: PageSchema,
  componentId: string,
  generateId: (type: string) => string,
): PageSchema {
  const component = findComponentById(page, componentId)
  if (!component) return page

  const newPage = JSON.parse(JSON.stringify(page))

  // 生成新组件（带新的ID）
  const copyRecursive = (comp: ComponentSchema, newParentId?: string): ComponentSchema => {
    const newId = generateId(comp.type)
    const newComponent = {
      ...comp,
      id: newId,
      parentId: newParentId || comp.parentId,
    }

    // 复制子组件
    newComponent.children = comp.children
      .map((childId) => {
        const child = findComponentById(newPage, childId)
        if (!child) return ''
        const copiedChild = copyRecursive(child, newId)
        return copiedChild.id
      })
      .filter(Boolean)

    newPage.components[newId] = newComponent
    return newComponent
  }

  const copiedComponent = copyRecursive(component)

  // 添加到父组件
  if (copiedComponent.parentId) {
    const parent = findComponentById(newPage, copiedComponent.parentId)
    if (parent) {
      parent.children.push(copiedComponent.id)
      newPage.components[copiedComponent.parentId] = { ...parent }
    }
  } else {
    // 添加到根组件
    newPage.rootComponentIds.push(copiedComponent.id)
  }

  return newPage
}

// 移动组件
export function moveComponent(
  page: PageSchema,
  componentId: string,
  newParentId: string | null,
  position?: 'before' | 'after' | 'first' | 'last',
): PageSchema {
  const component = findComponentById(page, componentId)
  if (!component) return page

  const newPage = JSON.parse(JSON.stringify(page))

  // 从原位置移除
  if (component.parentId) {
    const oldParent = findComponentById(newPage, component.parentId)
    if (oldParent) {
      oldParent.children = oldParent.children.filter((id) => id !== componentId)
      newPage.components[component.parentId] = { ...oldParent }
    }
  } else {
    newPage.rootComponentIds = newPage.rootComponentIds.filter((id) => id !== componentId)
  }

  // 更新组件的父ID
  component.parentId = newParentId
  newPage.components[componentId] = { ...component }

  // 添加到新位置
  if (newParentId) {
    const newParent = findComponentById(newPage, newParentId)
    if (newParent) {
      if (position === 'first') {
        newParent.children.unshift(componentId)
      } else if (position === 'last') {
        newParent.children.push(componentId)
      } else {
        // 默认添加到末尾
        newParent.children.push(componentId)
      }
      newPage.components[newParentId] = { ...newParent }
    }
  } else {
    // 添加到根组件
    if (position === 'first') {
      newPage.rootComponentIds.unshift(componentId)
    } else {
      newPage.rootComponentIds.push(componentId)
    }
  }

  return newPage
}
