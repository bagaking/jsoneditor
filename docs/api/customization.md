---
layout: default
title: 定制化指南
description: JSON Editor 当前公开定制入口说明
keywords: JSON Editor, Customization, Theming, Style, Toolbar, Decoration
parent: API 参考
nav_order: 8
---

# 定制化指南

本文只列出当前组件已经接线的定制入口。未在这里列出的主题变量、状态栏格式化器、Schema 面板布局配置或工具栏按钮对象形状，不应当当作当前公开能力使用。

## 样式入口

需要内置样式时，在应用入口导入发布包样式：

```tsx
import '@bagaking/jsoneditor/style.css';
```

`JsonEditor` 外层容器支持 `className` 和 `style`：

{% raw %}
```tsx
<JsonEditor
  className="rounded-md border"
  style={{ height: 420 }}
/>
```
{% endraw %}

通过 `decorationConfig` 传入的业务 class 不会由发布包自动生成 CSS。如果这些 class 来自 Tailwind，需要由消费方应用自己的 Tailwind content 扫描或 safelist 覆盖。

## 主题

`themeConfig` 当前使用内置亮色和暗色主题：

{% raw %}
```tsx
<JsonEditor
  themeConfig={{ theme: 'dark' }}
/>
```
{% endraw %}

如果需要额外 CodeMirror 扩展，请使用顶层 `extensions` prop：

{% raw %}
```tsx
import type { Extension } from '@codemirror/state';

function EditorWithExtensions({ extensions }: { extensions: Extension[] }) {
  return (
    <JsonEditor
      defaultValue="{}"
      extensions={extensions}
    />
  );
}
```
{% endraw %}

当前组件没有 `themeConfig.vars`、`themeConfig.components` 或主题变量继承 API。

## 工具栏

工具栏可通过 `toolbarConfig.features` 开关内置按钮，并通过 `className`、`style` 调整工具栏容器。

{% raw %}
```tsx
<JsonEditor
  toolbarConfig={{
    features: {
      format: true,
      minify: true,
      validate: true,
      copy: true,
      expand: true
    },
    className: 'custom-toolbar',
    style: { borderBottom: '1px solid #e5e7eb' }
  }}
/>
```
{% endraw %}

自定义按钮使用 `key` 和 `render`。`render` 接收当前 `EditorCore` 实例，按钮内容和交互由返回的 React 节点实现。

{% raw %}
```tsx
<JsonEditor
  toolbarConfig={{
    customButtons: [
      {
        key: 'save',
        render: (editor) => (
          <button
            type="button"
            onClick={() => saveToServer(editor.getValue())}
          >
            保存
          </button>
        )
      }
    ]
  }}
/>
```
{% endraw %}

`format`、`minify` 和 `validate` 是工具栏功能开关，不是 `EditorCore` ref 方法。

## 状态栏和 Schema 面板

当前 `JsonEditor` 只把 `statusBarConfig.className`、`statusBarConfig.style` 传给状态栏：

{% raw %}
```tsx
<JsonEditor
  statusBarConfig={{
    className: 'custom-status',
    style: { borderTop: '1px solid #e5e7eb' }
  }}
/>
```
{% endraw %}

当前 `JsonEditor` 只把 `schemaInfoConfig.className`、`schemaInfoConfig.style` 传给 Schema 信息面板：

{% raw %}
```tsx
<JsonEditor
  schemaConfig={{ schema }}
  schemaInfoConfig={{
    className: 'custom-schema-panel',
    style: { borderTop: '1px solid #bfdbfe' }
  }}
/>
```
{% endraw %}

## 路径装饰

`decorationConfig.paths` 可以按 JSON path 装饰 key、value 或两者。`style` 支持内置样式名、普通 class 字符串或 `CustomComponent`；`onClick` 和 `icon` 会在目标值旁添加操作按钮。

{% raw %}
```tsx
import { JsonEditor, rocketActionIcon } from '@bagaking/jsoneditor';

<JsonEditor
  defaultValue={JSON.stringify({ version: '1.0.0', status: 'active' }, null, 2)}
  decorationConfig={{
    paths: {
      '$["version"]': {
        target: 'value',
        style: 'italic bg-blue-100/30 rounded px-1',
        onClick: (value) => showVersionHistory(value)
      },
      '$["status"]': {
        target: 'both',
        style: 'text-green-600 font-medium',
        icon: rocketActionIcon
      }
    }
  }}
/>
```
{% endraw %}

当前 `DecorationPathHook` 没有 `tooltip` 字段，也不支持 `(value) => styleObject` 形式的样式函数。
