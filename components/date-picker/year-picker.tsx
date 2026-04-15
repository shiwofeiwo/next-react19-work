import React, {
    Component,
    type HTMLAttributes,
    type KeyboardEvent,
    type SyntheticEvent,
} from 'react';
import classnames from 'classnames';
import moment, { type Moment } from 'moment';
import Overlay from '../overlay';
import Input from '../input';
import Icon from '../icon';
import Calendar from '../calendar';
import nextLocale from '../locale/zh-cn';
import { type ClassPropsWithDefault, func, obj } from '../util';
import { checkDateValue, formatDateValue, onDateKeydown } from './util';
import type { YearPickerProps, YearPickerState } from './types';

const { Popup } = Overlay;

type InnerYearPickerProps = ClassPropsWithDefault<YearPickerProps, typeof YearPicker.defaultProps>;

const YEAR_PICKER_PROP_KEYS = [
    // ConfigProvider keys
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
    // YearPicker-specific keys
    'label',
    'state',
    'placeholder',
    'defaultVisibleYear',
    'value',
    'defaultValue',
    'format',
    'disabledDate',
    'footerRender',
    'onChange',
    'size',
    'disabled',
    'hasClear',
    'visible',
    'defaultVisible',
    'onVisibleChange',
    'popupTriggerType',
    'popupAlign',
    'popupContainer',
    'popupStyle',
    'popupClassName',
    'popupProps',
    'followTrigger',
    'inputProps',
    'monthCellRender',
    'yearCellRender',
    'dateInputAriaLabel',
    'isPreview',
    'renderPreview',
    'className',
];

/**
 * DatePicker.YearPicker
 */
class YearPicker extends Component<YearPickerProps, YearPickerState> {
    static displayName = 'YearPicker';
    static defaultProps = {
        prefix: 'next-',
        rtl: false,
        format: 'YYYY',
        size: 'medium',
        disabledDate: () => false,
        footerRender: () => null,
        hasClear: true,
        popupTriggerType: 'click',
        popupAlign: 'tl tl',
        locale: nextLocale.DatePicker,
        onChange: func.noop,
        onVisibleChange: func.noop,
    };

    readonly props: InnerYearPickerProps;

    constructor(props: YearPickerProps) {
        super(props);

        this.state = {
            value: formatDateValue(props.defaultValue, props.format),
            dateInputStr: '',
            inputing: false,
            visible: props.defaultVisible,
            inputAsString: typeof props.defaultValue === 'string', // 判断用户输入是否是字符串
        };
    }

    static getDerivedStateFromProps(props: InnerYearPickerProps) {
        const states: Partial<YearPickerState> = {};
        if ('value' in props) {
            states.value = formatDateValue(props.value, props.format);
            if (typeof props.value === 'string') {
                states.inputAsString = true;
            }
            if (moment.isMoment(props.value)) {
                states.inputAsString = false;
            }
        }

        if ('visible' in props) {
            states.visible = props.visible;
        }

        return states;
    }

    onValueChange = (newValue: Moment | null) => {
        const ret =
            this.state.inputAsString && newValue ? newValue.format(this.props.format) : newValue;
        this.props.onChange(ret);
    };

    onSelectCalendarPanel = (value: Moment) => {
        const prevSelectedMonth = this.state.value;
        const selectedMonth = value.clone().month(0).date(1).hour(0).minute(0).second(0);

        this.handleChange(selectedMonth, prevSelectedMonth, { inputing: false }, () => {
            this.onVisibleChange(false, 'calendarSelect');
        });
    };

    clearValue = () => {
        this.setState({
            dateInputStr: '',
        });

        this.handleChange(null, this.state.value);
    };

    onDateInputChange = (inputStr: string, e: SyntheticEvent, eventType?: string) => {
        if (eventType === 'clear' || !inputStr) {
            e.stopPropagation();
            this.clearValue();
        } else {
            this.setState({
                dateInputStr: inputStr,
                inputing: true,
            });
        }
    };

    onDateInputBlur = () => {
        const { dateInputStr } = this.state;
        if (dateInputStr) {
            const { disabledDate, format } = this.props;
            const parsed = moment(dateInputStr, format, true);

            this.setState({
                dateInputStr: '',
                inputing: false,
            });

            if (parsed.isValid() && !disabledDate(parsed, 'year')) {
                this.handleChange(parsed, this.state.value);
            }
        }
    };

    onKeyDown = (e: KeyboardEvent) => {
        const { format } = this.props;
        const { dateInputStr, value } = this.state;
        const dateStr = onDateKeydown(e, { format, dateInputStr, value }, 'year');
        if (!dateStr) return;
        // @ts-expect-error 应该传入 e
        this.onDateInputChange(dateStr);
    };

