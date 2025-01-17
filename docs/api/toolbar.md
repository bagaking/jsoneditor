---
layout: default
title: 工具栏配置
description: JSON Editor 当前工具栏配置边界
keywords: JSON Editor, Toolbar, Configuration, Buttons, Customization
parent: API 参考
nav_order: 3
---

# 工具栏配置

工具栏由 `JsonEditor` 内部渲染。格式化、压缩、验证、复制和展开是组件工具栏行为，不是 `EditorCore` ref 方法。

## 内置按钮

用 `toolbarConfig.features` 开关内置按钮：

```typescript
interface ToolbarConfig {
  position?: 'none';
  className?: string;
  style?: React.CSSProperties;
  features?: {
    format?: boolean;
    minify?: boolean;
    validate?: boolean;
    copy?: boolean;
    expand?: boolean;
  };
  customButtons?: Array<{
    key: string;
    render: (editor: EditorCore) => React.ReactNode;
  }>;
}
```

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

`position: 'none'` 会隐藏工具栏。其他位置值当前不改变布局。

## 自定义按钮

自定义按钮只接收 `key` 和 `render`。`render` 的参数是当前 `EditorCore` 实例。

{% raw %}
```tsx
<JsonEditor
  toolbarConfig={{
    customButtons: [
      {
        key: 'export',
        render: (editor) => (
          <button
            type="button"
            onClick={() => exportData(editor.getValue())}
          >
            导出
          </button>
        )
      }
    ]
  }}
/>
```
{% endraw %}

当前公开的 `ToolbarConfig` 没有按钮排序、按钮分组、按钮样式或分隔符样式配置。需要更复杂的按钮外观或布局时，请通过 `customButtons.render` 返回自定义 React 节点。
