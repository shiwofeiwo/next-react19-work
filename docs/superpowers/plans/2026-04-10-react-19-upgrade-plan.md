# React 19 Upgrade Plan

> **Goal**: 将 @alifd/next 组件库从 React 16 升级到 React 19，保证所有组件的外部 API、Props 定义及交互功能与当前版本完全一致。
>
> **Principle**: 最小改动原则 —— 仅针对 React 19 Breaking Changes 进行必要调整。

---

## 官方升级指南对应关系

| 官方指南章节 | 本计划对应 Task |
|---|---|
| Installing | Task 0 |
| Codemods | Task 0.1 |
| Breaking Changes: Errors in render | Task 0.2 |
| Breaking Changes: propTypes/defaultProps | Task 1 |
| Breaking Changes: Legacy Context | Task 2 |
| Breaking Changes: String refs | Task 3 |
| Breaking Changes: Module pattern factories | Task 4 |
| Breaking Changes: React.createFactory | Task 5 |
| Breaking Changes: react-test-renderer/shallow | Task 6 |
| Breaking Changes: react-dom/test-utils (act) | Task 7 |
| Breaking Changes: ReactDOM.render | Task 8 |
| Breaking Changes: ReactDOM.hydrate | Task 9 |
| Breaking Changes: unmountComponentAtNode | Task 10 |
| Breaking Changes: findDOMNode | Task 11 |
| New Deprecations: element.ref | Task 12 |
| TypeScript: ref cleanup | Task 13 |
| TypeScript: useRef requires argument | Task 14 |
| TypeScript: ReactElement props = unknown | Task 15 |
| TypeScript: JSX namespace | Task 16 |
| TypeScript: useReducer typings | Task 17 |

---

## Task 0: 安装 React 19

