# @bagaking/jsoneditor

[![CI](https://github.com/bagaking/jsoneditor/actions/workflows/ci.yml/badge.svg)](https://github.com/bagaking/jsoneditor/actions/workflows/ci.yml)

面向 React 应用的 JSON 编辑器组件。它把 CodeMirror 6 的编辑能力、AJV JSON Schema 验证、路径装饰、工具栏、状态栏和 TypeScript 类型封装成一个可发布的组件包，适合放进配置台、规则编辑器、调试面板和低代码表单的 JSON 区域。

📚 [完整文档](https://bagaking.github.io/jsoneditor) | [English](./README.en.md)

## 组件契约

- **React 契约**: `react` 和 `react-dom` 是 peer dependencies，支持 `^18.3.0 || ^19.0.0`。
- **编辑器契约**: CodeMirror 6、AJV 和 `ajv-formats` 是包依赖；Vite library build 会保留这些运行时 import，由消费方打包器解析。
- **样式契约**: 需要内置样式时，在应用入口导入 `@bagaking/jsoneditor/style.css`。发布包中的 `dist/style.css` 只覆盖组件内置样式；通过 `decorationConfig` 传入的消费方 Tailwind class 必须由消费方自己的 Tailwind content 扫描或 safelist 生成。
- **发布契约**: 包导出 ESM、CommonJS、TypeScript 声明和 `./style.css`。根入口导出 `JsonEditor`、`EditorCore`、公共配置类型，以及内置 action icon helper。

## 安装

```bash
pnpm add @bagaking/jsoneditor
# or
npm install @bagaking/jsoneditor
# or
yarn add @bagaking/jsoneditor
```

```tsx
import '@bagaking/jsoneditor/style.css';
import { JsonEditor } from '@bagaking/jsoneditor';
```

`dist/style.css` 不会为你的业务 Tailwind class 生成 CSS。如果你在路径装饰里写 `bg-blue-100/30`、`rounded`、`text-green-600` 这类 class，请把对应源码或 safelist 放进应用自己的 Tailwind 配置。

## 快速接入

`JsonEditor` 使用 `defaultValue` 初始化内容，并通过 `onValueChange` 回传字符串。需要外部读写编辑器状态时，用 `ref` 访问 `EditorCore`。

```tsx
import { useState } from 'react';
import '@bagaking/jsoneditor/style.css';
import { JsonEditor } from '@bagaking/jsoneditor';

export function ConfigEditor() {
  const [value, setValue] = useState('{\n  "env": "prod"\n}');

  return (
    <JsonEditor
      defaultValue={value}
      onValueChange={setValue}
      onError={(error) => console.error(error)}
      codeSettings={{
        fontSize: 14,
        lineNumbers: true,
        bracketMatching: true,
        autoCompletion: true
      }}
      themeConfig={{ theme: 'light' }}
      toolbarConfig={{
        features: {
          format: true,
          minify: true,
          validate: true,
          copy: true
        }
      }}
    />
  );
}
```

## API 场景

### Schema 验证

传入 JSON Schema 后，组件会在编辑器内使用 AJV 校验 JSON，并通过 `onError`、状态栏和 schema 信息面板暴露当前错误或字段信息。

```tsx
import { JsonEditor } from '@bagaking/jsoneditor';

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      description: '项目名称'
    },
    version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+$',
      description: 'Semver 版本'
    }
  },
  required: ['name', 'version']
};

export function PackageJsonEditor() {
  return (
    <JsonEditor
      defaultValue={JSON.stringify({ name: 'demo', version: '1.0.0' }, null, 2)}
      schemaConfig={{ schema }}
      validationConfig={{ validateOnChange: true }}
    />
  );
}
```

更多细节见 [Schema 验证指南](./docs/api/schema-validation.md)。

### 路径装饰

`decorationConfig.paths` 可以按 JSON path 给 key、value 或两者添加样式、图标和点击回调。内置样式名如 `underline`、`bold`、`italic` 由组件处理；业务 Tailwind class 由消费方构建。

```tsx
import { JsonEditor, rocketActionIcon } from '@bagaking/jsoneditor';

export function DecoratedEditor() {
  return (
    <JsonEditor
      defaultValue={JSON.stringify({ version: '1.0.0', status: 'active' }, null, 2)}
      decorationConfig={{
        paths: {
          '$["version"]': {
            target: 'value',
            style: 'italic bg-blue-100/30 rounded px-1',
            onClick: (value) => console.log('version', value)
          },
          '$["status"]': {
            target: 'both',
            style: 'text-green-600 font-medium',
            icon: rocketActionIcon
          }
        }
      }}
    />
  );
}
```

更多细节见 [装饰系统文档](https://bagaking.github.io/jsoneditor/api/decoration)。

### Imperative ref

`EditorCore` 暴露 `getValue`、`setValue`、`getCursorPosition`、`getSchemaPathAtPosition`、`getSchemaAtPath`、`getValueAtPath`、`setValueAtPath`、`getLineEndPosition`、`addExtension`、`removeExtension`、`scrollToLine`、`updateConfig` 和 `destroy` 等方法，适合和外部按钮、表单提交或调试工具联动。

```tsx
import { useRef } from 'react';
import { JsonEditor, type EditorCore } from '@bagaking/jsoneditor';

export function RefDrivenEditor() {
  const editorRef = useRef<EditorCore>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => console.log(editorRef.current?.getValue())}
      >
        Log JSON
      </button>
      <button
        type="button"
        onClick={() => editorRef.current?.setValueAtPath('$["hello"]', 'reader')}
      >
        Update hello
      </button>
      <JsonEditor
        ref={editorRef}
        defaultValue={'{"hello":"world"}'}
      />
    </>
  );
}
```

### CodeMirror 扩展

需要接入额外 CodeMirror 行为时，把扩展数组传给 `extensions`。组件会把它们交给底层 `EditorCore`。

```tsx
import type { Extension } from '@codemirror/state';
import { JsonEditor } from '@bagaking/jsoneditor';

export function ExtendedEditor({ extensions }: { extensions: Extension[] }) {
  return (
    <JsonEditor
      defaultValue="{}"
      extensions={extensions}
    />
  );
}
```

## 本地开发

```bash
git clone https://github.com/bagaking/jsoneditor.git
cd jsoneditor
pnpm install
pnpm dev
```

## 发布前验证

维护者发布前运行：

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm pack:dry-run
```

`pnpm build` 会先清理 `dist`，再运行 TypeScript 编译、Vite library build 和 Tailwind 样式构建，生成 `dist/index.js`、`dist/index.cjs`、类型声明和 `dist/style.css`。

`pnpm pack:dry-run` 运行 `scripts/check-pack-manifest.mjs`。它会先要求 `dist` 中存在必需产物，再调用 `npm pack --dry-run --json`，检查发布包是否包含必需入口、类型声明、样式、README 和 LICENSE；同时检查 `dist` 中是否出现非预期产物、不可达 CommonJS chunk、被打进包里的 `react-dom/client` 源码，以及 ESM/CJS 产物是否仍把 `react-dom/client` 保持为 external import/require。

这道门禁验证的是包清单和构建产物边界。它不替代单元测试、浏览器交互测试、文档站检查，也不证明消费方应用的 Tailwind class 已经被正确生成。

## 贡献

欢迎提交 [Issue](https://github.com/bagaking/jsoneditor/issues) 或 [Pull Request](https://github.com/bagaking/jsoneditor/pulls)。

## 许可证

[MIT](./LICENSE)
