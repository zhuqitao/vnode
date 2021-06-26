import {VNodeFlags, ChildrenFlags} from './flags';

/**
 * 
 * @param {*} vnode 将要被渲染的 VNode(虚拟dom) 对象
 * @param {*} container 挂载点，用来承载内容的容器，是一个真实的dom对象
 * eq: render(elementVnode, document.getElementById('app'))
 */
export function render(vnode, container) {
    const prevVNode = container.vnode;
    
    if(!prevVNode) {
        // 没有旧的 VNode
        if(vnode) {
            mount(vnode, container);
            container.vnode = vnode;
        }
    } else {
        // 存在旧的 VNode 也有新的VNode
        // if(vnode) {
        //     patch(prevVNode, vnode, container);
        //     container.vnode = vnode;
        // } else {
        //     // 存在旧的 VNode  不存在新的VNode 应该移除 DOM
        //     container.removeChild(prevVNode.el);
        //     container.vnode = null;
        // }
    }

}

function mount(vnode, container) {
    const { flags } = vnode;
    if (flags & VNodeFlags.ELEMENT) {
        // 挂载普通标签
        mountElement(vnode, container);
    } 
    // else if (flags & VNodeFlags.COMPONENT) {
    //     // 挂载组件
    //     mountComponent(vnode, container);
    // } else if (flags & VNodeFlags.TEXT) {
    //     // 挂载纯文本
    //     mountText(vnode, container);
    // } else if (flags & VNodeFlags.FRAGMENT) {
    //     // 挂载 Fragment
    //     mountFragment(vnode, container);
    // } else if (flags & VNodeFlags.PORTAL) {
    //     // 挂载 Portal
    //     mountPortal(vnode, container);
    // }
}

// 挂在普通元素
function mountElement(vnode, container) {
    const el = document.createElement(vnode.tag);
    // 该虚拟VNode在浏览器中有真实的dom与之对应，VNode的el属性指向对应的真实dom
    

    // 处理VNodeData
    /**
     * eq: 
     * const elementVnode = h(
     *   'div',
     *    {
     *       style: {
     *         height: '100px',
     *         width: '100px',
     *         background: 'red'
     *       }
     *    }
     * )
     */
    const data = vnode.data;
    if(data) {
        for(let key in data) {
            switch(key) {
                // 样式
                case 'style':
                    for(let k in data.style) {
                        el.style[k] = data.style[k];
                    }
                    break;
                // class
                case 'class':
                    el.className = data[key];
                /**
                 * Attributes 和 DOM Properties。
                 * Attributes是标准属性（比如id, document.body.id），直接el.attr可以访问和赋值，也可以使用set(get)Attribute方法 
                 * DOM Properties不是标准属性(比如自定义属性<input custom="xxx" />)，必须借助set(get)Attribute方法
                 * 注意：value、checked、selected、muted以及所有拥有大写字母的属性（innerHTML、textContent等）不能使用setAttribute赋值，只能直接操作对象属性值（el.checked = false）
                 *      setAttribute(checked, false) 等价 setAttribute(checked, 'false') ，setAttribute会把第二个参数转成字符串再赋值
                 * 
                 */
                default:
                    const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/; // 匹配value、checked、selected、muted以及所有拥有大写字母的属性
                    if(domPropsRE.test(key)) {
                        // 当作 DOM Prop 处理
                        el[key] = data[key];
                    } else {
                        // 当做 Attr 处理
                        el.setAttribute(key, data[key])
                    }

            }
        }
    }

    // 处理子节点 递归 当前VNode对应的真实dom对象el 就是其子节点的挂载容器
    const children = vnode.children;
    const childFlags = vnode.childFlags;
    // 存在子节点
    // debugger;
    console.log('children', vnode);
    if(childFlags !== ChildrenFlags.NO_CHILDREN) {
        // 单个子节点 
        if(childFlags & ChildrenFlags.SINGLE_VNODE) {
            mount(children, el);
        } else if(childFlags & ChildrenFlags.KEYED_VNODES) {
            const childLength = children.length;
            console.log('================================================================', children)
            for(let i = 0; i < children.length; i++) {
                console.log(children)
                mount(children[i], el);
            }
        }
        
    }
    vnode.el = el;
    container.appendChild(el);
}