> **官方指南**: [Installing](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#installing)

### Step 0.1: 推荐的中间版本 (可选但推荐)

> 官方指南建议先升级到 React 18.3 以识别潜在问题

```bash
npm install --save-exact react@18.3 react-dom@18.3
npm install --save-exact @types/react@18.3 @types/react-dom@18.3
```

### Step 0.2: 安装 React 19

```bash
npm install --save-exact react@^19.0.0 react-dom@^19.0.0
npm install --save-exact @types/react@^19.0.0 @types/react-dom@^19.0.0
```

### Step 0.3: 验证安装

```bash
npm ls react react-dom
```

---

## Task 0.1: 运行 Codemods

> **官方指南**: [Codemods](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#codemods)
>
> 官方推荐使用 `codemod` 命令而非 `react-codemod`，因为它更快、支持更复杂的迁移。

### Step 0.1.1: 运行 React 19 官方 codemod preset

```bash
npx types-react-codemod@latest preset-19 ./components
```

### Step 0.1.2: 处理 ReactElement props 类型问题

> **官方指南**: If you have a lot of unsound access to `element.props`, you can run this additional codemod

```bash
npx types-react-codemod@latest react-element-default-any-props ./components
```

### Step 0.1.3: 处理 propTypes 到 TypeScript

> **官方指南**: Codemod `propTypes` to TypeScript

```bash
npx codemod@latest react/prop-types-typescript
```

### Step 0.1.4: 处理 string refs

> **官方指南**: Codemod string refs with `ref` callbacks

```bash
npx codemod@latest react/19/replace-string-ref
```

### Step 0.1.5: 处理 ReactDOM.render

> **官方指南**: Codemod `ReactDOM.render` to `ReactDOMClient.createRoot`

```bash
npx codemod@latest react/19/replace-reactdom-render
```

### Step 0.1.6: 处理 act 导入

> **官方指南**: Codemod `ReactDOMTestUtils.act` to `React.act`

```bash
npx codemod@latest react/19/replace-act-import
```

### Step 0.1.7: 处理 JSX namespace

> **官方指南**: The JSX namespace in TypeScript

```bash
npx types-react-codemod@latest scoped-jsx ./components
```

---

## Task 0.2: createRoot 错误处理配置 (Breaking Changes: Errors in render)

> **官方指南**: [Errors in render are not re-thrown](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#errors-in-render-are-not-re-thrown)
>
> React 19 改进了错误处理方式，减少重复日志。如果生产环境错误报告依赖错误重新抛出，可以使用新的 `onUncaughtError` 和 `onCaughtError` 回调。

```typescript
// 完整示例
const root = createRoot(container, {
  onUncaughtError: (error, errorInfo) => {
    // ... log error report
  },
  onCaughtError: (error, errorInfo) => {
    // ... log error report
  }
});
```

**影响范围**: 所有使用 `createRoot` 的文件（Task 8, 10 中修改的文件）。

---

## Task 1: propTypes 和 defaultProps (Breaking Changes)

> **官方指南**: [Removed: propTypes and defaultProps for functions](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-proptypes-and-defaultprops)
>
> **优先级**: HIGH — 这是 Breaking Change
>
> React 19 移除函数组件的 propType 检查（会被静默忽略）。Class 组件继续支持 defaultProps。

### Step 1.1: 扫描 propTypes 使用

```bash
grep -rn "\.propTypes\s*=" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"
```

### Step 1.2: 扫描 defaultProps 使用

```bash
grep -rn "\.defaultProps\s*=" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"
```

### Step 1.3: 典型修改模式

```typescript
// Before
import PropTypes from 'prop-types';
function Heading({text}) {
  return <h1>{text}</h1>;
}
Heading.propTypes = {
  text: PropTypes.string,
};
Heading.defaultProps = {
  text: 'Hello, world!',
};

// After
interface Props {
  text?: string;
}
function Heading({text = 'Hello, world!'}: Props) {
  return <h1>{text}</h1>;
}
```

**注意**: 运行 codemod 后检查并手动修复剩余问题。

---

## Task 2: Legacy Context (Breaking Changes)

> **官方指南**: [Removed: Legacy Context using contextTypes and getChildContext](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-removing-legacy-context)
>
> **优先级**: HIGH — 这是 Breaking Change
>
> Legacy Context 仅在 class 组件中使用，React 19 移除以减小 React 体积。

### Step 2.1: 扫描 Legacy Context 使用

```bash
grep -rn "childContextTypes\|getChildContext\|contextTypes" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"
```

### Step 2.2: 典型修改模式

```typescript
// Before
import PropTypes from 'prop-types';
class Parent extends React.Component {
  static childContextTypes = {
    foo: PropTypes.string.isRequired,
  };
  getChildContext() {
    return { foo: 'bar' };
  }
  render() {
    return <Child />;
  }
}
class Child extends React.Component {
  static contextTypes = {
    foo: PropTypes.string.isRequired,
  };
  render() {
    return <div>{this.context.foo}</div>;
  }
}

// After
const FooContext = React.createContext();
class Parent extends React.Component {
  render() {
    return (
      <FooContext.Provider value='bar'>
        <Child />
      </FooContext.Provider>
    );
  }
}
class Child extends React.Component {
  static contextType = FooContext;
  render() {
    return <div>{this.context}</div>;
  }
}
```

---

## Task 3: String Refs (Breaking Changes)

> **官方指南**: [Removed: string refs](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-string-refs)
>
> **优先级**: HIGH — 这是 Breaking Change
>
> String refs 早在 2018 年 v16.3 就已废弃，React 19 正式移除。

### Step 3.1: 扫描 string refs

```bash
grep -rn "ref\s*=\s*['\"]" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)" | head -50
```

### Step 3.2: 典型修改模式

```typescript
// Before
class MyComponent extends React.Component {
  componentDidMount() {
    this.refs.input.focus();
  }
  render() {
    return <input ref='input' />;
  }
}

// After
class MyComponent extends React.Component {
  componentDidMount() {
    this.input.focus();
  }
  render() {
    return <input ref={input => this.input = input} />;
  }
}
```

**注意**: codemod `npx codemod@latest react/19/replace-string-ref` 可以自动处理大部分情况。

---

## Task 4: Module Pattern Factories (Breaking Changes)

> **官方指南**: [Removed: Module pattern factories](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-module-pattern-factories)
>
> **优先级**: MEDIUM — 这种模式极少使用

### Step 4.1: 扫描 module pattern factories

```bash
grep -rn "return\s*{\s*render\s*function\|FactoryComponent" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"
```

### Step 4.2: 典型修改模式

```typescript
// Before
function FactoryComponent() {
  return { render() { return <div />; } }
}

// After
function FactoryComponent() {
  return <div />;
}
```

---

## Task 5: React.createFactory (Breaking Changes)

> **官方指南**: [Removed: React.createFactory](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-createfactory)
>
> **优先级**: MEDIUM

### Step 5.1: 扫描 createFactory

```bash
grep -rn "createFactory" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"
```

### Step 5.2: 典型修改模式

```typescript
// Before
import { createFactory } from 'react';
const button = createFactory('button');

// After
const button = <button />;
```

---

## Task 6: react-test-renderer/shallow (Breaking Changes)

> **官方指南**: [Removed: react-test-renderer/shallow](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-react-test-renderer-shallow)
>
> **优先级**: MEDIUM — 仅测试相关

### Step 6.1: 扫描 shallow renderer 使用

```bash
grep -rn "react-test-renderer/shallow\|ShallowRenderer" --include="*.tsx" components/ | grep -v -E "(__docs__|mobile)"
```

### Step 6.2: 典型修改模式

```typescript
// Before
import ShallowRenderer from 'react-test-renderer/shallow';

// After
import ShallowRenderer from 'react-shallow-renderer';
```

---

## Task 7: act 导入迁移 (Breaking Changes)

> **官方指南**: [Removed: react-dom/test-utils](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-react-dom-test-utils)
>
> **优先级**: HIGH — 测试文件 Breaking Change
>
> `act` 已从 `react-dom/test-utils` 移至 `react` 包。

### Step 7.1: 扫描 act 导入

```bash
grep -rn "from 'react-dom/test-utils'\|from \"react-dom/test-utils\"" --include="*.tsx" --include="*.js" components/ | grep -v -E "(__docs__|mobile)"
```

### Step 7.2: 典型修改模式

```typescript
// Before
import {act} from 'react-dom/test-utils'

// After
import {act} from 'react'
```

**注意**: 其他 `test-utils` 函数已被移除，需寻找替代方案。

---

## Task 8: ReactDOM.render (Breaking Changes)

> **官方指南**: [Removed: ReactDOM.render](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-reactdom-render)
>
> **优先级**: HIGH — Breaking Change

### Step 8.1: 扫描 ReactDOM.render 使用

```bash
grep -rn "ReactDOM\.render" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"
```

### Step 8.2: 受影响文件

| 文件 | 修改方式 |
|---|---|
| `components/dialog/show.tsx` | createRoot |
| `components/drawer/show.tsx` | createRoot |
| `components/message/toast.tsx` | createRoot |
| `components/message/toast2.tsx` | createRoot |
| `components/notification/index.tsx` | createRoot |

### Step 8.3: 典型修改模式

```typescript
// Before
import {render} from 'react-dom';
render(<App />, document.getElementById('root'));

// After
import {createRoot} from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

---

## Task 9: ReactDOM.hydrate (Breaking Changes)

> **官方指南**: [Removed: ReactDOM.hydrate](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-reactdom-hydrate)
>
> **优先级**: MEDIUM — 如果项目中有 SSR 的话

### Step 9.1: 扫描 hydrate 使用

```bash
grep -rn "ReactDOM\.hydrate\|hydrateRoot" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"
```

### Step 9.2: 典型修改模式

```typescript
// Before
import {hydrate} from 'react-dom';
hydrate(<App />, document.getElementById('root'));

// After
import {hydrateRoot} from 'react-dom/client';
hydrateRoot(document.getElementById('root'), <App />);
```

---

## Task 10: unmountComponentAtNode (Breaking Changes)

> **官方指南**: [Removed: unmountComponentAtNode](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-unmountcomponentatnode)
>
> **优先级**: HIGH — Breaking Change

### Step 10.1: 扫描 unmountComponentAtNode 使用

```bash
grep -rn "unmountComponentAtNode" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"
```

### Step 10.2: 典型修改模式

```typescript
// Before
unmountComponentAtNode(document.getElementById('root'));

// After
root.unmount();
```

---

## Task 11: findDOMNode (Breaking Changes)

> **官方指南**: [Removed: ReactDOM.findDOMNode](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-reactdom-finddomnode)
>
> **优先级**: HIGH — Breaking Change

### Step 11.1: 扫描 findDOMNode 使用

```bash
grep -rn "findDOMNode" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"
```

### Step 11.2: 受影响文件

| 组件 | 文件 | 修改方式 |
|---|---|---|
| overlay | gateway.tsx, overlay.tsx, popup.tsx, position.tsx | ref 替代 |
| menu | item.tsx, menu.tsx, popup-item.tsx, sub-menu.tsx | ref 替代 |
| tree | tree.tsx, tree-node.tsx, tree-node-input.tsx | ref 替代 |
| step | step.tsx, step-item.tsx | ref 替代 |
| dialog | dialog-v2.tsx | ref 替代 |
| split-button | index.tsx | ref 替代 |
| tab | tabs/nav.tsx | ref 替代 |
| cascader | menu.tsx | ref 替代 |
| input | textarea.tsx | ref 替代 |
| card | collapse-content.tsx | ref 替代 |
| calendar | head/menu.tsx | ref 替代 |
| notification | index.tsx | ref 替代 |
| upload | runtime/iframe-uploader.tsx | ref 替代 |
| virtual-list | virtual-list.tsx | ref 替代 |
| menu-button | index.tsx | ref 替代 |
| select | base.tsx | ref 替代 |

### Step 11.3: 典型修改模式

```typescript
// Before
import {findDOMNode} from 'react-dom';
function AutoselectingInput() {
  useEffect(() => {
    const input = findDOMNode(this);
    input.select()
  }, []);
  return <input defaultValue="Hello" />;
}

// After
function AutoselectingInput() {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.select();
  }, []);
  return <input ref={ref} defaultValue="Hello" />
}
```

### Step 11.4: Class 组件 ref 模式

```typescript
// Before
import { findDOMNode } from 'react-dom';
class Menu extends Component {
    handleSelect = () => {
        const node = findDOMNode(this.menuRef) as HTMLElement;
    };
    render() {
        return <div ref={(c) => { this.menuRef = c; }} />;
    }
}

// After
class Menu extends Component {
    menuRef: HTMLDivElement | null = null;
    handleSelect = () => {
        const node = this.menuRef;
        if (!node) return;
    };
    render() {
        return <div ref={(c) => { this.menuRef = c; }} />;
    }
}
```

---

## Task 12: element.ref Deprecated (New Deprecations)

> **官方指南**: [Deprecated: element.ref](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#deprecated-element-ref)
>
> **优先级**: MEDIUM
>
> React 19 支持 `ref` as prop，访问 `element.ref` 会警告。

### Step 12.1: 扫描 element.ref 访问

```bash
grep -rn "\.ref\b" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)" | grep -v "props\.ref\|ref=\|ref:\|\.props\.ref"
```

### Step 12.2: 典型修改模式

```typescript
// Before
const element = <div>Hello</div>;
console.log(element.ref);

