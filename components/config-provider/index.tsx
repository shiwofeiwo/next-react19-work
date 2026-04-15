import React, { Component, Children, type ReactNode } from 'react';
import getContextProps from './get-context-props';
import {
    config,
    initLocales,
    setLanguage,
    setLocale,
    setDirection,
    getLocale,
    getLanguage,
    getDirection,
} from './config';
import Consumer from './consumer';
import ErrorBoundary from './error-boundary';
import Cache from './cache';
import datejs from '../util/date';
import { obj } from '../util';
import ConfigContext from './context';
import type {
    ConfigProviderProps,
    ComponentCommonProps,
    ContextState,
    PropsDeprecatedPrinter,
} from './types';

const childContextCache = new Cache();

const setMomentLocale = async (locale?: { momentLocale?: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let moment: any;
    try {
        moment = await import('moment');
        if (moment && moment.default && moment.default.isMoment) moment = moment.default;
    } catch (e) {
        // ignore
    }

    if (moment && moment.locale && locale) {
        moment.locale(locale.momentLocale);
    }
};

const setDateLocale = (locale?: { dateLocale?: string; momentLocale?: string }) => {
    if (locale) {
        datejs.locale(locale.dateLocale || locale.momentLocale);
    }
};

class ConfigProvider extends Component<ConfigProviderProps, Pick<ConfigProviderProps, 'locale'>> {
    static contextType = ConfigContext;
    declare context: ContextState;
    static defaultProps = {
        warning: true,
        errorBoundary: false,
    };

    /**
     * 传入组件，生成受 ConfigProvider 控制的 HOC 组件
     * @param Component - 组件类
     * @param options - 可选项
     * @returns 被 HOC 后的组件
     */
    static config = config;

    static initLocales = initLocales;
    static setLanguage = setLanguage;
    static setLocale = setLocale;
    static setDirection = setDirection;
    static getLanguage = getLanguage;
    static getLocale = getLocale;
    static getDirection = getDirection;
    static Consumer = Consumer;
    static ErrorBoundary = ErrorBoundary;

    /**
     * 传入组件的 props 和 displayName，得到和 childContext 计算过的包含有 preifx/locale/pure 的对象，一般用于通过静态方法生成脱离组件树的组件
     * @param props - 组件的 props
     * @param displayName - 组件的 displayName
     * @returns 新的 context props
     */
    static getContextProps = <P extends ComponentCommonProps>(props: P, displayName?: string) => {
        return getContextProps(props, childContextCache.root() || {}, displayName);
    };

    static clearCache = () => {
        childContextCache.clear();
    };

    static getContext = () => {
        const {
            nextPrefix,
            nextLocale,
            nextDefaultPropsConfig,
            nextPure,
            nextRtl,
            nextWarning,
            nextDevice,
            nextPopupContainer,
            nextErrorBoundary,
        } = (childContextCache.root() as ContextState) || {};

        return {
            prefix: nextPrefix,
            locale: nextLocale,
            defaultPropsConfig: nextDefaultPropsConfig,
            pure: nextPure,
            rtl: nextRtl,
            warning: nextWarning,
            device: nextDevice,
            popupContainer: nextPopupContainer,
            errorBoundary: nextErrorBoundary,
        };
    };

    constructor(props: ConfigProviderProps, context: ContextState) {
        super(props, context);
        childContextCache.add(
            this,
            Object.assign({}, childContextCache.get(this, {}), this._getMergedContext())
        );

        setMomentLocale(this.props.locale);
        setDateLocale(this.props.locale);

        this.state = {
            locale: this.props.locale,
        };
    }

    private _lastMergedContext: ContextState | null = null;

    private _getMergedContext(): ContextState {
        const {
            prefix,
            locale,
            defaultPropsConfig,
            pure,
            warning,
            rtl,
            device,
            popupContainer,
            errorBoundary,
        } = this.props;

        const {
            nextPrefix,
            nextDefaultPropsConfig,
            nextLocale,
            nextPure,
            nextRtl,
            nextWarning,
            nextDevice,
            nextPopupContainer,
            nextErrorBoundary,
        } = this.context;

        const newContext: ContextState = {
            nextPrefix: prefix || nextPrefix,
            nextDefaultPropsConfig: defaultPropsConfig || nextDefaultPropsConfig,
            nextLocale: locale || nextLocale,
            nextPure: typeof pure === 'boolean' ? pure : nextPure,
            nextRtl: typeof rtl === 'boolean' ? rtl : nextRtl,
            nextWarning: typeof warning === 'boolean' ? warning : nextWarning,
            nextDevice: device || nextDevice,
            nextPopupContainer: popupContainer || nextPopupContainer,
            nextErrorBoundary: errorBoundary || nextErrorBoundary,
        };

        if (this._lastMergedContext && obj.shallowEqual(this._lastMergedContext, newContext)) {
            return this._lastMergedContext;
        }

        this._lastMergedContext = newContext;
        return newContext;
    }

    static getDerivedStateFromProps(
        nextProps: ConfigProviderProps,
        prevState: Pick<ConfigProviderProps, 'locale'>
    ) {
        if (nextProps.locale !== prevState.locale) {
            setMomentLocale(nextProps.locale);
            setDateLocale(nextProps.locale);

            return {
                locale: nextProps.locale,
            };
        }

        return null;
    }

    componentDidUpdate() {
        childContextCache.add(
            this,
            Object.assign({}, childContextCache.get(this, {}), this._getMergedContext())
        );
    }

    componentWillUnmount() {
        childContextCache.remove(this);
    }

    render(): ReactNode {
        return (
            <ConfigContext.Provider value={this._getMergedContext()}>
                {Children.only(this.props.children)}
            </ConfigContext.Provider>
        );
    }
}

export type { ConfigProviderProps, PropsDeprecatedPrinter };

export default ConfigProvider;
