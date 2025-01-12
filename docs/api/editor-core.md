---
layout: default
title: 编辑器核心 API
description: JSON Editor 的核心 API 文档，列出当前 EditorCore 实例公开的方法和边界
keywords: JSON Editor, Editor Core, Low-level API, Editor Instance, Methods, State Management
parent: API 参考
nav_order: 2
---

# 编辑器核心 API

`EditorCore` 是 `JsonEditor` 通过 ref 暴露的底层实例。它只负责编辑器内容、路径、Schema 查询、滚动、扩展、配置和生命周期。

格式化、压缩和验证是 `JsonEditor` 组件内置工具栏与验证配置的行为，不是 `EditorCore` ref 方法。不要把 `format`、`minify` 或 `validate` 当作 ref 实例方法调用。

## 核心概念

编辑器核心（EditorCore）是 JSON Editor 的核心类，它：

1. **管理编辑器内容** - 读取和替换当前 JSON 字符串
2. **提供路径能力** - 按 JSON path 读取、写入值，并查询对应 Schema
3. **处理底层扩展** - 添加或移除 CodeMirror 扩展
4. **控制视图边界** - 获取光标偏移、计算行尾位置、滚动到指定行

## 获取实例

通过 ref 获取编辑器实例：

```tsx
import { JsonEditor, EditorCore } from '@bagaking/jsoneditor';
import { useRef } from 'react';

function App() {
  const editorRef = useRef<EditorCore>(null);

  return (
    <JsonEditor
      ref={editorRef}
      defaultValue={initialValue}
      onValueChange={handleChange}
    />
  );
}
```

## 常见场景

### 外部强制更新

虽然编辑器内部管理自己的状态，但有时我们需要从外部强制更新内容：

```tsx
function App() {
  const editorRef = useRef<EditorCore>(null);

  // 1. 定时更新
  useEffect(() => {
    const timer = setInterval(() => {
      editorRef.current?.setValue(JSON.stringify({
        timestamp: Date.now(),
        data: fetchLatestData()
      }, null, 2));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 2. 响应外部事件
  const handleExternalUpdate = (newData: any) => {
    editorRef.current?.setValue(JSON.stringify(newData, null, 2));
  };

  // 3. 同步多个编辑器
  const syncToOtherEditor = () => {
    const content = editorRef.current?.getValue();
    otherEditorRef.current?.setValue(content);
  };

  return (
    <div>
      <JsonEditor ref={editorRef} defaultValue={initialValue} />
      <button onClick={() => handleExternalUpdate(newData)}>更新数据</button>
      <button onClick={syncToOtherEditor}>同步到其他编辑器</button>
    </div>
  );
}
```

### 与其他组件配合

编辑器可以与其他组件配合使用。这里的边界是：ref 负责取值和写值；格式化、压缩、验证交给组件工具栏或 `validationConfig`。

```tsx
function App() {
  const editorRef = useRef<EditorCore>(null);
  const [isValid, setIsValid] = useState(true);

  // 1. 与表单配合
  const handleSubmit = async () => {
    try {
      const content = editorRef.current?.getValue();
      const data = JSON.parse(content);
      await saveToServer(data);
    } catch (error) {
      notification.error({ message: '保存失败', description: error.message });
    }
  };

  // 2. 与预览组件配合
  const [preview, setPreview] = useState({});
  const updatePreview = () => {
    try {
      const content = editorRef.current?.getValue();
      setPreview(JSON.parse(content));
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
    }
  };

  return (
    <div>
      <Toolbar>
        <Button onClick={updatePreview}>预览</Button>
        <Button onClick={handleSubmit} disabled={!isValid}>保存</Button>
      </Toolbar>

      <div className="flex">
        <JsonEditor 
          ref={editorRef}
          defaultValue={initialValue}
          onValueChange={updatePreview}
        />
        <PreviewPanel data={preview} />
      </div>
    </div>
  );
}
```

## 核心方法

### 内容操作

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| getValue | 获取当前内容 | - | string |
| setValue | 设置编辑器内容 | content: string | void |

```tsx
// 获取内容
const content = editorRef.current?.getValue();

// 设置新内容
editorRef.current?.setValue(JSON.stringify({
  name: "New Content",
  timestamp: Date.now()
}, null, 2));
```

### 路径操作

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| getSchemaPathAtPosition | 获取指定文档偏移对应的 Schema 路径 | pos: number | string \| null |
| getSchemaAtPath | 获取指定路径的 Schema | path: string | JsonSchemaProperty \| null |
| getValueAtPath | 获取指定路径的值 | path: string | string \| undefined |
| setValueAtPath | 设置指定路径的值 | path: string, value: string | boolean |

```tsx
// 从当前光标偏移反查 Schema 路径
const pos = editorRef.current?.getCursorPosition();
const path = pos == null ? null : editorRef.current?.getSchemaPathAtPosition(pos);

// 获取特定路径的值
const version = editorRef.current?.getValueAtPath('$.version');

// 更新特定路径的值
editorRef.current?.setValueAtPath('$.version', '2.0.0');

// 获取路径的 Schema
const schema = editorRef.current?.getSchemaAtPath('$.version');
```

### 光标和滚动

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| getCursorPosition | 获取当前光标偏移 | - | number \| null |
| getLineEndPosition | 获取指定行的结束偏移 | line: number | number |
| scrollToLine | 滚动到指定行 | line: number | void |