// After
const element = <div>Hello</div>;
console.log(element.props.ref);
```

---

## Task 13: ref Cleanup (TypeScript Changes)

> **官方指南**: [ref cleanups required](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#ref-cleanup-required)
>
> **优先级**: HIGH

### Step 13.1: 扫描需要修改的 ref callbacks

```bash
grep -rn "ref={current =>" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"
```

### Step 13.2: 典型修改模式

```typescript
// Before (implicit return)
<div ref={current => (instance = current)} />

// After (explicit no return)
<div ref={current => { instance = current; }} />
```

---

## Task 14: useRef Requires Argument (TypeScript Changes)

> **官方指南**: [useRef requires an argument](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#useref-requires-argument)
>
> **优先级**: HIGH

### Step 14.1: 扫描无参数的 useRef 调用

```bash
grep -rn "useRef()" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"
```

### Step 14.2: 典型修改模式

```typescript
// Before
// @ts-expect-error: Expected 1 argument but saw none
useRef();

// After
useRef(undefined);
```

---

## Task 15: ReactElement Props Type (TypeScript Changes)

> **官方指南**: [Changes to the ReactElement TypeScript type](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#changes-to-the-reactelement-typescript-type)
>
> **优先级**: HIGH
>
> ReactElement 的 props 默认从 `any` 改为 `unknown`。

### Step 15.1: 扫描 ReactElement props 访问

```bash
grep -rn "child\.props\|\.props\." --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"
```

### Step 15.2: 受影响文件（已知）

| 文件 | 问题 | 修改方式 |
|---|---|---|
| `components/affix/index.tsx` | children 属性不存在于类型 | 显式添加 `children?: ReactNode` |
| `components/animate/animate.tsx` | 同上 | 同上 |
| `components/animate/overlay-animate.tsx` | `children.props` 类型为 `unknown` | 使用 `ReactElement` 类型断言 |
| `components/avatar/index.tsx` | `icon.props` 类型为 `unknown` | 同上 |
| `components/balloon/balloon.tsx` | `element.props` 类型为 `unknown` | 同上 |
| `components/balloon/util.tsx` | 同上 | 同上 |
| `components/box/index.tsx` | `child.props` 类型为 `unknown` | 同上 |
| `components/breadcrumb/index.tsx` | 同上 | 同上 |
| `components/button/view/button.tsx` | 同上 | 同上 |
| `components/collapse/collapse.tsx` | 同上 | 同上 |
| `components/checkbox/checkbox-group.tsx` | 同上 | 同上 |
| `components/form/form.tsx` | 同上 | 同上 |
| `components/grid/row.tsx` | 同上 | 同上 |
| `components/list/list.tsx` | 同上 | 同上 |
| `components/step/view/step.tsx` | 同上 | 同上 |
| `components/tree-select/tree-select.tsx` | 同上 | 同上 |
| `components/tree/view/tree.tsx` | 同上 | 同上 |

### Step 15.3: 典型修改模式

```typescript
// Before
React.Children.map(children, child => {
    return child.props.xxx;  // TS18046: child.props is of type 'unknown'
});

