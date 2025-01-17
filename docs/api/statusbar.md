---
layout: default
title: 状态栏配置
description: JSON Editor 当前状态栏配置边界
keywords: JSON Editor, Status Bar, Configuration, Error Display, Cursor Position, Document Size
parent: API 参考
nav_order: 4
---

# 状态栏配置

状态栏由 `JsonEditor` 内部渲染，显示当前错误或验证状态、光标位置和文档大小。

## 当前配置

`JsonEditor` 当前只把 `statusBarConfig.className` 和 `statusBarConfig.style` 传给状态栏容器：

```typescript
interface StatusBarConfig {
  className?: string;
  style?: React.CSSProperties;
}
```

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

当前组件没有公开的状态栏显示项开关、格式化器、图标配置或布局配置。状态栏内容由组件内部状态决定。
