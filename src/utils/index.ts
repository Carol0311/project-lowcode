export const deepClone = (arg: any, hash = new WeakMap()) => {
  //待拷贝数据为null/undefined 原值返回
  if (arg === null || arg === undefined) return arg
  //Date/RegExp类型 返回类型实例
  if (arg instanceof Date) return new Date(arg)
  if (arg instanceof RegExp) return new RegExp(arg)
  //待拷贝数据为基础类型，返回基础类型的拷贝
  if (typeof arg !== 'object') return arg
  //避免重复
  if (hash.get(arg)) return hash.get(arg)
  //待拷贝数据为对象类型
  if (typeof arg === 'object') {
    const result = new arg.constructor()
    hash.set(arg, result)
    for (const key in arg) {
      if (arg.hasOwnProperty(key)) {
        //递归拷贝
        result[key] = deepClone(arg[key], hash)
      }
    }
    return result
  }
}
// 生成组件唯一id的方法
export const generateUniqueId = (name: string): string => {
  // 采用当前时间戳+随机数的方式生成唯一字符串
  return name + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9)
}
//generateId函数的简单实现
export const generateId = (): string => {
  return (
    'id_' +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}
//检测当前设备是否在移动端
export const isMobile = (): boolean => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 'ontouchstart' in window
}
//检测移动端是否有摄像头
export const hasCamera = async () => {
  if (isMobile() && 'mediaDevice' in navigator) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.some((device) => device.kind === 'videoinput')
    } catch (e) {
      console.log(e)
      return false
    }
  }
  return false
}
