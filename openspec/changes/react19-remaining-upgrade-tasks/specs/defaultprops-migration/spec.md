## ADDED Requirements

### Requirement: 函数组件 defaultProps 转换为 ES6 默认参数
系统 SHALL 将所有函数组件的 `.defaultProps = {}` 静态属性转换为函数参数解构的默认值。

#### Scenario: Track 组件默认值迁移
- **WHEN** `components/range/view/track.tsx` 中的 `Track.defaultProps = { prefix: 'next-' }` 被迁移
- **THEN** `Track` 函数的 `prefix` 参数获得默认值 `'next-'`
- **THEN** `Track.defaultProps` 静态属性不再存在

#### Scenario: Slider 组件默认值迁移
- **WHEN** `components/range/view/slider.tsx` 中的 `Slider.defaultProps = { prefix: 'next-', min: 0, max: 100, ... }` 被迁移
- **THEN** `Slider` 函数的对应参数获得 ES6 默认值
- **THEN** `Slider.defaultProps` 静态属性不再存在

#### Scenario: Wrapper 组件默认值迁移
- **WHEN** `components/table/base/wrapper.jsx` 中的 `Wrapper.defaultProps = { component: 'table' }` 被迁移
- **THEN** `Wrapper` 函数的 `component` 参数获得默认值 `'table'`
- **THEN** `Wrapper.defaultProps` 静态属性不再存在

### Requirement: 默认值行为一致性
迁移后的 ES6 默认参数 SHALL 与原 `.defaultProps` 在运行时行为一致。

#### Scenario: 不传值时使用默认值
- **WHEN** 调用组件时不传递某个 prop
- **THEN** 该 prop 使用 ES6 默认参数值，与原 defaultProps 行为相同

#### Scenario: 传入 undefined 时行为差异已知
- **WHEN** 调用组件时显式传入 `undefined`
- **THEN** ES6 默认参数生效（与 defaultProps 相同）
- **NOTE** 这是与原始 defaultProps 行为一致的，因为 React defaultProps 也会对 `undefined` 值生效
