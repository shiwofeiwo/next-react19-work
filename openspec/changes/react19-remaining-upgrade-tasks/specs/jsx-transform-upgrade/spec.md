## ADDED Requirements

### Requirement: tsconfig.json JSX transform 升级
系统 SHALL 将 `tsconfig.json` 中的 `"jsx": "react"` 更改为 `"jsx": "react-jsx"`。

#### Scenario: JSX 配置更新
- **WHEN** 更新 `tsconfig.json`
- **THEN** `"jsx"` 字段值为 `"react-jsx"`
- **THEN** TypeScript 使用 automatic JSX runtime

### Requirement: 构建工具 JSX 配置对齐
系统 SHALL 确保所有构建工具的 JSX transform 配置与 tsconfig.json 一致。

#### Scenario: Vite 配置对齐
- **WHEN** 项目使用 Vite 开发服务器（`@vitejs/plugin-react`）
- **THEN** `vite.config.ts` 中的 JSX 配置与 tsconfig 一致，使用 automatic runtime

#### Scenario: Babel 配置对齐（如存在）
- **WHEN** 项目存在 `.babelrc` 或 `babel.config.js`
- **THEN** JSX preset 配置使用 `{ "runtime": "automatic" }`

### Requirement: ESLint 配置更新
系统 SHALL 更新 ESLint 配置以适应 automatic JSX runtime。

#### Scenario: React unused import 规则
- **WHEN** 切换到 react-jsx 后
- **THEN** ESLint 不再对 `import React from 'react'` 报 unused import 错误
- **THEN** 通过配置 `react/jsx-uses-react` 规则或移除冗余的 React import

### Requirement: 构建验证
系统 SHALL 在 JSX transform 升级后通过完整的构建和类型检查。

#### Scenario: TypeScript 编译通过
- **WHEN** 运行 `npm run check:types`
- **THEN** 无新增类型错误

#### Scenario: 开发服务器正常启动
- **WHEN** 运行 `npm start`
- **THEN** 开发服务器正常启动，组件文档页面可访问

#### Scenario: 无 JSX transform 警告
- **WHEN** 在浏览器控制台查看
- **THEN** 不出现 "outdated JSX transform" 警告
