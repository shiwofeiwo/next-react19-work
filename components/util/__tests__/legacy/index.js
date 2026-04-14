import { createRoot } from "react-dom/client";
/* eslint-disable react/no-deprecated */
import React from 'react';
import ReactDOM from 'react-dom';

const delay = time => new Promise(resolve => setTimeout(resolve, time));

const render = element => {
    let inc;
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(element);
    return {
        setProps: props => {
            const clonedElement = React.cloneElement(element, props);
            const root = createRoot(container);
            root.render(clonedElement);
        },
        unmount: () => {
            const root = createRoot(container);
            root.unmount();
            document.body.removeChild(container);
        },
        instance: () => {
            return inc;
        },
        find: selector => {
            return container.querySelectorAll(selector);
        },
    };
};
export default {
    delay,
    render,
};
