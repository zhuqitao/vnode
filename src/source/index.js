import {h, Fragment, Portal} from './h';
import {render} from './render'
// import { Component } from './component.js';

export const main = () => {
    // const elementVNode = h(
    //     'div', 
    //     {
    //         style: {
    //             background: 'red',
    //             width: '100px',
    //             height: '100px'
    //         }
    //     },
    //     // [
    //         h(
    //             Fragment, 
    //             null,
    //             [
    //                 h('div', null, '827163'),
    //                 h('div', null, '62a73b')
    //             ]
    //         ),
    //         // {style: {background: '#827163'}}
    //         // h('div', {style: {background: '#000', width: '50px', height: '50px'}})
    //         // h('input', {
    //         //     type: 'checkbox',
    //         //     checked: false,
    //         //     custom: false
    //         // })
    //     // ]
    // );
    const elementVNode = h(
        'div',
        {
          style: {
            height: '100px',
            width: '100px',
            background: 'red'
          }
        },
        h(Portal, {
            target: '#app2'
        }, [
          h('span', null, '我是标题1......'),
          h('span', null, '我是标题2......')
        ])
      )
    // const arr = [h('span'), h('span')];
    console.log('elementVNode', elementVNode)
    render(elementVNode, document.getElementById('app1'));
    // console.log(elementVNode);
}
