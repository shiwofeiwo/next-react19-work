import React from 'react';
import { Transition, type TransitionStatus } from 'react-transition-group';
import classNames from 'classnames';
import type { OverlayAnimateProps } from './types';

const OverlayAnimate = (props: OverlayAnimateProps) => {
    const {
        animation,
        visible,
        children,
        timeout = 300,
        style,

        mountOnEnter,
        unmountOnExit,
        appear,
        enter,
        exit,
        onEnter,
        onEntering,
        onEntered,
        onExit,
        onExiting,
        onExited,

        ...others
    } = props;

    const nodeRef = React.useRef<HTMLElement>(null);

    // Wrap callbacks to inject nodeRef.current as first argument,
    // keeping the public API signature (node, ...) unchanged.
    // Null guard added to handle unmount-before-callback scenarios.
    const wrappedOnEnter = onEnter
        ? (isAppearing: boolean) => {
              const node = nodeRef.current;
              if (node) onEnter(node, isAppearing);
          }
        : undefined;
    const wrappedOnEntering = onEntering
        ? (isAppearing: boolean) => {
              const node = nodeRef.current;
              if (node) onEntering(node, isAppearing);
          }
        : undefined;
    const wrappedOnEntered = onEntered
        ? (isAppearing: boolean) => {
              const node = nodeRef.current;
              if (node) onEntered(node, isAppearing);
          }
        : undefined;
    const wrappedOnExit = onExit
        ? () => {
              const node = nodeRef.current;
              if (node) onExit(node);
          }
        : undefined;
    const wrappedOnExiting = onExiting
        ? () => {
              const node = nodeRef.current;
              if (node) onExiting(node);
          }
        : undefined;
    const wrappedOnExited = onExited
        ? () => {
              const node = nodeRef.current;
              if (node) onExited(node);
          }
        : undefined;

    const animateProps = {
        mountOnEnter,
        unmountOnExit,
        appear,
        enter,
        exit,
        onEnter: wrappedOnEnter,
        onEntering: wrappedOnEntering,
        onEntered: wrappedOnEntered,
        onExit: wrappedOnExit,
        onExiting: wrappedOnExiting,
        onExited: wrappedOnExited,
    };

    Object.keys(animateProps).forEach((k: keyof typeof animateProps) => {
        if (!(k in props) || typeof props[k] === 'undefined') {
            delete animateProps[k];
        }
    });

    const animationMap =
        typeof animation === 'string' ? { in: animation, out: animation } : animation;

    const animateClsMap: Partial<Record<TransitionStatus, string | undefined>> = animationMap
        ? {
              entering: animationMap.in,
              exiting: animationMap.out,
          }
        : {};

    if (animation === false) {
        animateClsMap.entering = '';
        animateClsMap.exiting = '';
    }

    return (
        <Transition
            {...animateProps}
            nodeRef={nodeRef as React.Ref<HTMLElement>}
            in={visible}
            timeout={animation ? timeout : 0}
            appear
        >
            {state => {
                const cls = classNames({
                    [children.props.className]: !!children.props.className,
                    [animateClsMap[state]!]: state in animateClsMap && animateClsMap[state],
                });

                const childProps: Record<string, unknown> = {
                    ...others,
                    className: cls,
                    ref: nodeRef,
                };

                if (style && children.props && children.props.style) {
                    childProps.style = Object.assign({}, children.props.style, style);
                }

                return React.cloneElement(children, childProps);
            }}
        </Transition>
    );
};

export default OverlayAnimate;
