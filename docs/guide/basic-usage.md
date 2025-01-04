# 基础用法

> "掌握基础功能是驾驭复杂工具的第一步。让我们深入了解 JSON 编辑器的核心特性。"

## 编辑器实例

### 创建实例

{% raw %}
```tsx
import { JsonEditor } from '@bagaking/jsoneditor';
import { useRef } from 'react';

function App() {
  const editorRef = useRef(null);

  return (
    <JsonEditor
      ref={editorRef}
      defaultValue={`{
        "name": "JSON Editor",
        "version": "1.0.0"
      }`}
    />
  );
}
```
{% endraw %}

### 实例方法

{% raw %}
```tsx
// 获取内容
const value = editorRef.current?.getValue();

// 设置内容
editorRef.current?.setValue(JSON.stringify({ name: "New Value" }, null, 2));

// 更新配置
editorRef.current?.updateConfig({
  readOnly: true,
  themeConfig: { theme: 'dark' }
});
```
{% endraw %}

## 内容管理

### 设置初始值

{% raw %}
```tsx
<JsonEditor
  defaultValue={`{
    "name": "JSON Editor",
    "description": "A powerful JSON editor",
    "version": "1.0.0",
    "author": {
      "name": "Your Name",
      "email": "your.email@example.com"
    }
  }`}
/>
```
{% endraw %}

### 监听变化

{% raw %}
```tsx
<JsonEditor
  defaultValue={`{}`}
  onValueChange={(value) => {
    console.log('Content changed:', value);
    try {
      const data = JSON.parse(value);
      // 处理解析后的数据...
    } catch (error) {
      // 处理解析错误...
    }
  }}
/>
```
{% endraw %}

### 只读模式

{% raw %}
```tsx
<JsonEditor
  defaultValue={`{
    "name": "JSON Editor"
  }`}
  readOnly={true}
/>
```
{% endraw %}

## 基础样式

### 容器样式

{% raw %}
```tsx
<JsonEditor
  style={{
    height: '400px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}
  className="custom-editor"
/>
```
{% endraw %}

### 代码样式

{% raw %}
```tsx
<JsonEditor
  codeSettings={{
    fontSize: 14,
    lineNumbers: true,
    bracketMatching: true,
    highlightActiveLine: true
  }}
/>
```
{% endraw %}

### 主题配置

{% raw %}
```tsx
<JsonEditor
  themeConfig={{
    theme: 'dark'  // 'light' | 'dark'
  }}
/>
```
{% endraw %}

## 工具栏

### 基础配置

{% raw %}
```tsx
<JsonEditor
  toolbarConfig={{
    className: 'custom-toolbar',
    style: { 
      background: '#f5f5f5',
      borderBottom: '1px solid #ddd'
    }
  }}
/>
```
{% endraw %}

### 功能定制

{% raw %}
```tsx
<JsonEditor
  toolbarConfig={{
    // 自定义按钮样式
    buttonStyles: {
      format: { color: '#1890ff' },
      validate: { color: '#52c41a' }
    },
    // 按钮分组
    buttonGroups: [
      ['format', 'validate'],
      ['copy', 'expand']
    ]
  }}
/>
```
{% endraw %}

## 状态栏

### 基础配置

{% raw %}
```tsx
<JsonEditor
  statusBarConfig={{
    className: 'custom-status',
    style: { 
      background: '#f9f9f9',
      borderTop: '1px solid #ddd'
    }
  }}
/>
```
{% endraw %}

### 功能定制

{% raw %}
```tsx
<JsonEditor
  statusBarConfig={{
    features: {
      showError: true,      // 显示错误
      showCursor: true,     // 显示光标位置
      showSize: true,       // 显示文档大小
      showValid: true       // 显示验证状态
    },
    format: {
      // 自定义光标位置显示
      cursor: (line, col) => `第 ${line} 行，第 ${col} 列`,
      // 自定义文档大小显示
      size: (lines, bytes) => 
        `${lines} 行 / ${(bytes/1024).toFixed(1)}KB`,
      // 自定义验证状态显示
      valid: (isValid) => 
        isValid ? '✅ 验证通过' : '❌ 验证失败'
    }
  }}
/>
```
{% endraw %}

## Schema 面板

### 基础配置

{% raw %}
```tsx
<JsonEditor
  schemaInfoConfig={{
    layout: {
      showDescription: true,  // 显示描述
      showPath: true,         // 显示路径
      showType: true,         // 显示类型
      showRequired: true      // 显示必填标记
    }
  }}
/>
```
{% endraw %}

### 自定义显示

{% raw %}
```tsx
<JsonEditor
  schemaInfoConfig={{
    layout: {
      order: ['description', 'type', 'required'],
      dividerStyle: { margin: '0 8px' }
    },
    format: {
      // 自定义类型显示
      type: (type, format) => {
        if (format) return `${type} (${format})`;
        return type;
      },
      // 自定义描述显示
      description: (desc) => marked(desc)
    }
  }}
/>
```
{% endraw %}

## 展开控制

### 基础配置

{% raw %}
```tsx
<JsonEditor
  expandOption={{
    defaultExpand: true,  // 默认展开所有节点
    maxExpandDepth: 3     // 最大展开深度
  }}
/>
```
{% endraw %}

## 错误处理

### 基础错误处理

```tsx
<JsonEditor
  onError={(error) => {
    console.error('Editor error:', error);
    notification.error({
      message: '编辑器错误',
      description: error.message
    });
  }}
/>
```

### 验证错误处理

{% raw %}
```tsx
<JsonEditor
  schemaConfig={{
    schema: mySchema,
    validateOnType: true
  }}
  validationConfig={{
    validateOnChange: true
  }}
  onError={(error) => {
    if (error.name === 'ValidationError') {
      // 处理验证错误...
    } else {
      // 处理其他错误...
    }
  }}
/>
```
{% endraw %}

## 性能优化

### 防抖处理

{% raw %}
```tsx
import { debounce } from 'lodash';

function App() {
  const handleChange = debounce((value: string) => {
    // 处理变更...
  }, 300);

  return (
    <JsonEditor
      onValueChange={handleChange}
      validationConfig={{
        validateOnChange: true,
        validateDebounce: 300
      }}
    />
  );
}
```
{% endraw %}

### 按需更新

{% raw %}
```tsx
function App() {
  const [config, setConfig] = useState({
    readOnly: false,
    theme: 'light'
  });

  // 只更新必要的配置
  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <JsonEditor
      readOnly={config.readOnly}
      themeConfig={{ theme: config.theme }}
    />
  );
}
```
{% endraw %}
## 最佳实践

1. **内容管理**
   - 使用格式化的 JSON 字符串作为初始值
   - 始终处理 `onValueChange` 的错误情况
   - 合理使用只读模式保护数据

2. **样式配置**
   - 使用主题系统而不是直接样式
   - 保持工具栏和状态栏的视觉一致性
   - 注意响应式设计

3. **错误处理**
   - 提供友好的错误提示
   - 区分不同类型的错误
   - 合理使用验证配置

4. **性能优化**
   - 使用防抖处理频繁变更
   - 避免不必要的配置更新
   - 合理设置验证时机

> 💡 **小贴士**: 编辑器的基础功能已经能满足大多数使用场景。在添加更多高级特性之前，建议先充分利用好这些基础功能。合理的配置组合往往能实现意想不到的效果。 