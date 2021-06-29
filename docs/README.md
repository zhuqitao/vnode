# 组件
* VNode（Virtual DOM）,是真实 DOM 的描述
```
const elementVnode = {
  _isVNode: true, // 代表是一个VNode对象
  tag: 'div', // tag是h（createElement）函数的第一个参数， String | Component
  flags,  // 根据tag的值判断是普通标签还是组件
  data, // attr，DOM prop，事件等
  children, // 子节点
  childFlags, // 子节点类型（单个、多个）
  el: null, // 被挂载到真实dom，指向对应的真实dom
}
```

* 组件
```
class MyComponent {
  render() {
    // render 函数产出 VNode
    return {
      tag: 'div'
    }
  }
}
```

通过 判断 vnode.tag 是否是字符串 来区分：一个 VNode 到底是 html 标签还是组件

* VNode 分成五类，分别是：html/svg 元素、组件（组件细分为 有状态组件 和 函数式组件）、纯文本、Fragment 以及 Portal

* VNodeData：VNode 的 data 属性，任何可以对 VNode 进行描述的内容（class，style，组件的事件，组件的 props）都可以将其存放到 VNodeData 对象中

* _isVNode： 判断一个对象是否是 VNode 对象

* el 属性的值在 VNode 被渲染为真实 DOM 之前一直都是 null，当 VNode 被渲染为真实 DOM 之后，el 属性的值会引用该真实 DOM

一个完整的VNode：
```
export interface VNode {
  // _isVNode 属性在上文中没有提到，它是一个始终为 true 的值，有了它，我们就可以判断一个对象是否是 VNode 对象
  _isVNode: true
  // el 属性在上文中也没有提到，当一个 VNode 被渲染为真实 DOM 之后，el 属性的值会引用该真实DOM
  el: Element | null
  flags: VNodeFlags
  tag: string | FunctionalComponent | ComponentClass | null
  data: VNodeData | null
  children: VNodeChildren
  childFlags: ChildrenFlags
}
```

* VNode 的 h 函数： 创建 VNode 对象的函数封装
