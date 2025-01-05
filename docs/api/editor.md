---
layout: default
title: 编辑器 API
description: JSON Editor 的主要 API 文档，包含编辑器组件的所有属性、方法和事件
keywords: JSON Editor, React Component, Editor API, Properties, Methods, Events, Configuration
parent: API 参考
nav_order: 1
---

# 编辑器 API

> "JSON Editor 提供了丰富的 API 来满足各种编辑需求。让我们从基础用法开始，逐步深入了解它的强大功能。"

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

  const handleFormat = () => {
    editorRef.current?.format();
  };

  const updateContent = () => {
    editorRef.current?.setValue(JSON.stringify({
      name: "Updated Content",
      timestamp: Date.now()
    }, null, 2));
  };

  return (
    <div>
      <div className="mb-4">
        <button onClick={handleFormat}>格式化</button>
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
  value?: string;                  // 受控值
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
  expandOption?: ExpandOption;     // 展开配置
  decorationConfig?: DecorationConfig; // 装饰配置 - 详见 decoration.md

  // 事件处理
  onValueChange?: (value: string) => void;  // 值变化回调
  onChange?: (event: EditorChangeEvent) => void; // 编辑器变化回调
  onError?: (error: EditorError) => void;   // 错误回调
  onCursorChange?: (position: CursorPosition) => void; // 光标变化回调
  onSelectionChange?: (selection: Selection) => void;  // 选区变化回调
  onFocus?: () => void;           // 获得焦点回调
  onBlur?: () => void;            // 失去焦点回调

  // 扩展功能
  plugins?: EditorPlugin[];       // 插件列表
  shortcuts?: ShortcutConfig;     // 快捷键配置
  contextMenu?: ContextMenuConfig; // 右键菜单配置
}
```

### CodeSettings

代码编辑器的配置项。

```typescript
interface CodeSettings {
  fontSize?: number;              // 字体大小
  fontFamily?: string;            // 字体族
  lineNumbers?: boolean;          // 是否显示行号
  lineHeight?: number;            // 行高
  tabSize?: number;              // Tab 大小
  bracketMatching?: boolean;     // 是否启用括号匹配
  autoCloseBrackets?: boolean;   // 是否自动闭合括号
  highlightActiveLine?: boolean; // 是否高亮当前行
  indentUnit?: number;          // 缩进单位
  scrollbarStyle?: string;      // 滚动条样式
  extraKeys?: Record<string, Function>; // 额外的快捷键
}
```

### ThemeConfig

主题配置项。

```typescript
interface ThemeConfig {
  theme?: 'light' | 'dark';      // 主题类型
  vars?: ThemeVariables;         // 主题变量
  components?: {                 // 组件主题
    toolbar?: ToolbarTheme;      // 工具栏主题
    statusBar?: StatusBarTheme;  // 状态栏主题
    schemaInfo?: SchemaInfoTheme; // Schema 面板主题
  };
  code?: CodeTheme;             // 代码主题
}

interface ThemeVariables {
  primary?: string;             // 主色
  secondary?: string;           // 次色
  error?: string;              // 错误色
  warning?: string;            // 警告色
  success?: string;            // 成功色
  info?: string;               // 信息色
  // ... 其他主题变量
}
```

### ValidationConfig

验证配置项。

```typescript
interface ValidationConfig {
  validateOnChange?: boolean;    // 是否在变化时验证
  validateOnBlur?: boolean;      // 是否在失焦时验证
  validateDebounce?: number;     // 验证防抖时间
  validateMode?: 'strict' | 'loose'; // 验证模式
  errorHandler?: (errors: ValidationError[]) => void; // 错误处理器
}
```

### EditorError

编辑器错误类型。

```typescript
interface EditorError {
  name: string;                 // 错误名称
  message: string;              // 错误信息
  stack?: string;              // 错误堆栈
  severity?: 'error' | 'warning' | 'info'; // 错误级别
  path?: string[];             // 错误路径
  line?: number;               // 错误行号
  column?: number;             // 错误列号
}
```

## 实例方法

### 基础操作

```typescript
interface EditorCore {
  // 内容操作
  getValue(): string;                    // 获取内容
  setValue(value: string): void;         // 设置内容
  format(): void;                        // 格式化内容
  validate(): boolean;                   // 验证内容
  
  // 配置操作
  updateConfig(config: Partial<EditorProps>): void; // 更新配置
  
  // 光标操作
  getCursor(): CursorPosition;           // 获取光标位置
  setCursor(position: CursorPosition): void; // 设置光标位置
  
  // 选区操作
  getSelection(): Selection;             // 获取选区
  setSelection(selection: Selection): void; // 设置选区
  
  // 历史操作
  undo(): void;                         // 撤销
  redo(): void;                         // 重做
  
  // 视图操作
  focus(): void;                        // 获得焦点
  blur(): void;                         // 失去焦点
  refresh(): void;                      // 刷新视图
}
```

### 扩展方法

```typescript
interface EditorCore {
  // 插件操作
  registerPlugin(plugin: EditorPlugin): void;  // 注册插件
  unregisterPlugin(name: string): void;        // 注销插件
  
  // 快捷键操作
  registerShortcut(key: string, fn: Function): void;  // 注册快捷键
  unregisterShortcut(key: string): void;             // 注销快捷键
  
  // 右键菜单操作
  registerContextMenu(item: ContextMenuItem): void;   // 注册菜单项
  unregisterContextMenu(key: string): void;          // 注销菜单项
}
```

## 事件类型

### EditorChangeEvent

编辑器变化事件。

```typescript
interface EditorChangeEvent {
  type: 'value' | 'cursor' | 'selection' | 'config'; // 变化类型
  value?: string;                      // 变化的值
  cursor?: CursorPosition;             // 变化的光标位置
  selection?: Selection;               // 变化的选区
  config?: Partial<EditorProps>;       // 变化的配置
}
```

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
    validateOnChange: true,
    validateDebounce: 300
  }}
  
  // 快捷键配置
  shortcuts={{
    'Ctrl-S': (editor) => {
      // 保存操作
    }
  }}
  
  // 右键菜单配置
  contextMenu={{
    items: [
      {
        key: 'format',
        label: '格式化',
        onClick: (editor) => editor.format()
      }
    ]
  }}
/>
```
{% endraw %} 