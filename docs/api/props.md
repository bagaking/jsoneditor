---
layout: default
title: API 清单
description: JSON Editor 完整的 API 清单，包含所有属性、配置项和类型定义的详细说明
keywords: JSON Editor, API Reference, Properties, Configuration, Type Definitions, Interface Documentation
parent: API 参考
nav_order: 9
---

# API 清单

> "优秀的 API 设计应该是直观的、一致的，并且能够满足各种使用场景。让我们深入了解 JSON Editor 的配置选项。"

## 核心概念

JSON Editor 的配置系统分为几个主要部分：

1. **基础配置** - 控制编辑器的基本行为和外观
2. **编辑器设置** - 代码编辑相关的具体设置
3. **主题配置** - 控制编辑器的视觉风格
4. **功能配置** - Schema 验证、装饰系统等特性
5. **组件配置** - 工具栏、状态栏等UI组件

## 基础配置

### 核心属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| defaultValue | string | - | 编辑器的初始内容 |
| readOnly | boolean | false | 是否为只读模式 |
| className | string | - | 容器的自定义类名 |
| style | React.CSSProperties | - | 容器的自定义样式 |

### 事件回调

| 属性 | 类型 | 说明 |
|------|------|------|
| onValueChange | (value: string) => void | 当编辑器内容变化时触发 |
| onError | (error: Error) => void | 当发生错误时触发（如 JSON 解析错误） |
| onCopy | (content: string) => void | 当工具栏复制内容成功时触发 |

`JsonEditor` 组件当前只公开 `onValueChange`、`onError` 和 `onCopy` 三个事件 props。`EditorCore` 内部配置里的 `onChange` 不是组件 prop，光标与选区状态不通过组件事件 props 暴露。

### 示例

{% raw %}
```tsx
<JsonEditor
  // 基础配置
  defaultValue={JSON.stringify({ name: "example" }, null, 2)}
  readOnly={false}
  className="custom-editor"
  style={{ height: "400px" }}
  
  // 事件处理
  onValueChange={(value) => {
    console.log("Content changed:", value);
    try {
      const json = JSON.parse(value);
      saveToDatabase(json);
    } catch (err) {
      console.error("Invalid JSON");
    }
  }}
  onError={(error) => {
    notification.error({
      message: "编辑器错误",
      description: error.message
    });
  }}
/>
```
{% endraw %}

## 编辑器设置 (CodeSettings)

控制编辑器的具体行为和外观。

### 基础设置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| fontSize | number | 14 | 编辑器字体大小 |
| lineNumbers | boolean | true | 是否显示行号 |
| focusRetentionStrategy | 'soft' \| 'strict' \| 'manual' | 'manual' | 编辑器焦点保持策略 |

### 编辑功能

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| bracketMatching | boolean | true | 是否启用括号匹配 |
| autoCompletion | boolean | true | 是否启用自动完成 |

### 视觉效果

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| highlightActiveLine | boolean | true | 是否高亮当前行 |

### 示例

{% raw %}
```tsx
<JsonEditor
  codeSettings={{
    // 基础设置
    fontSize: 14,
    lineNumbers: true,
    focusRetentionStrategy: "manual",
    
    // 编辑功能
    bracketMatching: true,
    autoCompletion: true,
    
    // 视觉效果
    highlightActiveLine: true
  }}
/>
```
{% endraw %}

## Schema 配置 (SchemaConfig)

控制 JSON Schema 验证和提示功能。

### 基础配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| schema | object | - | JSON Schema 定义对象 |

### 示例

{% raw %}
```tsx
<JsonEditor
  schemaConfig={{
    // Schema 定义
    schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          minLength: 2,
          description: "用户名称"
        },
        age: {
          type: "number",
          minimum: 0,
          maximum: 120
        },
        email: {
          type: "string",
          format: "email"
        },
        tags: {
          type: "array",
          items: {
            type: "string"
          },
          uniqueItems: true
        }
      },
      required: ["name", "email"]
    },
    
    // 当前组件会用该 schema 进行 AJV 验证和字段信息提示
  }}
/>
```
{% endraw %}

## 主题配置 (ThemeConfig)

控制编辑器的视觉主题。详见 [主题系统](./customization.md) 文档。

### 基础配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| theme | 'light' \| 'dark' | 'light' | 内置主题类型 |

### 示例

{% raw %}
```tsx
<JsonEditor
  themeConfig={{
    // 基础主题
    theme: 'dark'
  }}
/>
```
{% endraw %}

## 装饰配置 (DecorationConfig)

控制 JSON 路径的装饰效果。详见 [装饰系统](./decoration.md) 文档。

### 路径装饰

| 属性 | 类型 | 说明 |
|------|------|------|
| paths | Record<string, DecorationPathHook> | 路径装饰配置映射 |
| urlHandler | URLHandler | URL 点击处理配置 |

### DecorationPathHook

| 属性 | 类型 | 说明 |
|------|------|------|
| style | string \| CustomComponent | 装饰样式或自定义组件 |
| onClick | (value: any) => void | 点击回调函数 |
| target | 'key' \| 'value' \| 'both' | 装饰目标 |
| icon | string \| React.ReactNode | 操作按钮图标 |

### 示例

