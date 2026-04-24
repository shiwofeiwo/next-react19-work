import { createRoot } from 'react-dom/client';
import React, { type JSXElementConstructor } from 'react';
import { flushSync } from 'react-dom';
import Overlay from '../overlay';
import ConfigProvider from '../config-provider';
import { guid } from '../util';
import Message from './message';
import type { OpenProps, MessageQuickProps } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = any;
type ConfigMask = InstanceType<typeof NewMask>;

const { config } = ConfigProvider;

let instance: { destroy: () => void; component: ConfigMask | null } | null;
const timeouts: Record<string, ReturnType<typeof setTimeout>> = {};

interface MaskProps {
    prefix?: string;
    type?: 'success' | 'warning' | 'error' | 'notice' | 'help' | 'loading';
    title?: React.ReactNode;
    content?: React.ReactNode;
    align?: string;
    offset?: number[];
    hasMask?: boolean;
    afterClose?(...args: unknown[]): unknown;
    animation?: boolean | { in: string; out: string };
    overlayProps?: object;
    onClose?(...args: unknown[]): unknown;
    timeoutId?: string;
    style?: object;
    className?: string;
}

class Mask extends React.Component<MaskProps> {
    static defaultProps = {
        prefix: 'next-',
        align: 'tc tc',
        offset: [0, 30],
        hasMask: false,
        animation: {
            in: 'pulse',
            out: 'zoomOut',
        },
        style: {},
        className: '',
    };

    state = {
        visible: true,
    };

    componentWillUnmount() {
        const { timeoutId } = this.props;

        if (timeoutId! in timeouts) {
            const timeout = timeouts[timeoutId!];
            clearTimeout(timeout);
            delete timeouts[timeoutId!];
        }
    }

    handleClose = (silent = false) => {
        this.setState({
            visible: false,
        });

        if (!silent) {
            this.props.onClose && this.props.onClose();
        }
    };

    render() {
        const {
            prefix,
            type,
            title,
            content,
            align,
            offset,
            hasMask,
            afterClose,
            animation,
            overlayProps,
            timeoutId,
            className,
            style,
            ...others
        } = this.props;
        const { visible } = this.state;
        return (
            <Overlay
                {...overlayProps}
                prefix={prefix}
                animation={animation}
                visible={visible}
                align={align as string}
                offset={offset}
                hasMask={hasMask}
                afterClose={afterClose}
            >
                <Message
                    {...others}
                    prefix={prefix}
                    visible
                    type={type}
                    shape="toast"
                    title={title}
                    style={style}
                    className={`${prefix}message-wrapper ${className}`}
                    onClose={this.handleClose}
                >
                    {content}
                </Message>
            </Overlay>
        );
    }
}

const NewMask = config(Mask);

