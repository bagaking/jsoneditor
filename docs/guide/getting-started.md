---
layout: default
title: 快速开始
description: 快速上手 JSON Editor，包含安装指南、基本配置和简单示例
keywords: JSON Editor, React, Getting Started, Installation, Quick Start, NPM
parent: 使用指南
nav_order: 1
---

# 快速开始

> "从基础开始，循序渐进地掌握 JSON Editor 的强大功能。"

## 安装

使用你喜欢的包管理器安装：

```bash
# 使用 pnpm
pnpm add @bagaking/jsoneditor

# 或使用 npm
npm install @bagaking/jsoneditor

# 或使用 yarn
yarn add @bagaking/jsoneditor
```

## 基础使用

### 简单示例

最简单的使用方式：

{% raw %}
```tsx
import { JsonEditor } from '@bagaking/jsoneditor';

function App() {
  return (
    <JsonEditor
      defaultValue={`{
        "name": "JSON Editor",
        "version": "1.0.0"
      }`}
      onValueChange={(value) => {
        console.log('Content changed:', value);
      }}
    />
  );
}
```
{% endraw %}

### 命令式控制

如果需要从外部控制编辑器，可以使用 ref：

{% raw %}
```tsx
import { JsonEditor, EditorCore } from '@bagaking/jsoneditor';
import { useRef } from 'react';

function App() {
  const editorRef = useRef<EditorCore>(null);

  // 更新内容
  const updateContent = () => {
    editorRef.current?.setValue(JSON.stringify({
      name: "New Content",
      timestamp: Date.now()
    }, null, 2));
  };

  // 读取内容
  const logContent = () => {
    console.log(editorRef.current?.getValue());
  };

  return (
    <div>
      <div className="mb-4">
        <button onClick={logContent}>读取内容</button>
        <button onClick={updateContent}>更新内容</button>
      </div>
      <JsonEditor
        ref={editorRef}
        defaultValue={`{
          "name": "JSON Editor",
          "version": "1.0.0"
        }`}
        onValueChange={(value) => {
          console.log('Content changed:', value);
        }}
      />
    </div>
  );
}
```
{% endraw %}

更多高级用法请参考：
- [编辑器核心 API](../api/editor-core.md)
- [编辑器 API](../api/editor.md)

## 主题配置

### 编辑器配置

{% raw %}
```tsx
<JsonEditor
  // 基础配置
  defaultValue={`{}`}
  readOnly={false}
  style={{ height: '400px' }}
  className="custom-editor"
  
  // 代码配置
  codeSettings={{
    fontSize: 14,
    lineNumbers: true,
    bracketMatching: true
  }}
  
  // 主题配置
  themeConfig={{
    theme: 'light'  // 'light' | 'dark'
  }}
/>
```
{% endraw %}

### 工具栏配置

工具栏按钮由 `JsonEditor` 组件处理。`format`、`minify` 和 `validate` 是工具栏功能开关，不是 `EditorCore` ref 方法。

{% raw %}
```tsx
<JsonEditor
  toolbarConfig={{
    // 基础配置
    className: 'custom-toolbar',
    style: { 
      background: '#f5f5f5'
    },
    
    // 功能开关
    features: {
      format: true,
      minify: true,
      validate: true,
      copy: true
    }
  }}
/>
```
{% endraw %}

### 状态栏配置

当前组件会显示错误、验证状态、光标位置和文档大小；`statusBarConfig` 只接收状态栏容器的 `className` 和 `style`。

{% raw %}
```tsx
<JsonEditor
  statusBarConfig={{
    // 基础配置
    className: 'custom-status',
    style: { 
      background: '#f9f9f9'
    }
  }}
/>
```
{% endraw %}

## Schema 支持

### 基础验证

{% raw %}
```tsx
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: '用户名称'
    },
    age: {
      type: 'number',
      minimum: 0,
      maximum: 120
    }
  },
  required: ['name']
};

<JsonEditor
  defaultValue={`{
    "name": "John Doe",
    "age": 30
  }`}
  schemaConfig={{
    schema: schema
  }}
/>
```
{% endraw %}

### Schema 面板

当前组件会在光标命中 schema 字段时显示 Schema 信息面板；`schemaInfoConfig` 只接收面板容器的 `className` 和 `style`。

{% raw %}
```tsx
<JsonEditor
  schemaConfig={{
    schema: schema
  }}
  schemaInfoConfig={{
    className: 'custom-schema-panel',
    style: { borderTop: '1px solid #bfdbfe' }
  }}
/>
```
{% endraw %}

## 事件处理

`JsonEditor` 组件公开的事件 props 只有 `onValueChange`、`onError` 和 `onCopy`。`EditorCore` 内部配置里的 `onChange` 不属于 `JsonEditor` prop；光标状态可通过 ref 方法读取。

### 值变化

{% raw %}
```tsx
<JsonEditor
  defaultValue={`{}`}
  onValueChange={(value) => {
    console.log('Content changed:', value);
  }}
/>
```
{% endraw %}

### 错误处理

{% raw %}
```tsx
<JsonEditor
  defaultValue={`{}`}
  onError={(error) => {
    console.error('Editor error:', error);
    notification.error({
      message: '编辑器错误',
      description: error.message
    });
  }}
/>
```
{% endraw %}

### 复制处理

{% raw %}
```tsx
<JsonEditor
  defaultValue={`{}`}
  onCopy={(content) => {
    console.log('Copied content:', content);
  }}
/>
```
{% endraw %}

## 实例方法

### 获取实例

```tsx
import { useRef } from 'react';

function App() {
  const editorRef = useRef(null);

  return (
    <JsonEditor
      ref={editorRef}
      defaultValue={`{}`}
    />
  );
}
```

### 常用方法

```tsx
// 获取内容
const value = editorRef.current?.getValue();

// 设置内容
editorRef.current?.setValue(JSON.stringify({ name: "New Value" }, null, 2));

// 获取当前光标偏移
const cursor = editorRef.current?.getCursorPosition();

// 更新指定 JSON path
editorRef.current?.setValueAtPath('$.name', 'Updated Value');

// 更新配置
editorRef.current?.updateConfig({
  readonly: true,
  themeConfig: { theme: 'dark' }
});
```

## 常见问题

### 1. 安装问题

如果遇到安装问题，请检查：
- Node.js 版本是否符合要求
- 包管理器是否正常工作
- 是否有网络问题

### 2. 显示问题

如果遇到显示问题，请检查：
- 容器高度是否设置
- 主题配置是否正确
- 样式是否被覆盖

### 3. 性能问题

如果遇到性能问题，请检查：
- 数据量是否过大
- 是否频繁更新
- 是否有内存泄漏

## 下一步

1. 开始使用
   - 阅读 [基础用法](./basic-usage.md)
2. 了解常见用法
   - [编辑器 API](../api/editor.md)
   - [工具栏 API](../api/toolbar.md)
   - [状态栏 API](../api/statusbar.md)
   - [Schema 面板 API](../api/schema-panel.md)
   - [定制化指南](../api/customization.md)
   - [装饰系统](../api/decoration.md)
   - [Schema 验证](../api/schema-validation.md)
3. 深入了解
   - 阅读 [设计文档](../design/architecture.md)
   - 阅读 [名词表](../design/glossary.md)

> 💡 **小贴士**: 建议先熟悉基础功能，再逐步探索高级特性。JSON 编辑器提供了丰富的配置选项，但在开始时使用默认配置通常就能满足大部分需求。
