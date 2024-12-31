# @bagaking/jsoneditor

一个功能强大的 **JSON 编辑器组件**，支持 *JSON Schema 验证*、*路径高亮*、*主题切换*、*自定义操作*等功能。

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

  return (
    <JsonEditor
      value={value}
      onChange={setValue}
      theme="light"
    />
  );
}
```

## 高级用法

### Schema 验证

本组件使用 [JSON Schema](https://json-schema.org/) 进行数据验证和自动补全。支持 [Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html) 规范，并通过 [ajv](https://ajv.js.org/) 实现。

除了标准的 JSON Schema 功能外，还支持以下扩展格式：
- `date-time`: ISO 8601 日期时间格式
- `color`: CSS 颜色值 (如 #RRGGBB)
- `email`: 电子邮件地址
- `uri`: URI 格式
- `uuid`: UUID 格式
- `regex`: 正则表达式

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
      config={{
        schema,
        validateOnType: true
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
      value={value}
      config={{
        decoration: {
          paths: {
            '$["name"]': {
              style: 'underline',
              onClick: (value) => console.log('Name clicked:', value)
            },
            '$["version"]': {
              style: {
                type: 'component',
                render: ({ value, onClick }) => (
                  <button onClick={() => onClick?.(value)}>
                    v{value}
                  </button>
                )
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
import { JsonEditor } from '@bagaking/jsoneditor';
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
        value={value}
        onChange={setValue}
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
| onChange | (value: string) => void | - | 值变化回调 |
| onError | (error: Error) => void | - | 错误回调 |
| config | EditorConfig | {} | 编辑器配置 |

### EditorConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| schema | JsonSchemaProperty | - | [JSON Schema](https://json-schema.org/) 定义 |
| theme | 'light' \| 'dark' | 'light' | 主题 |
| validateOnType | boolean | false | 是否在输入时验证 |
| decoration | DecorationConfig | - | 装饰器配置 |
| onValidate | (errors: Diagnostic[]) => void | - | 验证回调 |
| onCursorActivity | (info: { line: number; col: number }) => void | - | 光标位置变化回调 |
| onDocChanged | (info: { lines: number; bytes: number }) => void | - | 文档变化回调 |

### DecorationConfig

| 属性 | 类型 | 说明 |
|------|------|------|
| paths | Record<string, PathDecoration> | 路径装饰配置 |
| urlHandler | { component?: CustomComponent; onClick?: (url: string) => void } | URL 处理配置 |

### PathDecoration

| 属性 | 类型 | 说明 |
|------|------|------|
| style | string \| { type: 'component'; render: (props: { value: string; onClick?: (value: string) => void }) => HTMLElement } | 装饰样式 |
| onClick | (value: string) => void | 点击回调 |

## 许可证

MIT 