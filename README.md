# @bagaking/jsoneditor

[![CI](https://github.com/bagaking/jsoneditor/actions/workflows/ci.yml/badge.svg)](https://github.com/bagaking/jsoneditor/actions/workflows/ci.yml)

一个功能强大的 **JSON 编辑器组件**，支持 *JSON Schema 验证*、*路径高亮*、*主题切换*、*自定义操作*等功能。

📚 [查看完整文档](https://bagaking.github.io/jsoneditor) | [English](./README.en.md)

## 🌟 特性

- 🎨 **主题系统**
  - 内置明暗主题
  - 可自定义主题变量
  - 支持组件级样式定制
  
- 🔍 **智能编辑**
  - 路径高亮和提示
  - 支持路径点击和自定义操作
  - 格式化和多级压缩
  
- ✨ **Schema 支持**
  - 基于 JSON Schema 的自动智能补全
  - 基于 JSON Schema 实时验证和错误排查
  - 支持枚举、日期、颜色等特殊类型的白屏编辑
    
- 🎯 **状态栏**
  - 光标位置显示
  - 文档大小统计
  - 错误信息展示

- 💡 **开发友好**
  - TypeScript 支持
  - 丰富的 API
  - 灵活的扩展机制

## 🚀 快速开始

### 安装

```bash
pnpm add @bagaking/jsoneditor
# 或
npm install @bagaking/jsoneditor
# 或
yarn add @bagaking/jsoneditor
```

### 基础使用

```tsx
import { JsonEditor } from '@bagaking/jsoneditor';

function App() {
  return (
    <JsonEditor
      defaultValue={'{"hello": "world"}'}
      onValueChange={setValue}
      onError={setError}

      // 编辑器配置
      codeSettings={{
        fontSize: 14,
        lineNumbers: true,
        bracketMatching: true
      }}

      // 主题配置
      themeConfig={{
        theme: 'light'
      }}

    />
  );
}
```

## 🎮 在线演示

- [CodeSandbox](https://codesandbox.io/s/bagaking-jsoneditor-demo)
- [StackBlitz](https://stackblitz.com/edit/bagaking-jsoneditor-demo)

或者克隆仓库本地运行：

```bash
git clone https://github.com/bagaking/jsoneditor.git
cd jsoneditor
pnpm install
pnpm dev
```

## 📖 高级用法

### Schema 验证

本组件使用 [JSON Schema](https://json-schema.org/) 进行数据验证和自动补全。支持 [Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html) 规范。

```tsx
import { JsonEditor } from '@bagaking/jsoneditor';

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: '项目名称',
      minLength: 1
    },
    version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+$',
      description: '版本号 (Semver)'
    }
  },
  required: ['name', 'version']
};

function App() {
  return (
    <JsonEditor
      defaultValue={JSON.stringify({
        name: 'my-project',
        version: '1.0.0'
      }, null, 2)}
      schemaConfig={{
        schema,
        validateOnType: true
      }}
    />
  );
}
```

更多用法请参考 [Schema 验证指南](https://bagaking.github.io/jsoneditor/guide/schema-validation)。

### 路径装饰

支持为不同的 JSON 路径添加自定义样式和交互：

```tsx
import { JsonEditor } from '@bagaking/jsoneditor';

function App() {
  return (
    <JsonEditor
      defaultValue={value}
      decorationConfig={{
        paths: {
          // 版本号使用特殊样式
          '$["version"]': {
            style: "italic bg-blue-100/30 rounded px-1",
            onClick: (value) => console.log('Version:', value)
          },
          // 状态使用不同颜色
          '$["status"]': {
            style: "text-green-600 font-medium"
          }
        }
      }}
    />
  );
}
```

更多用法请参考 [装饰系统文档](https://bagaking.github.io/jsoneditor/api/decoration)。

### 使用 Ref

```tsx
import { JsonEditor, EditorCore } from '@bagaking/jsoneditor';
import { useRef } from 'react';

function App() {
  const editorRef = useRef<EditorCore>(null);

  const handleFormat = () => {
    const value = editorRef.current?.getValue();
    if (value) {
      editorRef.current?.setValue(
        JSON.stringify(JSON.parse(value), null, 2)
      );
    }
  };

  return (
    <>
      <button onClick={handleFormat}>格式化</button>
      <JsonEditor
        ref={editorRef}
        defaultValue={value}
        onValueChange={setValue}
      />
    </>
  );
}
```


## 🤝 贡献指南

欢迎提交 [Issue](https://github.com/bagaking/jsoneditor/issues) 或 [Pull Request](https://github.com/bagaking/jsoneditor/pulls)!

## 📄 许可证

[MIT](./LICENSE)
