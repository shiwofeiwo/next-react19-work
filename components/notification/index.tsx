import { createRoot } from 'react-dom/client';
import React, { Component } from 'react';
import { flushSync } from 'react-dom';
import ConfigProvider from '../config-provider';
import Animate from '../animate';
import Message from '../message';
import uuid from '../util/guid';
import config from './config';

import type {
    NotificationConfig,
    NotificationOptions,
    Notification as INotification,
} from './types';

const getAnimation = (placement: string) => {
    switch (placement) {
        case 'tl':
        case 'bl':
            return 'slideInLeft';
        case 'tr':
        case 'br':
            return 'slideInRight';
        default:
            return undefined;
    }
};

interface NotificationProps {
    prefix?: string;
}

interface NotificationState {
    notifications: NotificationOptions[];
}

// let instance: Notification;
let instance: InstanceType<typeof ConfigedNotification> | null;
let mountContainer: HTMLDivElement | null = null;
// 缓存 createRoot 结果，destroy 时复用同一 root 调 unmount —— 避免 React 19
// "多个 root 挂到同一 container" 警告 + 旧 root cleanup 不触发导致 instance 无法清理
let mountRoot: ReturnType<typeof createRoot> | null = null;
let mounting = false;
let waitOpens: NotificationOptions[] = [];
function close(key: string) {
    if (!instance) {
        const index = waitOpens.findIndex(item => item.key === key);
        waitOpens.splice(index, 1);
        return;
    }

    instance.close(key);
}

interface NotificationProps {
    prefix?: string;
}

class Notification extends Component<NotificationProps, NotificationState> {
    static defaultProps = {
        prefix: 'next-',
    };
    timers: number[];

    constructor(props: NotificationProps) {
        super(props);
        this.state = {
            notifications: [],
        };
        this.timers = [];
    }

    componentWillUnmount() {
        this.timers.forEach(timer => {
            if (!timer) return;
            clearTimeout(timer);
        });
    }

    close = (key: string) => {
        const { notifications } = this.state;
        const index = notifications.findIndex(notification => notification.key === key);

        if (index === -1) return;
        const { onClose, timer } = notifications[index];

        notifications.splice(index, 1);

        const timerIndex = this.timers.findIndex(v => v === timer);

        if (timerIndex !== -1) {
            this.timers.splice(timerIndex, 1);
        }

        if (timer) {
            clearTimeout(timer);
        }

        this.setState({
            notifications,
        });

        if (onClose) {
            onClose();
        }
    };

    open = ({ key, duration, ...others }: NotificationOptions) => {
        const notifications = [...this.state.notifications];
        if (!key) {
            key = uuid('notification-');
        }

        const index = notifications.findIndex(notification => notification.key === key);

        if (index !== -1) {
            notifications[index] = {
                ...notifications[index],
                ...others,
            };
        } else {
            let timer;

            if (duration && duration > 0) {
                timer = window.setTimeout(() => {
                    this.close(key!);
                }, duration);
                this.timers.push(timer);
            }
            notifications.push({
                ...others,
                key,
                timer,
            });
        }

        if (config.maxCount > 0 && config.maxCount < notifications.length) {
            while (notifications.length > config.maxCount) {
                const { key } = notifications[0];
                this.close(key!);
                notifications.splice(0, 1);
            }
        }

        this.setState({
            notifications,
        });

        return key;
    };

    render() {
        const { prefix } = this.props;
        const { notifications } = this.state;

        return (
            <div
                className={`${prefix}notification`}
                style={{
                    [config.placement.indexOf('b') === 0 ? 'bottom' : 'top']: config.offset[1],
                    [config.placement.indexOf('l') !== -1 ? 'left' : 'right']: config.offset[0],
                }}
            >
                <Animate
                    animationAppear
                    animation={{
                        enter: getAnimation(config.placement),
                        leave: `${prefix}notification-fade-leave`,
                    }}
                    singleMode={false}
                >
                    {notifications.map(
                        ({ key, type, title, content, icon, onClick, style, className }) => (
                            <Message
                                key={key}
                                shape="toast"
                                type={type}
                                title={title}
                                iconType={icon}
                                closeable
                                animation={false}
                                size={(config as NotificationConfig).size}
                                visible
                                style={style}
                                className={className}
                                onClick={onClick}
                                onClose={() => close(key!)}
                            >
                                {content}
                            </Message>
                        )
                    )}
                </Animate>
            </div>
        );
    }
}

const ConfigedNotification = ConfigProvider.config(Notification, {
    exportNames: ['open', 'close'],
});

function open(options: NotificationOptions = {}) {
    if (!options.title && !options.content) return;

    const duration =
        !options.duration && options.duration !== 0 ? config.duration : options.duration;

    if (!instance) {
        if (!options.key) {
            options.key = uuid('notification-');
        }

        waitOpens.push({
            ...options,
            duration,
        });

        if (!mounting) {
            mounting = true;
            const div = document.createElement('div');
            mountContainer = div;
            if (config.getContainer) {
                const root = config.getContainer();
                root.appendChild(div);
            } else {
                document.body.appendChild(div);
            }

            mountRoot = createRoot(div);

            // React 19 createRoot().render() 是异步调度（concurrent by default）。
            // 命令式 API Notification.open(...) 期望调用后立即完成 mount（测试场景尤其依赖这点），
            // 用 flushSync 强制同步 commit，避免测试在 React 完成 render 前就断言 DOM。
            // 和 components/message/toast.tsx 的 flushSync 是同一 pattern。
            flushSync(() => {
                mountRoot!.render(
                    <ConfigProvider {...ConfigProvider.getContext()}>
                        <ConfigedNotification
                            ref={ref => {
                                instance = ref;
                            }}
                        />
                    </ConfigProvider>
                );
            });

            // flushSync 结束后 instance 已经通过 ref 回调赋值。
            // 消费在 mount 期间积压的 waitOpens（原逻辑 push 后从不消费 —— bug）。
            if (instance) {
                const pending = waitOpens.slice();
                waitOpens = [];
                pending.forEach(opt => instance!.open(opt));
            }
        }

        return options.key;
    }

    const key = instance.open({
        ...options,
        duration,
    });

    return key;
}

function destroy() {
    if (!instance) return;
    const mountNode = mountContainer;
    if (mountNode) {
        // 复用 open() 里缓存的 root 调 unmount；不再 createRoot(mountNode) 二次创建
        // （React 19 下会警告「多个 root 挂到同一 container」且不触发原 root cleanup）
        if (mountRoot) {
            mountRoot.unmount();
            mountRoot = null;
        }
        mountNode.parentNode?.removeChild(mountNode);
        mountContainer = null;
    }
    instance = null;
    mounting = false;
    waitOpens = [];
}

interface objectAny {
    [key: string]: () => string | undefined;
}
const levels: objectAny = {};

['success', 'error', 'warning', 'notice', 'help'].forEach(type => {
    levels[type] = (options = {}) => {
        return open({
            ...options,
            type: type as NotificationOptions['type'],
        });
    };
});

export default {
    config(...args) {
        return Object.assign(config, ...args);
    },
    open,
    close,
    destroy,
    ...levels,
} as INotification;

export type { NotificationConfig, NotificationOptions };
