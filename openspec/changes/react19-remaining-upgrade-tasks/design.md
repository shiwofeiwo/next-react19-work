## Context

`@alifd/next` 是阿里 Fusion Design 的企业级 React UI 组件库，当前正在 `feature/react19-upgrade-from-1.27.29` 分支上进行 React 19 升级。已完成 PropTypes 移除、findDOMNode 替换、Legacy Context 迁移等核心工作（37 个提交），但仍有 4 个关键领域阻塞上线。

**当前技术栈**：
- React 19.2.5 + @types/react 19.2.14
- TypeScript 5.3.2
- **主力测试框架**: Cypress 14（90 个测试文件使用 `cy.mount`/`cy.get`）
- **遗留测试框架**: enzyme 3.x + enzyme-adapter-react-16（仅 3 个文件仍使用，1 个已注释）
- tsconfig.json: `"jsx": "react"`（legacy transform）
- 70 个文件导入 `react-lifecycles-compat`

**利益相关者**：组件库维护团队、下游消费者应用

## Goals / Non-Goals

**Goals:**
- 移除所有 React 19 不兼容的代码和依赖
- 确保 TypeScript 类型检查通过（`npm run check:types`）
- 确保构建流程正常（`npm run build`）
- 保持组件公共 API（Props）不变
- 为测试迁移建立可执行的分阶段方案

**Non-Goals:**
- 不重写组件内部实现逻辑
- 不改变组件的外部 API 接口
- 不升级 `@alifd/field`、`@alifd/overlay` 等外部依赖（除非它们阻断了 React 19）
- 不在本提案中完成全部 150+ 测试文件的迁移（仅建立方案和 POC）
- 不调整 React peerDependency 范围（留作后续决策）

## Decisions

### Decision 1: react-lifecycles-compat 移除策略 — 批量脚本删除

**选择**: 编写脚本批量移除 `import { polyfill } from 'react-lifecycles-compat'` 和 `polyfill(ComponentName)` 调用

**替代方案**:
- A) 手动逐文件删除 — 太慢，70 个文件
- B) jscodeshift codemod — 过度工程化，仅涉及两行代码

**理由**: 每个文件的修改模式完全一致（删除 import 行 + 删除 polyfill() 调用行），正则脚本足以处理。最后从 `package.json` 移除依赖。

### Decision 2: defaultProps 迁移 — ES6 默认参数

**选择**: 将函数组件的 `.defaultProps = {}` 转换为解构参数默认值

**替代方案**:
- A) 保持 `defaultProps`（仅 React 19 函数组件移除支持） — 不可行
- B) 使用 `Object.assign` 在函数体内合并 — 更冗长

**理由**: ES6 默认参数是最干净、最 React 19 兼容的方式。3 个文件修改量小，手动处理即可。

### Decision 3: JSX Transform — 渐进式切换到 react-jsx

**选择**: 将 `tsconfig.json` 的 `"jsx": "react"` 改为 `"jsx": "react-jsx"`

**风险**: 现有源码中所有文件都包含 `import React from 'react'`（因为 legacy transform 需要），切换到 `react-jsx` 后这些 import 变成冗余但不影响功能。ESLint 规则 `react/jsx-uses-react` 可能需要调整。

**理由**: React 19 官方文档明确说明 New JSX Transform 是**必需的**（required），不切换会出现警告且无法使用 ref-as-prop 等新特性。

### Decision 4: enzyme 遗留测试迁移到 Cypress

**选择**: 将 3 个 enzyme 测试文件迁移到 Cypress（与项目主力测试框架一致）

**受影响文件**:
- `components/table/__tests__/index-spec.js` — 大型文件，需评估工作量
- `components/table/__tests__/issue-spec.js`
- `components/date-picker2/__tests__/index-spec.js`
- `components/upload/__tests__/upload-spec.ts` — 已注释，可直接删除

**替代方案**:
- A) 使用 `@wojtekmaj/enzyme-adapter-react-19` 社区适配器保留 enzyme — 不稳定
- B) 迁移到 React Testing Library — 与项目现有测试模式不一致

**理由**: 项目 90 个测试文件已使用 Cypress，迁移到统一框架更一致。仅 3 个活跃文件需处理，规模可控。

### Decision 5: 移除 enzyme 全部依赖

**选择**: 迁移完成后从 `package.json` 移除 `enzyme`、`enzyme-adapter-react-16`、`@types/enzyme`

**理由**: enzyme 不支持 React 19，且项目已全面使用 Cypress，保留 enzyme 依赖无意义。

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| `react-lifecycles-compat` 移除 | ~~MEDIUM~~ 已确认无痛 | 经源码分析：64 个 class 组件使用 `getDerivedStateFromProps`（React 19 原生支持），0 个使用 `getSnapshotBeforeUpdate`，无 `UNSAFE_componentWill*` 冲突 |
| JSX transform 切换后 ESLint 报 `React` unused import | LOW | 更新 ESLint 配置或添加 `react/jsx-uses-react` 规则 |
| 函数组件 `defaultProps` 迁移可能改变 `undefined` 传入时的行为 | MEDIUM | 验证 `undefined` 和不传值两种情况的默认值行为一致 |
| enzyme 社区适配器不稳定 | ~~HIGH~~ 已改为直接迁移 | 仅 3 个文件迁移到 Cypress，完全移除 enzyme 依赖 |
| 测试文件中 `componentWillMount` 等废弃 API 引用 | LOW | 仅存在于 7 个 Cypress 测试文件中，不影响运行时 |
| `table/__tests__/index-spec.js` 是大型 enzyme 测试文件 | MEDIUM | 需要较多工作量迁移到 Cypress，可分批处理 |

## Migration Plan

### Phase A: 构建通过（当前目标）

1. **react-lifecycles-compat 清理**（70 个文件）
   - 编写移除脚本，批量执行
   - 从 `package.json` 移除依赖
   - 验证构建通过

2. **defaultProps 迁移**（3 个文件）
   - 逐文件手动修改
   - 验证组件行为一致

3. **JSX Transform 升级**（2-3 个配置文件）
   - 修改 `tsconfig.json`
   - 更新 ESLint 配置
   - 验证构建和类型检查通过

4. **`global.d.ts` 清理**（1 行）
   - 删除 `declare module 'enzyme-adapter-react-16'`

5. **验证**: `npm run check:types` + `npm run build` + `npm start`

### Phase B: 测试统一（后续迭代，不影响构建）

6. **enzyme → Cypress 迁移**（3 个文件）
7. **`act` 导入迁移**（4 个文件）
8. **enzyme 依赖清理**

**Rollback**: 所有修改在 feature 分支进行，必要时可回退

## Open Questions

1. `@alifd/field` 和 `@alifd/overlay` 是否已支持 React 19？是否需要同步升级？
2. React peerDependency 范围是否调整为 `>=18.0.0` 还是保持 `>=16.0.0`？
3. `table/__tests__/index-spec.js` 是大型 enzyme 文件（近千行），是否需要拆分迁移还是整体重写？
4. Cypress 14 的 `cy.mount` 在 React 19 下是否有已知兼容问题？
