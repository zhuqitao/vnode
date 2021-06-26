import {h} from './h';
import {render} from './render'
// import { Component } from './component.js';

export const main = () => {
    const elementVNode = h(
        'div', 
        {
            style: {
                background: 'red',
                width: '100px',
                height: '100px'
            }
        },
        [
            // h('div', {style: {background: 'blue', width: '50px', height: '50px'}}),
            // h('div', {style: {background: '#000', width: '50px', height: '50px'}})
            h('input', {
                type: 'checkbox',
                checked: false,
                custom: false
            })
        ]
    );
    const arr = [h('span'), h('span')];
    console.log('elementVNode', arr)
    render(elementVNode, document.getElementById('app1'));
    // console.log(elementVNode);
}
