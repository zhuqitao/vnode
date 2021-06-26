import { VNodeFlags, ChildrenFlags } from './flags.js';

export const Fragment = Symbol();
export const Portal = Symbol();

export function h(tag, data = null, children = null) {
    console.log(tag);
    let flags = null;
    // tag String 代表html标签
    if(typeof tag === 'string') {
        flags = tag === 'svg' ? VNodeFlags.ELEMENT_SVG : VNodeFlags.ELEMENT_HTML;
    } else if(tag === Fragment) {
        flags = VNodeFlags.Fragment;
    } else if(tag === Portal) {
        flags = VNodeFlags.Portal;
        tag = data && data.target;
    } else {
        // 其他情况都认为是组件
        
        if(tag !== null && typeof tag === 'object') {
            // 兼容vue2的对象式组件
            flags = tag.functional
                ? VNodeFlags.COMPONENT_FUNCTIONAL       // 函数式组件
                : VNodeFlags.COMPONENT_STATEFUL_NORMAL  // 有状态组件
        } else if(typeof tag === 'function') {
            // Vue3 的类组件
            flags = tag.prototype && tag.prototype.render
                ? VNodeFlags.COMPONENT_STATEFUL_NORMAL       // 有状态组件
                : VNodeFlags.COMPONENT_FUNCTIONAL  // 函数式组件
        }
    }

    // 判断children类型 数组、VNode、undefined、文本
    let childFlags = null;
    if(Array.isArray(children)) {
        // eq: h('div', null, [h('span'), h('p')])
        const length = children.length;
        if(length === 0) {
            // 没有 children
            childFlags = ChildrenFlags.NO_CHILDREN;
        } else if(length === 1) {
            // 单个子节点
            childFlags = ChildrenFlags.SINGLE_VNODE;
            children = children[0];
        } else {
            // 多个子节点
            childFlags = ChildrenFlags.KEYED_VNODES;
            children = normalizeVNodes(children);
        }
    } else if (children === null) {
        // 没有子节点
        childFlags = ChildrenFlags.NO_CHILDREN;
    } else if(children._isVNode) {
        // children是个对戏 并且是个VNode对象 单个子节点
        childFlags = ChildrenFlags.SINGLE_VNODE;
    } else {
        // 其他情况都作为文本节点处理，即单个子节点，会调用 createTextVNode 创建纯文本类型的 VNode
        childFlags = ChildrenFlags.SINGLE_VNODE;
        children = createTextVNode(children.toString());
    }
    return {
        _isVNode: true,
        tag,
        flags,
        data,
        children,
        childFlags,
        el: null,
    }
}

function normalizeVNodes(children) {
    let res = [];
    for(let i = 0; i < children.length; i++) {
        const child = children[i];
        if(!child.key) {
            child.key = '|' + i;
        }
        res.push(child);
    }
    return res;
}

function createTextVNode(text) {
    return {
        _isVNode: true,
        flag: VNodeFlags.TEXT,
        tag: null,
        data: null,
        // 纯文本类型的 VNode，其 children 属性存储的是与之相符的文本内容
        children: text,
        childrenFlags: ChildrenFlags.NO_CHILDREN,
        el: null
    }
}
