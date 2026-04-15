import React, { Component } from 'react';
import classnames from 'classnames';
import moment from 'moment';
import nextLocale from '../locale/zh-cn';
import { func } from '../util';
import TimeMenu from './module/time-menu';
import { checkMomentObj } from './utils';
import type { TimePickerPanelProps } from './types';

const { noop } = func;

class TimePickerPanel extends Component<TimePickerPanelProps> {
    static defaultProps = {
        prefix: 'next-',
        showHour: true,
        showSecond: true,
        showMinute: true,
        disabledHours: noop,
        disabledMinutes: noop,
        disabledSeconds: noop,
        onSelect: noop,
        disabled: false,
        locale: nextLocale.TimePicker,
    };

    onSelectMenuItem = (index: number, type: 'hour' | 'minute' | 'second') => {
        const { value } = this.props;
        const clonedValue = value ? value.clone() : moment('00:00:00', 'HH:mm:ss', true);
        switch (type) {
            case 'hour':
                clonedValue.hour(index);
                break;
            case 'minute':
                clonedValue.minute(index);
                break;
            case 'second':
                clonedValue.second(index);
                break;
        }
        this.props.onSelect(clonedValue);
    };

    render() {
        const {
            prefix,
            value,
            locale,
            className,
            disabled,
            showHour,
            showMinute,
            showSecond,
            hourStep,
            minuteStep,
            secondStep,
            disabledHours,
            disabledMinutes,
            disabledSeconds,
            renderTimeMenuItems,
            ...others
        } = this.props;

        const colLen = [showHour, showMinute, showSecond].filter(v => v).length;
        const classNames = classnames(
            `${prefix}time-picker-panel`,
            `${prefix}time-picker-panel-col-${colLen}`,
            className
        );

        const commonProps = {
            prefix,
            disabled,
            onSelect: this.onSelectMenuItem,
            renderTimeMenuItems,
            value,
        };

        let activeHour;
        let activeMinute;
        let activeSecond;

        if (value && moment.isMoment(value)) {
            activeHour = value.hour();
            activeMinute = value.minute();
            activeSecond = value.second();
        }

        return (
            /* @ts-expect-error div 上不应该透传 onSelect */
            <div {...others} className={classNames}>
                {showHour ? (
                    <TimeMenu
                        {...commonProps}
                        activeIndex={activeHour}
                        title={locale!.hour}
                        mode="hour"
                        step={hourStep}
                        disabledItems={disabledHours}
                    />
                ) : null}
                {showMinute ? (
                    <TimeMenu
                        {...commonProps}
                        activeIndex={activeMinute}
                        title={locale!.minute}
                        mode="minute"
                        step={minuteStep}
                        disabledItems={disabledMinutes}
                    />
                ) : null}
                {showSecond ? (
                    <TimeMenu
                        {...commonProps}
                        activeIndex={activeSecond}
                        title={locale!.second}
                        step={secondStep}
                        mode="second"
                        disabledItems={disabledSeconds}
                    />
                ) : null}
            </div>
        );
    }
}

export default TimePickerPanel;
