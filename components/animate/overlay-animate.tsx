import React from 'react';
import { Transition, type TransitionStatus } from 'react-transition-group';
import classNames from 'classnames';
import type { OverlayAnimateProps } from './types';

const OverlayAnimate = React.forwardRef<HTMLElement, OverlayAnimateProps>((props, externalRef) => {
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

    // Keep the latest children ref accessible without adding children to useCallback deps.
    // This avoids repeated ref teardown/reattach caused by the children object changing identity.
    const childrenRefHolder = React.useRef<
        | ((node: HTMLElement | null) => void)
        | React.RefObject<HTMLElement | null>
        | null
        | undefined
    >(null);
    childrenRefHolder.current = ((children as React.ReactElement).props as Record<string, unknown>)
        ?.ref as
        | ((node: HTMLElement | null) => void)
        | React.RefObject<HTMLElement | null>
        | null
        | undefined;

    const handleRef = React.useCallback(
        (node: HTMLElement) => {
            nodeRef.current = node;
            // Preserve original ref on children so external consumers (e.g. @alifd/overlay's
            // maskRef) still receive the DOM node even after cloneElement overrides the ref.
            const childRef = childrenRefHolder.current;
            if (typeof childRef === 'function') {
                childRef(node);
            } else if (childRef !== null && typeof childRef === 'object') {
                (childRef as React.RefObject<HTMLElement | null>).current = node;
            }
            if (typeof externalRef === 'function') {
                externalRef(node);
            } else if (externalRef) {
                (externalRef as React.RefObject<HTMLElement | null>).current = node;
            }
        },
        [externalRef]
    );

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
                    ref: handleRef,
                };

                if (style && children.props && children.props.style) {
                    childProps.style = Object.assign({}, children.props.style, style);
                }

                return React.cloneElement(children, childProps);
            }}
        </Transition>
    );
});

OverlayAnimate.displayName = 'OverlayAnimate';

export default OverlayAnimate;
