# Schema 验证

> "Schema 验证不仅是一种约束，更是一种保护。它帮助我们在编辑过程中及时发现问题，确保数据的正确性和一致性。"

## 基础概念

### 什么是 Schema 验证？

Schema 验证是一种确保 JSON 数据符合预定义结构和规则的机制。通过 Schema，我们可以：

- 定义数据的类型和格式
- 设置必填字段
- 限制数值范围
- 指定字符串模式
- 定义复杂的嵌套结构
- 添加字段说明

### 为什么需要 Schema 验证？

1. **数据质量保证**
   - 防止数据类型错误
   - 确保必填字段存在
   - 验证数据格式正确

2. **开发体验提升**
   - 实时错误提示
   - 智能字段提示
   - 自动完成建议

3. **文档化支持**
   - 字段说明文档化
   - 数据结构可视化
   - 接口约定明确化

## 配置 Schema

### 基础配置

{% raw %}
```tsx
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: '用户名称'
    },
    age: {
      type: 'number',
      minimum: 0,
      maximum: 120
    },
    email: {
      type: 'string',
      format: 'email'
    }
  },
  required: ['name', 'email']
};

<JsonEditor
  schemaConfig={{
    schema: schema,
    validateOnType: true
  }}
/>
```
{% endraw %}

### 验证时机

{% raw %}
```tsx
<JsonEditor
  schemaConfig={{
    schema: schema,
    validateOnType: true,    // 输入时验证
    validateOnBlur: true,    // 失焦时验证
    validateOnChange: true   // 内容变化时验证
  }}
/>
```
{% endraw %}

### 验证配置

{% raw %}
```tsx
<JsonEditor
  validationConfig={{
    validateOnChange: true,
    validateDebounce: 300,   // 验证防抖
    validateMode: 'strict'   // 严格模式
  }}
/>
```
{% endraw %}

## Schema 定义

### 基础类型

```json
{
  "type": "object",
  "properties": {
    "string_field": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "number_field": {
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "boolean_field": {
      "type": "boolean"
    },
    "array_field": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "minItems": 1,
      "maxItems": 5
    }
  }
}
```

### 复杂类型

```json
{
  "type": "object",
  "properties": {
    "user": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "contacts": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": {
                "type": "string",
                "enum": ["email", "phone"]
              },
              "value": {
                "type": "string"
              }
            },
            "required": ["type", "value"]
          }
        }
      }
    }
  }
}
```

### 条件验证

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": ["personal", "business"]
    },
    "taxId": {
      "type": "string"
    }
  },
  "required": ["type"],
  "if": {
    "properties": {
      "type": { "const": "business" }
    }
  },
  "then": {
    "required": ["taxId"]
  }
}
```

## 错误处理

### 基础错误处理

{% raw %}
```tsx
<JsonEditor
  schemaConfig={{
    schema: schema
  }}
  onError={(error) => {
    if (error.name === 'ValidationError') {
      console.error('验证错误:', error.message);
      // 处理验证错误...
    }
  }}
/>
```
{% endraw %}

### 自定义错误展示

{% raw %}
```tsx
<JsonEditor
  schemaConfig={{
    schema: schema,
    errorRenderer: (error) => ({
      message: `${error.path}: ${error.message}`,
      type: error.severity
    })
  }}
/>
```
{% endraw %}

### 错误聚合

{% raw %}
```tsx
<JsonEditor
  validationConfig={{
    // 聚合多个错误
    validateMode: 'collect',
    // 错误处理器
    errorHandler: (errors) => {
      const messages = errors.map(err => 
        `${err.path}: ${err.message}`
      );
      notification.error({
        message: '验证错误',
        description: messages.join('\n')
      });
    }
  }}
/>
```
{% endraw %}

## Schema 面板配置

### 基础配置

{% raw %}
```tsx
<JsonEditor
  schemaInfoConfig={{
    layout: {
      showDescription: true,  // 显示描述
      showPath: true,         // 显示路径
      showType: true,         // 显示类型
      showRequired: true      // 显示必填标记
    }
  }}
/>
```
{% endraw %}

### 自定义显示

{% raw %}
```tsx
<JsonEditor
  schemaInfoConfig={{
    layout: {
      order: ['description', 'type', 'required'],
      dividerStyle: { margin: '0 8px' }
    },
    format: {
      // 自定义类型显示
      type: (type, format) => {
        if (format) return `${type} (${format})`;
        return type;
      },
      // 自定义描述显示
      description: (desc) => marked(desc)
    }
  }}
/>
```
{% endraw %}

## 最佳实践

1. **Schema 设计**
   - 保持 Schema 结构清晰
   - 添加有意义的描述
   - 合理使用必填字段
   - 适当设置默认值

2. **验证配置**
   - 根据场景选择验证时机
   - 合理设置验证防抖
   - 选择合适的验证模式

3. **错误处理**
   - 提供友好的错误提示
   - 合理分类错误类型
   - 适当聚合错误信息

4. **性能优化**
   - 避免过于复杂的 Schema
   - 合理使用验证防抖
   - 按需加载 Schema

## 常见问题

### 1. 验证不生效

检查以下几点：
- Schema 格式是否正确
- 验证配置是否启用
- 验证时机是否合适

### 2. 性能问题

优化建议：
- 使用验证防抖
- 简化 Schema 结构
- 避免频繁验证

### 3. 错误提示不友好

改进方法：
- 自定义错误渲染
- 添加详细的描述
- 使用多语言支持

> 💡 **小贴士**: Schema 验证是保证数据质量的重要手段，但也要注意平衡验证的严格程度和用户体验。过于严格的验证可能会影响用户的编辑效率，而过于宽松的验证可能会导致数据质量问题。找到合适的平衡点是关键。 