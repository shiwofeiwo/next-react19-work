## ADDED Requirements

### Requirement: Void expressions SHALL NOT be used where ReactNode is expected

All component render logic SHALL return a valid `ReactNode` value (`null`, `undefined`, element, string, number, boolean, or bigint). Expressions that implicitly return `void` (e.g., `condition && someVoidFunction()`) SHALL be refactored to explicitly return a valid ReactNode.

#### Scenario: Void-returning function in JSX expression
- **WHEN** a component uses `condition && voidFunction()` pattern in JSX
- **THEN** the expression SHALL be refactored to `condition ? voidFunction() || null : null` or equivalent form that returns `null` instead of `void`

#### Scenario: Arrow function returning void used as renderer prop
- **WHEN** a renderer prop (e.g., `progress`, `textRender`) is typed as `() => ReactNode` but the implementation returns `void`
- **THEN** the function SHALL be updated to explicitly return `null` when no content should be rendered

### Requirement: Component props SHALL explicitly declare children property

All class components and ConfiguredComponent wrappers that render `this.props.children` or receive children via JSX SHALL include `children?: React.ReactNode` in their props type definition.

#### Scenario: Class component accessing this.props.children
- **WHEN** a class component uses `this.props.children` in its render method
- **THEN** the component's props interface SHALL include `children?: React.ReactNode`

#### Scenario: ConfiguredComponent receiving children via JSX
- **WHEN** a ConfiguredComponent wrapped component receives `children` as a JSX child
- **THEN** the component SHALL either have `children` in its props type OR use a type assertion at the JSX call site

### Requirement: ConfiguredComponent JSX calls SHALL type-check correctly

When passing props (including `children`, `style`, event handlers) to `ConfiguredComponent` instances via JSX, the TypeScript compiler SHALL NOT report type errors.

#### Scenario: Passing children to ConfiguredComponent
- **WHEN** a `ConfiguredComponent<P, R>` instance receives children via JSX
- **THEN** type compatibility SHALL be ensured through type assertion or props extension

#### Scenario: Passing ref callback for ConfiguredComponent
- **WHEN** a ref callback typed as `(instance: HtmlElement | null) => void` is passed to a ConfiguredComponent
- **THEN** the type SHALL be compatible through proper casting

### Requirement: Locale and i18n types SHALL be compatible with ReactNode

`ComponentLocaleObject`, `string[]`, and other locale-related types used in rendering context SHALL be narrowed or asserted to `ReactNode` compatibility.

#### Scenario: Rendering locale text containing ComponentLocaleObject
- **WHEN** a locale value of type `string | number | boolean | string[] | ComponentLocaleObject | undefined` is rendered in JSX
- **THEN** the value SHALL be explicitly cast to `ReactNode` or narrowed to a valid ReactNode subtype before rendering

### Requirement: Unused @ts-expect-error directives SHALL be removed

Any `@ts-expect-error` directive that no longer guards against a TypeScript error SHALL be removed from the source code.

#### Scenario: Previously suppressed error now resolved
- **WHEN** a `@ts-expect-error` comment exists but the subsequent line has no TypeScript error
- **THEN** the `@ts-expect-error` comment SHALL be deleted

### Requirement: React 19 Key type changes SHALL be handled

The `Key` type in React 19 includes `bigint`. Code that narrows `Key` to `string | number` SHALL be updated to handle `bigint`.

#### Scenario: Key used as map value or comparison
- **WHEN** a value of type `Key | null | undefined` is assigned to a variable typed as `string | number | boolean | null | undefined`
- **THEN** the target type SHALL be extended to include `bigint`, or the value SHALL be cast appropriately

### Requirement: HTML attribute type changes SHALL be handled

React 19 type definitions may narrow certain HTML attribute types (e.g., `capture` on `<input>`). Components using these attributes SHALL conform to the new types.

#### Scenario: Input capture attribute
- **WHEN** an `<input type="file">` uses the `capture` attribute with a `string | undefined` value
- **THEN** the value SHALL be narrowed to `boolean | "user" | "environment" | undefined` via type assertion or conditional

### Requirement: State and props type parameters SHALL be explicit

Class components with state SHALL provide explicit type parameters for both props and state. Components using implicit `any` for state SHALL add proper type definitions.

#### Scenario: Class component missing state type
- **WHEN** a class component extends `Component<Props>` without a state type parameter and accesses `this.state`
- **THEN** the component SHALL be updated to `Component<Props, StateType>` with an explicit state interface

### Requirement: Build SHALL complete successfully

After all type fixes are applied, `npm run build` SHALL complete without TypeScript errors.

#### Scenario: Full build passes
- **WHEN** `npm run build` is executed
- **THEN** the TypeScript compilation stage SHALL produce zero errors and generate type definitions in the `types/` directory
