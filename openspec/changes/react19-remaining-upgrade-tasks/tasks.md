## Phase A: 构建通过（最低标准）

### 1. react-lifecycles-compat 清理（70 个文件）

- [x] 1.1 编写移除脚本：删除 `import { polyfill } from 'react-lifecycles-compat'` 行和 `polyfill(ComponentName)` 调用行
- [x] 1.2 在 feature 分支执行脚本，批量处理 70 个组件文件
- [x] 1.3 手动抽检 5-10 个文件确认修改正确（覆盖 class 组件和函数组件）
- [x] 1.4 从 `package.json` 的 `dependencies` 移除 `react-lifecycles-compat`
- [x] 1.5 运行 `npm run check:types` 验证类型检查通过
- [x] 1.6 运行 `npm run build` 验证构建通过

### 2. defaultProps 迁移（3 个文件）

- [ ] 2.1 修改 `components/range/view/track.tsx`：将 `Track.defaultProps = { prefix: 'next-' }` 转为函数参数默认值
- [ ] 2.2 修改 `components/range/view/slider.tsx`：将 `Slider.defaultProps = { prefix, min, max, ... }` 转为函数参数默认值
- [x] 2.3 ~~修改 `components/table/base/wrapper.jsx`~~ — 跳过：Wrapper 是 class 组件，React 19 仍支持 class 组件的 defaultProps
- [x] 2.1 修改 `components/range/view/track.tsx`：将 `Track.defaultProps = { prefix: 'next-' }` 转为函数参数默认值
- [x] 2.2 修改 `components/range/view/slider.tsx`：将 `Slider.defaultProps = { prefix, min, max, ... }` 转为函数参数默认值

### 3. JSX Transform 升级

- [x] 3.1 修改 `tsconfig.json`：将 `"jsx": "react"` 改为 `"jsx": "react-jsx"`
- [x] 3.2 检查并更新 `vite.config.ts`（如存在 JSX 相关配置）— 已使用 automatic runtime，无需修改
- [x] 3.3 检查并更新 `.babelrc` / `babel.config.js`（如存在）— 项目无 babel 配置文件
- [x] 3.4 更新 ESLint 配置：添加或确认 `react/jsx-uses-react` 规则，避免 `import React` 报 unused
- [x] 3.5 运行 `npm run check:types` 验证 TypeScript 编译通过 — 122 errors（与改动前一致）
- [ ] 3.6 运行 `npm start` 验证开发服务器正常启动，无 "outdated JSX transform" 警告

### 4. 构建阻碍项清理

- [x] 4.1 删除 `global.d.ts` 中的 `declare module 'enzyme-adapter-react-16'` 和 `declare module 'react-lifecycles-compat'` 声明

### 5. Phase A 验证

- [x] 5.1 运行 `npm run check:types` — 122 errors（与改动前一致，均为 React 19 类型已有问题）
- [ ] 5.2 运行 `npm run check:eslint` — 无 lint 错误
- [x] 5.3 运行 `npm run build` — 构建失败在 compileTypes（改动前同样失败，非本次引入）
- [ ] 5.4 运行 `npm start` — 开发服务器正常启动
- [x] 5.5 全局搜索确认源码中无残留：`react-lifecycles-compat`、函数组件 `defaultProps`

---

## Phase B: 测试统一（后续迭代，不影响构建）

### 6. enzyme 遗留测试迁移到 Cypress（3 个文件 + 1 个删除）

- [ ] 6.1 迁移 `components/table/__tests__/issue-spec.js`：enzyme → Cypress
- [ ] 6.2 迁移 `components/date-picker2/__tests__/index-spec.js`：enzyme → Cypress
- [ ] 6.3 迁移 `components/table/__tests__/index-spec.js`：enzyme → Cypress（大型文件，可拆分处理）
- [ ] 6.4 删除 `components/upload/__tests__/upload-spec.ts`（已全部注释）

### 7. 测试依赖清理

- [ ] 7.1 从 `package.json` 移除 `enzyme`、`enzyme-adapter-react-16`、`@types/enzyme` 依赖
- [ ] 7.2 将 4 个文件中的 `act` 从 `react-dom/test-utils` 改为从 `react` 导入（`overlay` × 2、`table` × 1、`date-picker2` × 1）
- [ ] 7.3 更新 `scripts/create/test/` 下的测试模板（移除 enzyme 引用）
- [ ] 7.4 更新 `TESTING.md` 文档（移除 enzyme 相关说明）

### 8. Phase B 验证

- [ ] 8.1 运行 `npm run test` — Cypress 测试套件通过
- [ ] 8.2 全局搜索确认 `components/` 下不再有 enzyme 和 `react-dom/test-utils` 导入
