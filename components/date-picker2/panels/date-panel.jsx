import React from 'react';
import classnames from 'classnames';



import { func, obj, datejs } from '../../util';
import { setTime } from '../util';

import Calendar from '../../calendar2';
import TimePanel from './time-panel';

const CALENDAR_PROP_KEYS = [
    'rtl', 'name', 'prefix', 'locale', 'shape', 'mode', 'value', 'defaultValue', 'panelValue',
    'defaultPanelValue', 'disabledDate', 'dateCellRender', 'quarterCellRender', 'monthCellRender',
    'yearCellRender', 'headerRender', 'onChange', 'onSelect', 'onPanelChange', 'cellProps',
    'cellClassName', 'panelMode', 'onPrev', 'onNext', 'onSuperPrev', 'onSuperNext', 'colNum',
];

const TIME_PANEL_PROP_KEYS = [
    'rtl', 'prefix', 'locale', 'value', 'timePanelProps', 'onSelect',
];

class DatePanel extends React.Component {    static defaultProps = {
        showTime: false,
        resetTime: false,
    };

    constructor(props) {
        super(props);

        // 默认时间
        const { timePanelProps = {} } = props;
        let defaultTime = timePanelProps.defaultValue;

        if (defaultTime) {
            // fix: https://github.com/alibaba-fusion/next/issues/3203
            defaultTime = datejs(
                defaultTime,
                typeof defaultTime === 'string' ? timePanelProps.format || 'HH:mm:ss' : undefined
            );
        }

        this.state = {
            defaultTime,
        };
    }

    onTimeSelect = v => {
        this.handleSelect(v, true);
    };

    handleSelect = (v, fromTimeChange) => {
        const { defaultTime } = this.state;

        let timeVal = null;

        if (!this.props.resetTime && !fromTimeChange) {
            timeVal = this.props.value || defaultTime || datejs();
        }

        v = setTime(v, timeVal);

        func.invoke(this.props, 'onSelect', [v]);
    };

    handlePanelChange = (v, mode) => {
        func.invoke(this.props, 'onPanelChange', [v, mode]);
    };

    render() {
        const {
            mode,
            panelMode,
            prefix,
            showTime,
            value,
            disabledDate,
            disabledTime,
            timePanelProps,
            dateCellRender,
            ...restProps
        } = this.props;

        const className = classnames(`${prefix}date-picker2-panel`, {
            [`${prefix}date-time-picker2-panel`]: showTime,
        });

        // 禁用时间
        let _disabledTime;
        if (showTime && mode === panelMode && disabledTime) {
            _disabledTime = typeof disabledTime === 'function' ? disabledTime(value) : disabledTime;
            if (typeof _disabledTime !== 'object') {
                _disabledTime = null;
            }
        }

        return (
            <div className={className}>
                <Calendar
                    {...obj.pickProps(CALENDAR_PROP_KEYS, restProps)}
                    shape="panel"
                    value={value}
                    panelMode={mode}
                    colNum={showTime ? 6 : undefined}
                    onSelect={this.handleSelect}
                    onPanelChange={this.handlePanelChange}
                    disabledDate={disabledDate}
                    dateCellRender={dateCellRender}
                />
                {showTime && mode === panelMode ? (
                    <TimePanel
                        {...obj.pickProps(TIME_PANEL_PROP_KEYS, restProps)}
                        prefix={prefix}
                        value={value || this.state.defaultTime}
                        onSelect={this.onTimeSelect}
                        disabledTime={disabledTime}
                        timePanelProps={{ ..._disabledTime, ...timePanelProps }}
                    />
                ) : null}
            </div>
        );
    }
}

export default DatePanel;
