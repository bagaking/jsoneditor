---
layout: default
title: Schema 面板配置
description: JSON Editor 当前 Schema 面板配置边界
keywords: JSON Editor, Schema Panel, JSON Schema, Type Display, Field Description
parent: API 参考
nav_order: 5
---

# Schema 面板配置

Schema 面板由 `JsonEditor` 内部渲染。当光标位置能映射到 `schemaConfig.schema` 中的字段时，组件会显示该字段的描述、路径、类型和可编辑控件。

## 当前配置

`JsonEditor` 当前只把 `schemaInfoConfig.className` 和 `schemaInfoConfig.style` 传给 Schema 面板容器：

```typescript
interface SchemaInfoConfig {
  className?: string;
  style?: React.CSSProperties;
}
```

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

当前组件没有公开的 Schema 面板布局、格式化器或输入控件配置。面板显示内容和内置输入控件由组件内部实现决定。
