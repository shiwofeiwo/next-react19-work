## Why

`@alifd/next` 组件库正在从 React 16 升级到 React 19（分支：`feature/react19-upgrade-from-1.27.29`）。目前已完成大量迁移工作（37 个提交），包括 PropTypes 移除、Legacy Context 迁移、findDOMNode 替换、ref callback 修复和 ReactElement 类型断言。但仍有 **5 个关键领域**未完成，这些是 React 19 上线的阻塞项，不处理将导致运行时崩溃或类型检查失败。

## What Changes

### 已完成的工作（供参考）

- **PropTypes 移除**: 所有 `prop-types` 导入和 `static propTypes` 声明已清理
- **findDOMNode 替换**: 所有 `ReactDOM.findDOMNode` 调用已替换为 DOM refs（15+ 组件）
- **Legacy Context 迁移**: `contextTypes`/`childContextTypes`/`getChildContext` 已迁移至 `React.createContext`（ConfigProvider, Form, CheckboxGroup, RadioGroup, Nav/Shell, Table 等）
- **ref callback 修复**: 隐式返回的 ref callbacks 已转为 block body 形式
- **ReactElement 类型**: `.props` 访问已添加类型断言
- **Form 组件类型**: ErrorProps 和 FormProps 的类型冲突已修复

### 待完成的工作

#### Phase A: 构建通过（当前目标）

1. **移除 `react-lifecycles-compat` polyfill** — 70 个文件仍导入此库，该库仅用于 React < 16.3 的 `getDerivedStateFromProps`/`getSnapshotBeforeUpdate` 兼容，在 React 19 环境下完全多余。经分析确认无痛移除。
2. **函数组件 `defaultProps` 迁移** — React 19 移除了函数组件的 `defaultProps` 支持，3 个文件仍使用（`table/base/wrapper.jsx`, `range/view/track.tsx`, `range/view/slider.tsx`）
3. **JSX Transform 升级** — `tsconfig.json` 中 `"jsx": "react"` 需改为 `"react-jsx"`（React 19 要求 New JSX Transform）
4. **`global.d.ts` 清理** — 删除 `declare module 'enzyme-adapter-react-16'`（在 tsconfig include 范围内，影响类型检查）

#### Phase B: 测试统一（后续迭代，不影响构建）

5. **enzyme 遗留测试文件处理** — 项目主力测试框架是 **Cypress**（90 个文件使用 `cy.mount`/`cy.get`），仅 **3 个旧文件**仍使用 enzyme（`table/__tests__/index-spec.js`、`table/__tests__/issue-spec.js`、`date-picker2/__tests__/index-spec.js`），另有 1 个已注释（`upload/upload-spec.ts`）。enzyme 不支持 React 19，这些遗留文件需要迁移到 Cypress
6. **测试文件中的 `react-dom/test-utils` 导入** — 4 个测试文件仍从 `react-dom/test-utils` 导入 `act`，需改为从 `react` 导入

## Capabilities

### New Capabilities
- `react-lifecycles-compat-removal`: 移除 70 个文件中的 `react-lifecycles-compat` 导入和 `polyfill()` 调用
- `defaultprops-migration`: 将 3 个函数组件的 `defaultProps` 转换为 ES6 默认参数
- `jsx-transform-upgrade`: 将 `tsconfig.json` 和构建配置从 legacy JSX transform 升级到 automatic JSX runtime
- `test-framework-migration`: 将 3 个 enzyme 遗留测试文件迁移到 Cypress + `act` 从 `react` 导入（主力测试框架已是 Cypress）

### Modified Capabilities

_(无现有 OpenSpec spec 需要修改)_

## Impact

### Phase A（构建通过）
- **源码文件**: ~73 个组件文件需修改（70 个 react-lifecycles-compat + 3 个 defaultProps）
- **配置文件**: `tsconfig.json`, 可能涉及 `.babelrc` / vite 配置, `global.d.ts`（1 行）
- **依赖变更**: 移除 `react-lifecycles-compat`
- **风险**: 低 — react-lifecycles-compat 经分析确认可无痛移除；defaultProps 仅 3 个文件；JSX Transform 需验证 ESLint 兼容

### Phase B（测试统一）
- **测试文件**: 3 个 enzyme 遗留测试文件需迁移到 Cypress，4 个 `react-dom/test-utils` 导入需更新
- **依赖变更**: 移除 `enzyme`, `enzyme-adapter-react-16`, `@types/enzyme`
- **风险**: 可控 — 迁移规模小，不影响构建
