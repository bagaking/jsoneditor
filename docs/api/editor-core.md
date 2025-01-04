# 编辑器核心 API

> "编辑器核心（EditorCore）提供了一组强大的命令式 API，让你能够完全控制编辑器的行为。"

## 核心概念

编辑器核心（EditorCore）是 JSON Editor 的核心类，它：

1. **管理编辑器状态** - 维护内容、选区、历史记录等
2. **提供命令式 API** - 支持外部直接控制编辑器
3. **处理底层事件** - 处理用户输入、选择等事件
4. **实现核心功能** - 如格式化、验证、路径解析等

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

编辑器可以与其他组件配合使用：

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

  // 3. 与工具栏配合
  const handleFormat = () => {
    editorRef.current?.format();
  };

  return (
    <div>
      <Toolbar>
        <Button onClick={handleFormat}>格式化</Button>
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
| format | 格式化当前内容 | - | void |
| minify | 压缩当前内容 | level?: number | void |

```tsx
// 获取内容
const content = editorRef.current?.getValue();

// 设置新内容
editorRef.current?.setValue(JSON.stringify({
  name: "New Content",
  timestamp: Date.now()
}, null, 2));

// 格式化
editorRef.current?.format();

// 压缩 (支持多级压缩)
editorRef.current?.minify(1);
```

### 路径操作

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| getValueAtPath | 获取指定路径的值 | path: string | any |
| setValueAtPath | 设置指定路径的值 | path: string, value: any | boolean |
| getSchemaAtPath | 获取指定路径的 Schema | path: string | JsonSchemaProperty |

```tsx
// 获取特定路径的值
const version = editorRef.current?.getValueAtPath('$.version');

// 更新特定路径的值
editorRef.current?.setValueAtPath('$.version', '2.0.0');

// 获取路径的 Schema
const schema = editorRef.current?.getSchemaAtPath('$.version');
```

### 光标和选区

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| getCursorPosition | 获取当前光标位置 | - | Position |
| setCursorPosition | 设置光标位置 | position: Position | void |
| getSelection | 获取当前选区 | - | Selection |
| setSelection | 设置选区 | selection: Selection | void |

```tsx
// 获取光标位置
const pos = editorRef.current?.getCursorPosition();

// 设置光标位置
editorRef.current?.setCursorPosition({ line: 1, column: 1 });

// 获取选区
const selection = editorRef.current?.getSelection();

// 设置选区
editorRef.current?.setSelection({
  start: { line: 1, column: 1 },
  end: { line: 2, column: 10 }
});
```

### 配置更新

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| updateConfig | 更新编辑器配置 | config: Partial<EditorConfig> | void |

```tsx
// 更新配置
editorRef.current?.updateConfig({
  readOnly: true,
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

编辑器核心会触发以下事件：

1. **内容变化**：通过 `onChange` 配置处理
2. **光标移动**：通过 `onCursorActivity` 配置处理
3. **选区变化**：通过 `onSelectionChange` 配置处理
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
     readOnly: true,
     themeConfig: { theme: 'dark' },
     codeSettings: { fontSize: 14 }
   });

   // 不推荐：频繁更新
   editorRef.current?.updateConfig({ readOnly: true });
   editorRef.current?.updateConfig({ theme: 'dark' });
   editorRef.current?.updateConfig({ fontSize: 14 });
   ```

4. **性能优化**
   ```tsx
   // 推荐：使用防抖
   const debouncedUpdate = debounce((value: string) => {
     editorRef.current?.setValue(value);
   }, 300);

   // 不推荐：频繁更新
   editorRef.current?.setValue(value);
   ```

5. **错误处理**
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
  format(): void;
  minify(level?: number): void;

  // 路径操作
  getValueAtPath(path: string): any;
  setValueAtPath(path: string, value: any): boolean;
  getSchemaAtPath(path: string): JsonSchemaProperty;

  // 光标和选区
  getCursorPosition(): Position;
  setCursorPosition(position: Position): void;
  getSelection(): Selection;
  setSelection(selection: Selection): void;

  // 配置更新
  updateConfig(config: Partial<EditorConfig>): void;

  // 生命周期
  destroy(): void;
}

export interface Position {
  line: number;
  column: number;
}

export interface Selection {
  start: Position;
  end: Position;
}

export interface EditorConfig {
  readOnly?: boolean;
  codeSettings?: CodeSettings;
  themeConfig?: ThemeConfig;
  schemaConfig?: SchemaConfig;
  decorationConfig?: DecorationConfig;
  validationConfig?: ValidationConfig;
  extensions?: Extension[];
}
``` 