{% raw %}
```tsx
<JsonEditor
  decorationConfig={{
    paths: {
      // 版本号装饰
      '$["version"]': {
        target: "value",
        style: "italic bg-blue-100/30 rounded px-1",
        onClick: (value) => showVersionHistory(value)
      },
      
      // 状态装饰
      '$["status"]': {
        target: "both",
        style: "text-green-600 font-medium"
      }
    },
    
    // URL 处理
    urlHandler: {
      openInNewTab: true,
      onClick: (url) => console.log("open url", url)
    }
  }}
/>
```
{% endraw %}

## 工具栏配置 (ToolbarConfig)

控制顶部工具栏的功能和外观。

### 基础配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| position | 'none' | - | 设为 `none` 时隐藏工具栏；其他位置值当前不改变布局 |
| className | string | - | 自定义类名 |
| style | React.CSSProperties | - | 自定义样式 |

### 功能配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| features | ToolbarFeatures | - | 功能开关配置 |
| customButtons | Array<{ key: string; render: (editor: EditorCore) => React.ReactNode }> | - | 自定义按钮，按钮内容和交互由 `render` 返回的 React 节点实现 |

### 示例

{% raw %}
```tsx
<JsonEditor
  toolbarConfig={{
    // 基础配置
    position: 'top',
    className: 'custom-toolbar',
    style: { 
      background: '#f5f5f5',
      borderBottom: '1px solid #e8e8e8'
    },
    
    // 功能配置
    features: {
      format: true,
      minify: true,
      validate: true,
      copy: true,
      expand: true
    },
    
    // 自定义按钮，每一项只接收 key 和 render
    customButtons: [
      {
        key: 'save',
        render: (editor) => (
          <Button
            aria-label="保存"
            title="保存"
            icon={<SaveIcon />}
            onClick={() => {
              const value = editor.getValue();
              saveToServer(value);
            }}
          />
        )
      },
      {
        key: 'preview',
        render: (editor) => (
          <Button 
            icon={<EyeIcon />}
            onClick={() => {
              const value = editor.getValue();
              showPreview(value);
            }}
          >
            预览
          </Button>
        )
      }
    ]
  }}
/>
```
{% endraw %}

## 展开配置 (ExpandOption)

控制长内容的展开/收起功能。

### 基础配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| defaultExpanded | boolean | true | 默认是否展开 |
| collapsedLines | number | 5 | 收起状态显示的行数 |

### 动画配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| animation | ExpandAnimation | - | 展开/收起动画配置 |
| onExpandChange | (expanded: boolean) => void | - | 展开状态变化回调 |

### 示例

{% raw %}
```tsx
<JsonEditor
  expandOption={{
    // 基础配置
    defaultExpanded: false,
    collapsedLines: 10,
    
    // 动画配置
    animation: {
      enabled: true,
      duration: 300,
      timing: 'ease-in-out'
    },
    
    // 状态回调
    onExpandChange: (expanded) => {
      console.log('Content expanded:', expanded);
      updateLayout();
    }
  }}
/>
```
{% endraw %}

## 最佳实践

1. **配置分组**
   {% raw %}
   ```tsx
   <JsonEditor
     // 1. 基础配置
     defaultValue={initialValue}
     readOnly={isReadOnly}
     
     // 2. 编辑器设置
     codeSettings={{...}}
     
     // 3. 功能配置
     schemaConfig={{...}}
     decorationConfig={{...}}
     
     // 4. 界面配置
     themeConfig={{...}}
     toolbarConfig={{...}}
     
     // 5. 事件处理
     onValueChange={handleChange}
     onError={handleError}
   />
   ```
   {% endraw %}

2. **性能优化**
   - 避免过于频繁的 `onValueChange` 处理
   - 合理使用 `React.memo` 包装自定义组件

3. **错误处理**
   {% raw %}
   ```tsx
   <JsonEditor
     onError={(error) => {
       // 1. 日志记录
       logger.error('Editor error:', error);
       
       // 2. 用户提示
       notification.error({
         message: '编辑器错误',
         description: error.message
       });
       
       // 3. 错误上报
       errorTracker.capture(error);
     }}
   />
   ```
   {% endraw %}

4. **主题切换**
   {% raw %}
   ```tsx
   const [theme, setTheme] = useState('light');
   
   <JsonEditor
     themeConfig={{
       theme
     }}
   />
   ```
   {% endraw %}

5. **动态配置**

## 类型定义

完整的类型定义请参考 [types.ts](https://github.com/bagaking/jsoneditor/blob/main/src/ui/types.ts)。

```typescript
export interface JsonEditorProps {
  defaultValue?: string;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
  
  onValueChange?: (value: string) => void;
  onError?: (error: Error) => void;
  onCopy?: (content: string) => void;
  
  codeSettings?: CodeSettings;
  schemaConfig?: SchemaConfig;
  themeConfig?: ThemeConfig;
  decorationConfig?: DecorationConfig;
  validationConfig?: ValidationConfig;
  extensions?: Extension[];
  toolbarConfig?: ToolbarConfig & ComponentStyles;
  statusBarConfig?: StatusBarConfig;
  schemaInfoConfig?: SchemaInfoConfig;
  expandOption?: ExpandOption;
}

// ... 其他类型定义请参考源码
```