// After
React.Children.map(children, (child: ReactElement) => {
    return child.props.xxx;  // OK
});
```

---

## Task 16: JSX Namespace (TypeScript Changes)

> **官方指南**: [The JSX namespace in TypeScript](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#the-jsx-namespace-in-typescript)
>
> **优先级**: MEDIUM
>
> 全局 JSX namespace 改为 `React.JSX`。

### Step 16.1: 检查 tsconfig.json

确认 JSX transform 配置：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"  // 或 react-jsxdev, react, preserve
  }
}
```

### Step 16.2: 模块扩展修改

如果项目有全局 JSX 类型扩展：

```typescript
// global.d.ts
// Before
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "my-element": {
        myElementProps: string;
      };
    }
  }
}

// After
declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "my-element": {
        myElementProps: string;
      };
    }
  }
}
```

### Step 16.3: 运行 codemod

```bash
npx types-react-codemod@latest scoped-jsx ./components
```

---

## Task 17: useReducer Typings (TypeScript Changes)

> **官方指南**: [Better useReducer typings](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#better-usereducer-typings)
>
> **优先级**: MEDIUM

### Step 17.1: 扫描 useRef 类型参数

```bash
grep -rn "useReducer<React\.Reducer" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"
```

### Step 17.2: 典型修改模式

```typescript
// Before
useReducer<React.Reducer<State, Action>>(reducer)

// After
useReducer(reducer)
```

或：

```typescript
// After (explicit state and action)
useReducer<State, [Action]>(reducer)
```

---

## Task 18: Form 组件类型调整

> **官方指南对应**: 基于 TypeScript 类型变化

### Step 18.1: ErrorProps.children 类型冲突

```typescript
// Before
export interface ErrorProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode | ((errors: errorsGroup, state?: FieldState) => ReactNode);
}

// After
export interface ErrorProps extends Omit<HTMLAttributes<HTMLElement>, 'children'>, CommonProps {
    children?: ReactNode | ((errors: errorsGroup, state?: FieldState) => ReactNode);
}
```

### Step 18.2: FormProps.onSubmit 类型调整

```typescript
// Before
onSubmit?: (e: FormEvent<HTMLFormElement>) => void;

// After
onSubmit?: (e: FormEvent<HTMLFormElement> | SubmitEvent) => void;
```

---

## Task 19: ConfigProvider.Consumer JSX 问题

> **官方指南**: Context.Consumer 不能作为 JSX 组件使用

### Step 19.1: 扫描 ConfigProvider.Consumer 使用

```bash
grep -rn "ConfigProvider\.Consumer" --include="*.tsx" components/ | grep -v -E "(__docs__|__tests__|mobile)"
```

### Step 19.2: 受影响文件

| 文件 | 问题 | 修改方式 |
|---|---|---|
| `components/message/toast.tsx` | `ConfigProvider.Consumer` 不能作为 JSX 组件 | 改用 `useConfig` hook 或其他模式 |

---

## Task 20: 验证与测试

### Step 20.1: 类型检查

```bash
npm run check:types
```

### Step 20.2: ESLint 检查

```bash
npm run check:eslint
```

### Step 20.3: 完整测试

```bash
npm run test
```

### Step 20.4: 开发服务器验证

```bash
npm run start
```

---

## 参考资料

- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [react-codemod](https://github.com/reactjs/react-codemod)
- [types-react-codemod](https://github.com/eps1lon/types-react-codemod)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
