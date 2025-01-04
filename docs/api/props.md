# API 参考

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
| onCursorChange | (position: Position) => void | 当光标位置改变时触发 |
| onSelectionChange | (selection: Selection) => void | 当选区改变时触发 |

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
| fontFamily | string | 'monospace' | 编辑器字体 |
| lineNumbers | boolean | true | 是否显示行号 |
| lineHeight | number | 1.5 | 行高 |

### 编辑功能

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| bracketMatching | boolean | true | 是否启用括号匹配 |
| autoCloseBrackets | boolean | true | 是否自动闭合括号 |
| autoCompletion | boolean | true | 是否启用自动完成 |
| tabSize | number | 2 | Tab 缩进空格数 |

### 视觉效果

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| highlightActiveLine | boolean | true | 是否高亮当前行 |
| highlightSelectionMatches | boolean | true | 是否高亮选中文本的匹配项 |
| cursorBlinkRate | number | 1200 | 光标闪烁频率(ms) |

### 示例

{% raw %}
```tsx
<JsonEditor
  codeSettings={{
    // 基础设置
    fontSize: 14,
    fontFamily: "Fira Code, monospace",
    lineNumbers: true,
    lineHeight: 1.6,
    
    // 编辑功能
    bracketMatching: true,
    autoCloseBrackets: true,
    autoCompletion: true,
    tabSize: 2,
    
    // 视觉效果
    highlightActiveLine: true,
    highlightSelectionMatches: true,
    cursorBlinkRate: 800
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
| validateOnType | boolean | true | 是否在输入时实时验证 |
| validateDebounce | number | 300 | 验证防抖时间(ms) |

### 高级配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| customFormats | Record<string, FormatValidator> | - | 自定义格式验证器 |
| customKeywords | Record<string, KeywordDefinition> | - | 自定义关键字 |
| errorMessages | Record<string, string> | - | 自定义错误消息 |

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
    
    // 验证配置
    validateOnType: true,
    validateDebounce: 500,
    
    // 自定义格式
    customFormats: {
      "chinese-mobile": {
        validate: (str) => /^1[3-9]\d{9}$/.test(str),
        message: "请输入有效的中国大陆手机号"
      }
    },
    
    // 自定义错误消息
    errorMessages: {
      required: "该字段不能为空",
      minLength: "长度不能小于 {limit} 个字符",
      format: "格式不正确"
    }
  }}
/>
```
{% endraw %}

## 主题配置 (ThemeConfig)

控制编辑器的视觉主题。详见 [主题系统](./customization.md) 文档。

### 基础配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| theme | 'light' \| 'dark' \| Extension[] | 'light' | 主题类型或自定义主题 |
| themeExtensions | Extension[] | - | 主题扩展配置 |

### 变量配置

| 属性 | 类型 | 说明 |
|------|------|------|
| vars | ThemeVariables | 主题变量覆盖 |
| components | ComponentStyles | 组件样式覆盖 |

### 示例

{% raw %}
```tsx
<JsonEditor
  themeConfig={{
    // 基础主题
    theme: 'dark',
    
    // 主题变量
    vars: {
      primary: '#1890ff',
      editorBg: '#282c34',
      editorFg: '#abb2bf',
      selectionBg: '#3E4451'
    },
    
    // 组件样式
    components: {
      toolbar: {
        background: '#21252b',
        buttonHoverBg: '#2c313a'
      },
      statusBar: {
        background: '#21252b',
        textColor: '#9da5b4'
      }
    }
  }}
/>
```
{% endraw %}

## 装饰配置 (DecorationConfig)

控制 JSON 路径的装饰效果。详见 [装饰系统](./decoration.md) 文档。

### 路径装饰

| 属性 | 类型 | 说明 |
|------|------|------|
| paths | Record<string, PathDecoration> | 路径装饰配置映射 |
| urlHandler | URLHandler | URL 点击处理配置 |

### PathDecoration

| 属性 | 类型 | 说明 |
|------|------|------|
| style | string \| CustomComponent | 装饰样式或自定义组件 |
| onClick | (value: any) => void | 点击回调函数 |
| tooltip | string \| React.ReactNode | 悬浮提示内容 |

### 示例

{% raw %}
```tsx
<JsonEditor
  decorationConfig={{
    paths: {
      // 版本号装饰
      '$["version"]': {
        style: "italic bg-blue-100/30 rounded px-1",
        onClick: (value) => showVersionHistory(value),
        tooltip: "点击查看版本历史"
      },
      
      // 状态装饰
      '$["status"]': {
        style: (value) => ({
          color: value === 'active' ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }),
        tooltip: "项目状态"
      },
      
      // 时间装饰
      '$["createdAt"]': {
        style: {
          type: 'component',
          render: ({ value }) => (
            <TimeDisplay 
              time={value}
              format="YYYY-MM-DD HH:mm:ss"
            />
          )
        }
      }
    },
    
    // URL 处理
    urlHandler: {
      component: ({ url }) => (
        <a 
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {url}
        </a>
      )
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
| position | 'top' \| 'bottom' \| 'none' | 'top' | 工具栏位置 |
| className | string | - | 自定义类名 |
| style | React.CSSProperties | - | 自定义样式 |

### 功能配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| features | ToolbarFeatures | - | 功能开关配置 |
| customButtons | CustomButton[] | - | 自定义按钮 |
| buttonStyles | ButtonStyles | - | 按钮样式配置 |

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
    
    // 自定义按钮
    customButtons: [
      {
        key: 'save',
        icon: <SaveIcon />,
        tooltip: '保存',
        onClick: (editor) => {
          const value = editor.getValue();
          saveToServer(value);
        }
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
    ],
    
    // 按钮样式
    buttonStyles: {
      base: {
        height: '32px',
        padding: '0 12px',
        borderRadius: '4px',
        transition: 'all 0.3s'
      },
      hover: {
        background: 'rgba(0,0,0,0.04)'
      },
      active: {
        background: 'rgba(0,0,0,0.08)'
      }
    }
  }}
/>
```
{% endraw %}

## 展开配置 (ExpandOption)

控制长内容的展开/收起功能。

### 基础配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| defaultExpanded | boolean | false | 默认是否展开 |
| collapsedLines | number | - | 收起状态显示的行数 |

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
   - 使用 `validateDebounce` 控制验证频率
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
       theme,
       // 确保主题相关的配置随主题切换而更新
       vars: theme === 'dark' ? darkVars : lightVars,
       components: theme === 'dark' ? darkComponents : lightComponents
     }}
   />
   ```
   {% endraw %}

5. **动态配置**

## 类型定义

完整的类型定义请参考 [types.ts](https://github.com/bagaking/jsoneditor/blob/main/src/types.ts)。

```typescript
export interface JsonEditorProps {
  defaultValue?: string;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
  
  onValueChange?: (value: string) => void;
  onError?: (error: Error) => void;
  onCursorChange?: (position: Position) => void;
  onSelectionChange?: (selection: Selection) => void;
  
  codeSettings?: CodeSettings;
  schemaConfig?: SchemaConfig;
  themeConfig?: ThemeConfig;
  decorationConfig?: DecorationConfig;
  toolbarConfig?: ToolbarConfig;
  expandOption?: ExpandOption;
}

// ... 其他类型定义请参考源码
```