```tsx
// 获取光标偏移
const pos = editorRef.current?.getCursorPosition();

// 获取第 3 行行尾偏移
const lineEnd = editorRef.current?.getLineEndPosition(3);

// 滚动到第 10 行
editorRef.current?.scrollToLine(10);
```

### 扩展操作

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| addExtension | 添加 CodeMirror 扩展 | extension: Extension | void |
| removeExtension | 移除已添加的扩展 | extension: Extension | void |

```tsx
import type { Extension } from '@codemirror/state';

function enableExtension(extension: Extension) {
  editorRef.current?.addExtension(extension);
}

function disableExtension(extension: Extension) {
  editorRef.current?.removeExtension(extension);
}
```

### 配置更新

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| updateConfig | 更新编辑器配置 | config: Partial<EditorConfig> | void |

```tsx
// 更新配置
editorRef.current?.updateConfig({
  readonly: true,
  themeConfig: {
    theme: 'dark'
  }
});
```

### 实例生命周期

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| destroy | 销毁编辑器实例 | - | void |

```tsx
// 手动销毁实例
editorRef.current?.destroy();
```

## 事件处理

`EditorCore` 构造配置支持以下内部回调。通过 `JsonEditor` 组件使用时，消费方通常只需要组件 props 中的 `onValueChange`、`onError` 和 `onCopy`。

1. **内容变化**：通过 `onChange` 配置处理
2. **光标移动**：通过 `onCursorActivity` 配置处理
3. **文档大小变化**：通过 `onDocChanged` 配置处理
4. **错误发生**：通过 `onError` 配置处理

```tsx
<JsonEditor
  ref={editorRef}
  onValueChange={(value) => {
    console.log('Content changed:', value);
  }}
  onError={(error) => {
    console.error('Editor error:', error);
  }}
/>
```

## 最佳实践

1. **内容更新**
   ```tsx
   // 推荐：使用 setValue
   editorRef.current?.setValue(newContent);

   // 不推荐：直接修改 DOM
   document.querySelector('.editor')!.innerHTML = newContent;
   ```

2. **路径操作**
   ```tsx
   // 推荐：使用 setValueAtPath
   editorRef.current?.setValueAtPath('$.version', '2.0.0');

   // 不推荐：手动解析和更新
   const content = JSON.parse(editorRef.current?.getValue() || '{}');
   content.version = '2.0.0';
   editorRef.current?.setValue(JSON.stringify(content, null, 2));
   ```

3. **配置更新**
   ```tsx
   // 推荐：批量更新配置
   editorRef.current?.updateConfig({
     readonly: true,
     themeConfig: { theme: 'dark' },
     codeSettings: { fontSize: 14 }
   });

   // 不推荐：频繁更新
   editorRef.current?.updateConfig({ readonly: true });
   editorRef.current?.updateConfig({ themeConfig: { theme: 'dark' } });
   editorRef.current?.updateConfig({ codeSettings: { fontSize: 14 } });
   ```

4. **格式化、压缩和验证**
   ```tsx
   // 推荐：使用组件工具栏开关
   <JsonEditor
     toolbarConfig={{
       features: {
         format: true,
         minify: true,
         validate: true
       }
     }}
     validationConfig={{ validateOnChange: true }}
   />;

   // 不推荐：把工具栏行为当作 EditorCore 方法调用
   editorRef.current?.setValue(JSON.stringify(JSON.parse(value), null, 2));
   ```

5. **性能优化**
   ```tsx
   // 推荐：使用防抖
   const debouncedUpdate = debounce((value: string) => {
     editorRef.current?.setValue(value);
   }, 300);

   // 不推荐：频繁更新
   editorRef.current?.setValue(value);
   ```

6. **错误处理**
   ```tsx
   try {
     editorRef.current?.setValue(newContent);
   } catch (error) {
     console.error('Failed to update content:', error);
     notification.error({
       message: '更新失败',
       description: error.message
     });
   }
   ```

## 类型定义

完整的类型定义：

```typescript
export interface EditorCore {
  // 内容操作
  getValue(): string;
  setValue(content: string): void;

  // 路径操作
  getSchemaPathAtPosition(pos: number): string | null;
  getSchemaAtPath(path: string): JsonSchemaProperty | null;
  getValueAtPath(path: string): string | undefined;
  setValueAtPath(path: string, value: string): boolean;

  // 光标和滚动
  getCursorPosition(): number | null;
  getLineEndPosition(line: number): number;
  scrollToLine(line: number): void;

  // 扩展操作
  addExtension(extension: Extension): void;
  removeExtension(extension: Extension): void;

  // 配置更新
  updateConfig(config: EditorConfig): void;

  // 生命周期
  destroy(): void;
}

export interface EditorConfig {
  value?: string;
  readonly?: boolean;
  codeSettings?: CodeSettings;
  themeConfig?: ThemeConfig;
  schemaConfig?: SchemaConfig;
  decorationConfig?: DecorationConfig;
  validationConfig?: ValidationConfig;
  extensions?: Extension[];
  onChange?: (value: string) => void;
  onError?: (error: Error) => void;
  onCursorActivity?: (info: { line: number; col: number }) => void;
  onDocChanged?: (info: { lines: number; bytes: number }) => void;
}
```