const create = (props: MessageQuickProps) => {
    const { duration, afterClose, contextConfig, ...others } = props;
    const div = document.createElement('div');
    document.body.appendChild(div);

    let newContext = contextConfig;
    if (!newContext) newContext = ConfigProvider.getContext();
    let mask: ConfigMask | null = null,
        myRef: ConfigMask,
        destroyed = false;

    // 在同一个 container 上只能创建一次 root，复用于 render 和 unmount；
    // 否则 React 19 会警告「多个 root 挂到同一 container」且旧 root 的 cleanup 不触发，导致 Message unmount 失败。
    const root = createRoot(div);

    let cleaned = false;
    const cleanupContainer = () => {
        if (cleaned) return;
        cleaned = true;
        root.unmount();
        if (div.parentNode) {
            div.parentNode.removeChild(div);
        }
    };

    const closeChain = function () {
        cleanupContainer();
        afterClose && afterClose();
    };

    const destroy = () => {
        if (destroyed) return;
        destroyed = true;
        // 触发 Overlay 关闭动画（通过 Mask.handleClose → setState visible:false）；
        // 动画结束后 Overlay 的 afterClose 会调 closeChain → cleanupContainer。
        const inc = mask && mask.getInstance();
        inc && inc.handleClose(true);
        // 同步兜底：对于快速连续 show/hide（如测试场景），动画完成前 close 就返回，
        // 若上一次 destroy 还未触发 closeChain 就有新 show，会在 DOM 中累积多个容器。
        // 这里用 microtask 兜底：一个 tick 后若 closeChain 仍未跑，强制 cleanup
        // （损失一次关闭动画的平滑度，换取多次快速 show/hide 的 DOM 无累积）
        Promise.resolve().then(() => {
            if (!cleaned) {
                cleanupContainer();
                afterClose && afterClose();
            }
        });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AnyNewMask = NewMask as any;

    // React 19 createRoot().render() 是异步调度（concurrent by default）。
    // 命令式 API Message.show(...) 期望调用后 DOM 已可见（测试场景尤其依赖这点），
    // 用 flushSync 包装强制同步 commit + 内部 setState 全部 flush，
    // 避免 Gateway 的 2-phase render（首次 containerNode=null 返回 null，DidMount 后 setState 触发第二次 render 才 createPortal）
    // 在 Cypress retry window 内未完成导致 .next-overlay-wrapper 找不到。
    flushSync(() => {
        root.render(
            <ConfigProvider {...newContext}>
                <AnyNewMask
                    afterClose={closeChain}
                    {...others}
                    ref={(ref: any) => {
                        myRef = ref;
                    }}
                />
            </ConfigProvider>
        );
    });

    return {
        component: mask,
        destroy,
    };
};

function isObject(obj: unknown) {
    return {}.toString.call(obj) === '[object Object]';
}

function handleConfig(config: OpenProps, type?: MessageQuickProps['type']) {
    let newConfig: MessageQuickProps = {};

    if (typeof config === 'string' || React.isValidElement(config)) {
        newConfig.title = config;
    } else if (isObject(config)) {
        newConfig = { ...config } as MessageQuickProps;
    }
    if (typeof newConfig.duration !== 'number') {
        newConfig.duration = 3000;
    }
    if (type) {
        newConfig.type = type;
    }

    return newConfig;
}

function close() {
    if (instance) {
        instance.destroy();
        instance = null;
    }
}

function open(config: OpenProps, type?: MessageQuickProps['type']) {
    close();
    config = handleConfig(config, type);
    const timeoutId = guid();
    instance = create({ ...config, timeoutId });

    if (config.duration! > 0) {
        const timeout = setTimeout(close, config.duration);
        timeouts[timeoutId] = timeout;
    }
}

/**
 * 创建提示弹层
 * @param config - 属性对象
 */
function show(config: OpenProps) {
    open(config);
}

/**
 * 关闭提示弹层
 */
function hide() {
    close();
}

/**
 * 创建成功提示弹层
 * @param config - 属性对象
 */
function success(config: OpenProps) {
    open(config, 'success');
}

/**
 * 创建警告提示弹层
 * @param config - 属性对象
 */
function warning(config: OpenProps) {
    open(config, 'warning');
}

/**
 * 创建错误提示弹层
 * @param config - 属性对象
 */
function error(config: OpenProps) {
    open(config, 'error');
}

/**
 * 创建帮助提示弹层
 * @param config - 属性对象
 */
function help(config: OpenProps) {
    open(config, 'help');
}

/**
 * 创建加载中提示弹层
 * @param config - 属性对象
 */
function loading(config: OpenProps) {
    open(config, 'loading');
}

/**
 * 创建通知提示弹层
 * @param config - 属性对象
 */
function notice(config: OpenProps) {
    open(config, 'notice');
}

export default {
    show,
    hide,
    success,
    warning,
    error,
    help,
    loading,
    notice,
};

export interface ContextMessage {
    show: (config?: MessageQuickProps) => void;
    hide: () => void;
    confirm: (config?: MessageQuickProps) => void;
    success: (config?: MessageQuickProps) => void;
    warning: (config?: MessageQuickProps) => void;
    error: (config?: MessageQuickProps) => void;
    help: (config?: MessageQuickProps) => void;
    loading: (config?: MessageQuickProps) => void;
    notice: (config?: MessageQuickProps) => void;
}
export interface WithContextMessageProps {
    contextMessage: ContextMessage;
}

export const withContext = <P extends WithContextMessageProps, C>(
    WrappedComponent: JSXElementConstructor<P> & C
) => {
    type Props = React.JSX.LibraryManagedAttributes<C, Omit<P, 'contextMessage'>>;
    const HOC = (props: Props) => {
        return (
            <ConfigProvider.Consumer>
                {contextConfig => (
                    <WrappedComponent
                        // why AnyProps? see: https://react-typescript-cheatsheet.netlify.app/docs/hoc/react_hoc_docs
                        {...(props as AnyProps)}
                        contextMessage={{
                            show: (config = {}) => show({ ...config, contextConfig }),
                            hide,
                            success: (config = {}) => success({ ...config, contextConfig }),
                            warning: (config = {}) => warning({ ...config, contextConfig }),
                            error: (config = {}) => error({ ...config, contextConfig }),
                            help: (config = {}) => help({ ...config, contextConfig }),
                            loading: (config = {}) => loading({ ...config, contextConfig }),
                            notice: (config = {}) => notice({ ...config, contextConfig }),
                        }}
                    />
                )}
            </ConfigProvider.Consumer>
        );
    };
    return HOC;
};