    handleChange = (
        newValue: Moment | null,
        prevValue: Moment | null,
        others = {},
        callback?: () => void
    ) => {
        if (!('value' in this.props)) {
            this.setState({
                value: newValue,
                ...others,
            });
        } else {
            this.setState({
                ...others,
            });
        }

        const { format } = this.props;

        const newValueOf = newValue ? newValue.format(format) : null;
        const preValueOf = prevValue ? prevValue.format(format) : null;

        if (newValueOf !== preValueOf) {
            this.onValueChange(newValue);
            if (typeof callback === 'function') {
                return callback();
            }
        }
    };

    onVisibleChange = (visible: boolean, reason: string) => {
        if (!('visible' in this.props)) {
            this.setState({
                visible,
            });
        }
        this.props.onVisibleChange(visible, reason);
    };

    renderPreview(others: HTMLAttributes<HTMLDivElement>) {
        const { prefix, format, className, renderPreview } = this.props;
        const { value } = this.state;
        const previewCls = classnames(className, `${prefix}form-preview`);

        const label = value ? value.format(format) : '';

        if (typeof renderPreview === 'function') {
            return (
                <div {...others} className={previewCls}>
                    {renderPreview(value, this.props)}
                </div>
            );
        }

        return (
            <p {...others} className={previewCls}>
                {label}
            </p>
        );
    }

    render() {
        const {
            prefix,
            rtl,
            locale,
            label,
            state,
            format,
            disabledDate,
            footerRender,
            placeholder,
            size,
            disabled,
            hasClear,
            popupTriggerType,
            popupAlign,
            popupContainer,
            popupStyle,
            popupClassName,
            popupProps,
            popupComponent,
            popupContent,
            followTrigger,
            className,
            inputProps,
            dateInputAriaLabel,
            yearCellRender,
            isPreview,
            ...others
        } = this.props;

        const { visible, value, dateInputStr, inputing } = this.state;

        const yearPickerCls = classnames(
            {
                [`${prefix}year-picker`]: true,
            },
            className
        );

        const triggerInputCls = classnames({
            [`${prefix}year-picker-input`]: true,
            [`${prefix}error`]: false,
        });

        const panelBodyClassName = classnames({
            [`${prefix}year-picker-body`]: true,
        });

        if (rtl) {
            others.dir = 'rtl';
        }

        if (isPreview) {
            return this.renderPreview(obj.pickOthers(YEAR_PICKER_PROP_KEYS, others));
        }

        const panelInputCls = `${prefix}year-picker-panel-input`;

        const sharedInputProps = {
            ...inputProps,
            size,
            disabled,
            onChange: this.onDateInputChange,
            onBlur: this.onDateInputBlur,
            onPressEnter: this.onDateInputBlur,
            onKeyDown: this.onKeyDown,
        };

        const dateInputValue = inputing ? dateInputStr : (value && value.format(format)) || '';
        const triggerInputValue = dateInputValue;

        const dateInput = (
            <Input
                {...sharedInputProps}
                aria-label={dateInputAriaLabel}
                value={dateInputValue}
                placeholder={format}
                className={panelInputCls}
            />
        );

        const datePanel = (
            <Calendar
                shape="panel"
                modes={['year']}
                value={value}
                yearCellRender={yearCellRender}
                onSelect={this.onSelectCalendarPanel}
                disabledDate={disabledDate}
            />
        );

        const panelBody = datePanel;
        const panelFooter = footerRender();

        const allowClear = value && hasClear;
        const trigger = (
            <div className={`${prefix}year-picker-trigger`}>
                <Input
                    {...sharedInputProps}
                    label={label}
                    state={state}
                    value={triggerInputValue}
                    role="combobox"
                    aria-expanded={visible}
                    readOnly
                    placeholder={placeholder || locale.yearPlaceholder}
                    hint={
                        <Icon
                            type="calendar"
                            className={`${prefix}date-picker-symbol-calendar-icon`}
                        />
                    }
                    // @ts-expect-error allowClear 应该先做 boolean 化处理
                    hasClear={allowClear}
                    className={triggerInputCls}
                />
            </div>
        );

        const PopupComponent = popupComponent ? popupComponent : Popup;

        return (
            <div {...obj.pickOthers(YEAR_PICKER_PROP_KEYS, others)} className={yearPickerCls}>
                <PopupComponent
                    autoFocus
                    align={popupAlign}
                    {...popupProps}
                    followTrigger={followTrigger}
                    disabled={disabled}
                    visible={visible}
                    onVisibleChange={this.onVisibleChange}
                    triggerType={popupTriggerType}
                    container={popupContainer}
                    style={popupStyle}
                    className={popupClassName}
                    trigger={trigger}
                >
                    {popupContent ? (
                        popupContent
                    ) : (
                        <div dir={others.dir} className={panelBodyClassName}>
                            <div className={`${prefix}year-picker-panel-header`}>{dateInput}</div>
                            {panelBody}
                            {panelFooter}
                        </div>
                    )}
                </PopupComponent>
            </div>
        );
    }
}

export default YearPicker;
