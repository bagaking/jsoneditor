---
layout: default
title: 编辑器 API
description: JSON Editor 的主要 API 文档，包含编辑器组件的所有属性、方法和事件
keywords: JSON Editor, React Component, Editor API, Properties, Methods, Events, Configuration
parent: API 参考
nav_order: 1
---

# 编辑器 API

`JsonEditor` 提供 React 组件 API。需要命令式读写内容时，通过 ref 获取 `EditorCore`；格式化、压缩和验证属于组件工具栏与验证配置，不是 ref 方法。

## 基础用法

### 简单示例

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

通过 ref 可以获取编辑器实例，实现命令式控制：

{% raw %}
```tsx
import { JsonEditor, EditorCore } from '@bagaking/jsoneditor';
import { useRef } from 'react';

function App() {
  const editorRef = useRef<EditorCore>(null);

  const updateContent = () => {
    editorRef.current?.setValue(JSON.stringify({
      name: "Updated Content",
      timestamp: Date.now()
    }, null, 2));
  };

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
      />
    </div>
  );
}
```
{% endraw %}

更多关于编辑器核心 API 的使用，请参考 [编辑器核心 API](./editor-core.md)。

## 配置选项

### EditorProps

编辑器的主要属性接口。

```typescript
interface EditorProps {
  // 基础属性
  defaultValue?: string;           // 默认值
  readOnly?: boolean;              // 是否只读
  className?: string;              // 容器类名
  style?: React.CSSProperties;     // 容器样式

  // 配置项
  codeSettings?: CodeSettings;     // 代码编辑器配置
  themeConfig?: ThemeConfig;       // 主题配置
  toolbarConfig?: ToolbarConfig;   // 工具栏配置 - 详见 toolbar.md
  statusBarConfig?: StatusBarConfig; // 状态栏配置 - 详见 statusbar.md
  schemaConfig?: SchemaConfig;     // Schema 配置
  schemaInfoConfig?: SchemaInfoConfig; // Schema 面板配置 - 详见 schema-panel.md
  validationConfig?: ValidationConfig; // 验证配置
  decorationConfig?: DecorationConfig; // 装饰配置 - 详见 decoration.md
  expandOption?: ExpandOption;     // 展开配置
  extensions?: Extension[];        // CodeMirror 扩展

  // 事件处理
  onValueChange?: (value: string) => void;  // 值变化回调
  onError?: (error: Error) => void;          // 错误回调
  onCopy?: (content: string) => void;        // 复制回调
}
```

### CodeSettings

代码编辑器的配置项。

```typescript
interface CodeSettings {
  fontSize?: number;              // 字体大小
  lineNumbers?: boolean;          // 是否显示行号
  bracketMatching?: boolean;     // 是否启用括号匹配
  autoCompletion?: boolean;      // 是否启用自动完成
  highlightActiveLine?: boolean; // 是否高亮当前行
  focusRetentionStrategy?: 'soft' | 'strict' | 'manual';
}
```

### ThemeConfig

主题配置项。

```typescript
interface ThemeConfig {
  theme?: 'light' | 'dark';      // 主题类型
}
```

### ValidationConfig

验证配置项。

```typescript
interface ValidationConfig {
  validateOnChange?: boolean;    // 是否在变化时验证
}
```

`validateOnChange: false` 会关闭输入变化后的自动解析和 Schema 验证。需要格式化时，请使用工具栏的格式化按钮，或在消费方自行调用格式化逻辑后通过 `EditorCore.setValue()` 写回内容。

### ToolbarConfig

工具栏配置控制组件内置按钮。格式化、压缩、验证按钮由 `JsonEditor` 处理，不通过 `EditorCore` ref 调用。

```typescript
interface ToolbarConfig {
  position?: 'top' | 'bottom' | 'none';
  className?: string;
  style?: React.CSSProperties;
  features?: {
    format?: boolean;
    minify?: boolean;
    validate?: boolean;
    copy?: boolean;
    expand?: boolean;
  };
  customButtons?: Array<{
    key: string;
    render: (editor: EditorCore) => React.ReactNode;
  }>;
}
```

## 实例方法

### 基础操作

```typescript
interface EditorCore {
  // 内容操作
  getValue(): string;                    // 获取内容
  setValue(value: string): void;         // 设置内容

  // 路径和 Schema
  getCursorPosition(): number | null;    // 获取当前光标偏移
  getSchemaPathAtPosition(pos: number): string | null;
  getSchemaAtPath(path: string): JsonSchemaProperty | null;
  getValueAtPath(path: string): string | undefined;
  setValueAtPath(path: string, value: string): boolean;

  // 视图和扩展
  getLineEndPosition(line: number): number;
  scrollToLine(line: number): void;
  addExtension(extension: Extension): void;
  removeExtension(extension: Extension): void;

  // 配置和生命周期
  updateConfig(config: EditorConfig): void;
  destroy(): void;
}
```

工具栏按钮可以开启格式化、压缩和验证，但这些动作由 `JsonEditor` 组件处理。自定义按钮的 `render` 回调拿到的是 `EditorCore`，只能调用上面列出的实例方法。

## 事件边界

组件当前公开三个事件入口：`onValueChange` 接收最新字符串，`onError` 接收解析或验证错误，`onCopy` 接收被复制的内容。光标变化和选区变化用于组件内部状态，不是公开 props。

## 使用示例

### 基础配置

{% raw %}
```tsx
<JsonEditor
  // 基础配置
  defaultValue={`{}`}
  readOnly={false}
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
  
  // 验证配置
  validationConfig={{
    validateOnChange: true
  }}

  // 工具栏配置
  toolbarConfig={{
    features: {
      format: true,
      minify: true,
      validate: true,
      copy: true
    },
    customButtons: [{
      key: 'update-version',
      render: (editor) => (
        <button onClick={() => editor.setValueAtPath('$.version', '2.0.0')}>
          更新版本
        </button>
      )
    }]
  }}

  // 事件处理
  onValueChange={(value) => {
    console.log('Content changed:', value);
  }}
  onError={(error) => {
    console.error('Editor error:', error.message);
  }}
/>
```
{% endraw %}
