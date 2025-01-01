# @bagaking/jsoneditor

一个功能强大的 **JSON 编辑器组件**，支持 *JSON Schema 验证*、*路径高亮*、*主题切换*、*自定义操作*等功能。

## 在线演示

- [CodeSandbox Demo](https://codesandbox.io/s/bagaking-jsoneditor-demo)
- [StackBlitz Demo](https://stackblitz.com/edit/bagaking-jsoneditor-demo)

或者克隆仓库本地运行：

```bash
git clone https://github.com/bagaking/jsoneditor.git
cd jsoneditor
pnpm install
pnpm dev
```

## 特性

- 🎨 **主题支持**
  - 支持明暗主题切换
  - 可自定义主题样式
- 🔍 **JSON 路径**
  - 路径高亮和提示
  - 支持路径点击和自定义操作
  - 支持路径装饰器
- 📝 **编辑增强**
  - 格式化和压缩功能
  - 智能提示和自动补全
  - 支持 JSON5 语法
- ✨ **Schema 支持**
  - [JSON Schema](https://json-schema.org/) 验证 (Draft 2020-12)
  - 实时错误提示
  - 基于 Schema 的自动补全
  - 支持枚举、日期、颜色等特殊类型
- 🎯 **状态栏**
  - 光标位置显示
  - 文档大小统计
  - 错误信息展示
- 💡 **开发友好**
  - TypeScript 支持
  - 丰富的编程接口
  - 灵活的扩展机制

## 安装

```bash
pnpm add @bagaking/jsoneditor
# 或
npm install @bagaking/jsoneditor
# 或
yarn add @bagaking/jsoneditor
```

## 基础使用

```tsx
import { JsonEditor } from '@bagaking/jsoneditor';
import { useState } from 'react';

function App() {
  const [value, setValue] = useState('{"name": "bagaking"}');
  const [error, setError] = useState<Error | null>(null);

  return (
    <JsonEditor
      defaultValue={value}
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

## 高级用法

### Schema 验证

本组件使用 [JSON Schema](https://json-schema.org/) 进行数据验证和自动补全。支持 [Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html) 规范。

示例：

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
    },
    color: {
      type: 'string',
      format: 'color',
      description: '主题色'
    },
    updateTime: {
      type: 'string',
      format: 'date-time',
      description: '更新时间'
    },
    homepage: {
      type: 'string',
      format: 'uri',
      description: '项目主页'
    }
  },
  required: ['name', 'version']
};

function App() {
  return (
    <JsonEditor
      defaultValue={JSON.stringify({
        name: 'my-project',
        version: '1.0.0',
        color: '#2080ff',
        updateTime: '2024-01-01T00:00:00Z',
        homepage: 'https://github.com/bagaking/jsoneditor'
      }, null, 2)}
      schemaConfig={{
        schema,
        validateOnType: true,
        validateDebounce: 300
      }}
      validationConfig={{
        validateOnChange: true,
        autoFormat: false
      }}
    />
  );
}
```

### 自定义路径装饰

```tsx
import { JsonEditor } from '@bagaking/jsoneditor';

function App() {
  return (
    <JsonEditor
      defaultValue={value}
      onValueChange={setValue}
      decorationConfig={{
        paths: {
          // 版本号使用特殊样式
          '$["version"]': {
            style: "italic bg-blue-100/30 rounded px-1",
            onClick: (value) => console.log('Version:', value)
          },
          // 状态使用不同颜色
          '$["status"]': {
            style: "text-green-600 font-medium",
            onClick: (value) => console.log('Status:', value)
          },
          // 时间使用自定义组件
          '$["createdAt"]': {
            style: {
              type: 'component',
              render: ({ value }) => {
                const date = new Date(value);
                const el = document.createElement('span');
                el.className = 'text-gray-600';
                el.textContent = `📅 ${date.toLocaleDateString()}`;
                return el;
              }
            }
          }
        }
      }}
    />
  );
}
```

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

## API

### JsonEditor Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| className | string | - | 自定义类名 |
| style | React.CSSProperties | - | 自定义样式 |
| defaultValue | string | - | 初始值 |
| readOnly | boolean | false | 是否只读 |
| onValueChange | (value: string) => void | - | 值变化回调 |
| onError | (error: Error) => void | - | 错误回调 |
| codeSettings | CodeSettings | {} | 编辑器设置 |
| schemaConfig | SchemaConfig | - | Schema 配置 |
| themeConfig | ThemeConfig | - | 主题配置 |
| decorationConfig | DecorationConfig | - | 装饰器配置 |
| validationConfig | ValidationConfig | - | 验证配置 |
| toolbarConfig | ToolbarConfig | - | 工具栏配置 |
| expandOption | ExpandOption | - | 展开/收缩配置 |

### CodeSettings

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| fontSize | number | 14 | 字体大小 |
| lineNumbers | boolean | true | 是否显示行号 |
| bracketMatching | boolean | true | 是否启用括号匹配 |
| autoCompletion | boolean | true | 是否启用自动完成 |
| highlightActiveLine | boolean | true | 是否高亮当前行 |

### SchemaConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| schema | object | - | JSON Schema 定义 |
| validateOnType | boolean | true | 是否在输入时验证 |
| validateDebounce | number | 300 | 验证防抖时间(ms) |

### ThemeConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| theme | 'light' \| 'dark' | 'light' | 主题类型 |
| themeExtensions | Extension[] | - | 自定义主题扩展 |

### ValidationConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| validateOnChange | boolean | true | 是否在更改时验证 |
| autoFormat | boolean | false | 是否自动格式化 |

### DecorationConfig

| 属性 | 类型 | 说明 |
|------|------|------|
| paths | Record<string, PathDecoration> | 路径装饰配置 |
| urlHandler | { component?: CustomComponent; onClick?: (url: string) => void } | URL 处理配置 |

### PathDecoration

| 属性 | 类型 | 说明 |
|------|------|------|
| style | string \| CustomComponent | 装饰样式 |
| onClick | (value: string) => void | 点击回调 |

### ToolbarConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| position | 'top' \| 'bottom' \| 'none' | 'top' | 工具栏位置 |
| features | { format?: boolean; minify?: boolean; validate?: boolean; copy?: boolean; expand?: boolean } | - | 功能开关 |
| customButtons | Array<{ key: string; render: (editor: EditorCore) => React.ReactNode }> | - | 自定义按钮 |

### ExpandOption

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| defaultExpanded | boolean | false | 默认是否展开 |
| collapsedLines | number | - | 收起状态显示的行数 |
| animation | { enabled?: boolean; duration?: number; timing?: string } | - | 动画配置 |
| onExpandChange | (expanded: boolean) => void | - | 展开状态变化回调 |

## 许可证

MIT 