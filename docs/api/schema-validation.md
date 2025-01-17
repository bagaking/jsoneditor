---
layout: default
title: Schema 验证
description: JSON Editor 当前 Schema 验证配置边界
keywords: JSON Editor, Schema Validation, JSON Schema, AJV, Error Handling
parent: API 参考
nav_order: 6
---

# Schema 验证

`JsonEditor` 使用 AJV 和 `ajv-formats` 验证当前 JSON 内容。当前公开入口是 `schemaConfig.schema`、`validationConfig.validateOnChange` 和 `onError`。`validateOnChange` 默认为 `true`；设为 `false` 时，输入变化不会自动触发解析或 Schema 验证。

## 基础配置

{% raw %}
```tsx
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      description: '用户名称'
    },
    email: {
      type: 'string',
      format: 'email'
    }
  },
  required: ['name', 'email']
};

<JsonEditor
  schemaConfig={{ schema }}
  validationConfig={{ validateOnChange: true }}
  onError={(error) => {
    console.error('Schema validation error:', error.message);
  }}
/>
```
{% endraw %}

## 支持范围

Schema 对象会交给 AJV 编译和验证。AJV 支持的标准 JSON Schema 关键字可以直接写在 `schemaConfig.schema` 内，例如：

```json
{
  "type": "object",
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "enabled": {
      "type": "boolean"
    }
  },
  "required": ["version"]
}
```

`ajv-formats` 已启用，因此常见格式如 `email`、`uri`、`date-time` 可用于 Schema。

## 错误处理

验证失败时，组件会更新内部错误状态，并通过 `onError` 传出 `Error`：

{% raw %}
```tsx
<JsonEditor
  schemaConfig={{ schema }}
  validationConfig={{ validateOnChange: true }}
  onError={(error) => {
    notification.error({
      message: '验证错误',
      description: error.message
    });
  }}
/>
```
{% endraw %}

当前组件没有公开的 `errorRenderer`、`errorHandler`、`validateMode` 或验证防抖配置。

## Schema 面板

当光标位置能映射到 `schemaConfig.schema` 中的字段时，组件会显示内部 Schema 信息面板。当前 `schemaInfoConfig` 只透传面板容器的 `className` 和 `style`：

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

当前组件没有公开的 Schema 面板布局、格式化器或输入控件配置。
