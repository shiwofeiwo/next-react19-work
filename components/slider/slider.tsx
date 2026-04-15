import React, { Component } from 'react';
import classNames from 'classnames';
import { obj } from '../util';
import InnerSlider, { type ThisType as InnerSliderType } from './slick/inner-slider';
import ConfigProvider from '../config-provider';
import type { SliderProps } from './types';

// ConfigProvider prop keys for runtime iteration
const CONFIG_PROVIDER_PROP_KEYS = [
    'prefix',
    'locale',
    'defaultPropsConfig',
    'errorBoundary',
    'pure',
    'warning',
    'rtl',
    'device',
    'children',
    'popupContainer',
];

const SLIDER_PROP_KEYS = [
    'prefix',
    'rtl',
    'className',
    'adaptiveHeight',
    'animation',
    'arrows',
    'arrowSize',
    'arrowPosition',
    'arrowDirection',
    'autoplay',
    'autoplaySpeed',
    'nextArrow',
    'prevArrow',
    'centerMode',
    'dots',
    'dotsDirection',
    'dotsClass',
    'dotsRender',
    'draggable',
    'infinite',
    'defaultActiveIndex',
    'lazyLoad',
    'slide',
    'slideDirection',
    'slidesToShow',
    'slidesToScroll',
    'speed',
    'activeIndex',
    'triggerType',
    'onChange',
    'onBeforeChange',
    'children',
    'style',
    'centerPadding',
    'cssEase',
    'edgeFriction',
    'focusOnSelect',
    'pauseOnHover',
    'swipe',
    'swipeToSlide',
    'touchMove',
    'touchThreshold',
    'useCSS',
    'variableWidth',
    'waitForAnimate',
    'edgeEvent',
    'swipeEvent',
];

const INNER_SLIDER_PROP_KEYS = [
    'prefix',
    'animation',
    'arrows',
    'arrowSize',
    'arrowPosition',
    'arrowDirection',
    'centerPadding',
    'children',
    'centerMode',
    'dots',
    'dotsDirection',
    'dotsClass',
    'focusOnSelect',
    'cssEase',
    'speed',
    'infinite',
    'defaultActiveIndex',
    'rtl',
    'slidesToShow',
    'lazyLoad',
    'activeIndex',
    'slidesToScroll',
    'variableWidth',
    'vertical',
    'verticalSwiping',
    'prevArrow',
    'nextArrow',
    'dotsRender',
    'triggerType',
];

type CommonKeys = keyof SliderProps & (typeof CONFIG_PROVIDER_PROP_KEYS)[number];
type ObjWithCommonProps = Pick<SliderProps, CommonKeys>;

/**
 * Slider
 */
export default class Slider extends Component<SliderProps> {
    static displayName = 'Slider';
    static defaultProps = {
        prefix: 'next-',
        animation: 'slide',
        arrowSize: 'medium',
        arrowPosition: 'inner',
        vertical: false,
        verticalSwiping: false,
        dots: true,
        dotsDirection: 'hoz',
        arrows: true,
        arrowDirection: 'hoz',
        infinite: true,
        autoplay: false,
        autoplaySpeed: 3000,
        speed: 600,
        adaptiveHeight: false,
        centerMode: false,
        centerPadding: '50px', // Side padding when in center mode (px or %); 展示部分为 center，pading 会产生前后预览
        cssEase: 'ease',
        draggable: true,
        edgeFriction: 0.35,
        focusOnSelect: false,
        defaultActiveIndex: 0,
        lazyLoad: false,
        pauseOnHover: false,
        rtl: false,
        slide: 'div',
        slideDirection: 'hoz',
        slidesToShow: 1,
        slidesToScroll: 1,
        swipe: true,
        swipeToSlide: false, // Allow users to drag or swipe directly to a slide irrespective of slidesToScroll
        touchMove: true, // 移动端 touch
        touchThreshold: 5,
        useCSS: true,
        variableWidth: false,
        waitForAnimate: true,
        onChange: () => {},
        onBeforeChange: () => {},
        edgeEvent: null,
        swipeEvent: null,
        nextArrow: null, // nextArrow, prevArrow are react components
        prevArrow: null,
        style: null,
        dotsRender: null,
        triggerType: 'click',
    };

    innerSlider: InnerSliderType | null;

    resize = () => {
        // export api
        this.innerSlider?.onWindowResized();
    };

    render() {
        const { prefix, arrowPosition, slideDirection, style, className, children } = this.props;

        const globalProps: ObjWithCommonProps = {};
        CONFIG_PROVIDER_PROP_KEYS.forEach(key => {
            // @ts-expect-error 类型错误
            globalProps[key as CommonKeys] = this.props[key as keyof SliderProps];
        });

        const sliderProps = obj.pickOthers(['className', 'style', 'slideDirection'], this.props);
        const slideCount = React.Children.count(children);

        if (slideCount === 0) {
            // 没有 item 时不显示 slider
            return null;
        } else if (slideCount === 1) {
            // 单个 item 时不显示箭头和控制器
            sliderProps.arrows = false;
            sliderProps.autoplay = false;
            sliderProps.draggable = false;
        }

        const clazz = classNames(
            [
                `${prefix}slick`,
                `${prefix}slick-${arrowPosition}`,
                `${prefix}slick-${slideDirection}`,
            ],
            className
        );

        if (slideDirection === 'ver') {
            // 向下传递时使用 vertical 属性
            sliderProps.vertical = true;
            sliderProps.verticalSwiping = true;
        }

        return (
            <ConfigProvider {...globalProps} rtl={false}>
                <div
                    dir="ltr"
                    className={clazz}
                    style={style}
                    {...obj.pickOthers(
                        [...SLIDER_PROP_KEYS, ...INNER_SLIDER_PROP_KEYS],
                        sliderProps
                    )}
                >
                    <InnerSlider
                        ref={(InnerSlider: InnerSliderType | null) => {
                            this.innerSlider = InnerSlider;
                        }}
                        {...sliderProps}
                    />
                </div>
            </ConfigProvider>
        );
    }
}
