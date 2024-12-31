# @bagaking/jsoneditor

一个功能强大的 JSON 编辑器组件，支持 JSON 路径高亮、主题切换、自定义操作等功能。

## 特性

- 🎨 支持明暗主题切换
- 🔍 JSON 路径高亮和提示
- 🛠 自定义路径操作按钮
- 📝 格式化和压缩功能
- 📋 一键复制
- 🎯 展开/收起长内容
- 💡 智能提示
- 🎮 丰富的编程接口

## 安装

```bash
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
      onValueChange={setValue}
      showJsonPath
      theme="light"
    />
  );
}
```

## 高级用法

### 自定义路径操作

```tsx
import { JsonEditor, JsonPath } from '@bagaking/jsoneditor';
import { CopyOutlined, EditOutlined } from '@ant-design/icons';

function App() {
  const pathActions = [
    {
      icon: <CopyOutlined />,
      tooltip: '复制路径',
      onClick: (path: JsonPath) => {
        navigator.clipboard.writeText(path.path);
      },
    },
    {
      icon: <EditOutlined />,
      tooltip: '编辑值',
      onClick: (path: JsonPath) => {
        console.log('编辑:', path.value);
      },
    },
  ];

  return (
    <JsonEditor
      value={value}
      onValueChange={setValue}
      pathActions={pathActions}
    />
  );
}
```

### 使用 Ref

```tsx
import { JsonEditor, JsonEditorRef } from '@bagaking/jsoneditor';
import { useRef } from 'react';

function App() {
  const editorRef = useRef<JsonEditorRef>(null);

  const handleFormat = () => {
    editorRef.current?.format();
  };

  return (
    <>
      <button onClick={handleFormat}>格式化</button>
      <JsonEditor
        ref={editorRef}
        value={value}
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
| value | string | - | 编辑器的值 |
| onValueChange | (value: string) => void | - | 值变化回调 |
| style | React.CSSProperties | - | 自定义样式 |
| className | string | - | 自定义类名 |
| padding | number | 16 | 内边距 |
| minHeight | string | '300px' | 最小高度 |
| readOnly | boolean | false | 是否只读 |
| fontSize | number \| string | 14 | 字体大小 |
| showCopyButton | boolean | true | 是否显示复制按钮 |
| copySuccessMessage | string | '已复制到剪贴板' | 复制成功提示文字 |
| expandOption | { defaultExpanded?: boolean; shrinkLines?: number } | - | 展开配置 |
| onExpandChange | (expanded: boolean) => void | - | 展开状态变化回调 |
| enableLinkPreview | boolean | true | 是否启用链接预览 |
| customExtensions | Extension[] | - | 自定义扩展 |
| pathActions | PathAction[] | - | 路径操作配置 |
| showJsonPath | boolean | true | 是否显示JSON路径 |
| onPathClick | (path: JsonPath) => void | - | 路径点击回调 |
| theme | 'light' \| 'dark' \| 'custom' | 'light' | 主题配置 |
| customTheme | Record<string, any> | - | 自定义主题配置 |

### JsonEditorRef

| 方法 | 类型 | 说明 |
|------|------|------|
| getValue | () => string | 获取当前值 |
| setValue | (value: string) => void | 设置新值 |
| format | () => void | 格式化内容 |
| compress | () => void | 压缩内容 |
| insert | (content: string, position?: number) => void | 插入内容 |
| getSelection | () => string | 获取选中内容 |
| getCursor | () => { line: number; ch: number } | 获取光标位置 |
| setCursor | (position: { line: number; ch: number }) => void | 设置光标位置 |
| focus | () => void | 聚焦编辑器 |
| blur | () => void | 失焦编辑器 |

## 许可证

MIT 