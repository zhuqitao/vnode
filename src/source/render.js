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
    else if(flags & VNodeFlags.TEXT) {
        // 挂载纯文本
        mountText(vnode, container);
    }
    else if (flags & VNodeFlags.FRAGMENT) {
        // 挂载 Fragment
        mountFragment(vnode, container);
    }
    else if (flags & VNodeFlags.PORTAL) {
        // 挂载 Portal
        mountPortal(vnode, container);
    }
    else if (flags & VNodeFlags.COMPONENT) {
        // 挂载组件
        mountComponent(vnode, container);
    }
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
                    if(key[0] === 'o' && key[1] === 'n') {
                        // DOM 对象的设计即可，在原生 DOM 对象中所有事件函数的名字都是 'on' + 事件名称 的形式
                        el.addEventListener(key.slice(2), data[key]);
                    } else if (domPropsRE.test(key)) {
                        // 当作 DOM Prop 处理
                        el[key] = data[key];
                    } else {
                        // 当做 Attr 处理
                        el.setAttribute(key, data[key]);
                    }
            }
        }
    }

    // 处理子节点 递归 当前VNode对应的真实dom对象el 就是其子节点的挂载容器
    const children = vnode.children;
    const childFlags = vnode.childFlags;
    // 存在子节点
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

function mountText(vnode, container) {
    const el = document.createTextNode(vnode.children);
    vnode.el = el;
    container.appendChild(el);
}

function mountFragment(vnode, container) {
    /**
     * const elementVNode = h(
     *   'div',
     *   {
     *       style: {
     *       height: '100px',
     *       width: '100px',
     *       background: 'red'
     *       }
     *   },
     *   h(Fragment, null, [
     *       h('span', null, '我是标题1......'),
     *       h('span', null, '我是标题2......')
     *   ])
     *   )
     */
    const children = vnode.children;
    const childFlags = vnode.childFlags;
    if(childFlags & ChildrenFlags.SINGLE_VNODE) {
        // 单个子节点 并且el指向子节点
        mount(children, container);
        vnode.el = children.el;
    } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
        // 多个子节点 el指向第一个子节点
        for(let i = 0; i < children.length; i++) {
            mount(children[i], container);
        }
        vnode.el = children[0].el;
    } else {
        // 没有子节点 等价于挂载空片段，会创建一个空的文本节点占位，el指向占位的空文本节点
        const placeholder = document.createTextNode('');
        mount(placeholder, container);
        vnode.el = placeholder;
    }
}

function mountPortal(vnode, container) {
    /**
     * const elementVNode = h(
     *   'div',
     *   {
     *       style: {
     *       height: '100px',
     *       width: '100px',
     *       background: 'red'
     *       }
     *   },
     *   h(Portal, { target: '#portal-box' }, [
     *       h('span', null, '我是标题1......'),
     *       h('span', null, '我是标题2......')
     *   ])
     *   )
     */

    /** h.js:
     * else if(tag === Portal) {
        flags = VNodeFlags.PORTAL;
        tag = data && data.target;
    }
     */
    // Protal可以被认为是子元素可以挂载在任意地方的Fragment，其本身不会渲染dom，Portal 的 VNode 其 tag 属性值为挂载点(选择器或真实DOM元素)
    
    const {tag, children, childFlags} = vnode;
    // debugger;
    const target = typeof tag === 'string' ? document.querySelector(tag) : tag;

    if(childFlags & ChildrenFlags.SINGLE_VNODE) {
        mount(children, target);
    } else if (childFlags & ChildrenFlags.MULTIPLE_VNODES) {
        for(let i = 0; i < children.length; i++) {
            mount(children[i], target);
        }
    }

    /** 
     * 那么对于 Portal 类型的 VNode 其 el 属性应该指向谁呢？应该指向挂载点元素吗？
     * 实际上虽然 Portal 所描述的内容可以被挂载到任何位置，但仍然需要一个占位元素，
     * 并且 Portal 类型的 VNode 其 el 属性应该指向该占位元素，为什么这么设计呢？这
     * 是因为 Portal 的另外一个特性：虽然 Portal 的内容可以被渲染到任意位置，但
     * 它的行为仍然像普通的DOM元素一样，如事件的捕获/冒泡机制仍然按照代码所编写的
     * DOM结构实施。要实现这个功能就必须需要一个占位的DOM元素来承接事件。
    */
   const placeholder = document.createTextNode('');
   // 注意：是挂载到container，不是target
   mount(placeholder, container);
   vnode.el = placeholder;
}

function mountComponent(vnode, container) {
    // 通过有无render函数判断是有状态组件 还是无状态组件
    const flags = vnode.flags;
    if(flags & VNodeFlags.COMPONENT_STATEFUL) {
        mountStatefulComponent(vnode, container);
    } else {
        mountFunctionalComponent(vnode, container);
    }
}

function mountStatefulComponent(vnode, container) {
    /**
     * class MyComponent {
        render() {
            return h(
            'div',
            {
                style: {
                background: 'green'
                }
            },
            [
                h('span', null, '我是组件的标题1......'),
                h('span', null, '我是组件的标题2......')
            ]
            )
        }
        }
     */
    const instance = new vnode.tag();
    // 获取VNode对象
    instance.$vnode = instance.render();
    mount(instance.$vnode, container);
    instance.$el = vnode.el = instance.$vnode.el;

}