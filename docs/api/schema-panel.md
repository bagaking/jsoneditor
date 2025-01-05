---
layout: default
title: Schema 面板配置
description: JSON Editor Schema 面板配置文档，包含类型显示、字段描述和布局设置的详细说明
keywords: JSON Editor, Schema Panel, JSON Schema, Type Display, Field Description, Layout Configuration
parent: API 参考
nav_order: 5
---

# Schema 面板配置

> "优秀的编辑体验源于对数据结构的深刻理解。Schema 面板不仅是类型的展示器，更是数据建模的助手。"

## 设计哲学

Schema 面板是 JSON 编辑器的一个核心创新。它突破了传统编辑器"看到什么编辑什么"的局限，引入了"理解所编辑的内容"的维度。通过实时展示当前字段的类型信息、约束条件和上下文关系，它能帮助用户：

1. **快速理解** 数据结构
2. **准确编辑** 字段内容
3. **及时发现** 潜在问题
4. **高效导航** 复杂结构

## 核心配置

```typescript
interface SchemaInfoConfig {
    // 基础样式
    className?: string;
    style?: React.CSSProperties;

    // 布局配置
    layout?: {
        showDescription?: boolean;  // 显示描述
        showPath?: boolean;         // 显示路径
        showType?: boolean;         // 显示类型
        showRequired?: boolean;     // 显示必填标记
        order?: string[];          // 显示顺序
        dividerStyle?: React.CSSProperties;
    };
}
```

💡 **最佳实践**: 建议保持所有信息项的显示，它们各自承担着不同的职责：
- 描述信息帮助理解字段的业务含义
- 路径信息便于定位和引用
- 类型信息指导数据录入
- 必填标记预防数据缺失

## 输入控件系统

Schema 面板最强大的特性是其智能输入控件系统。它能根据字段类型自动选择最适合的输入方式：

```typescript
inputs?: {
    // 基础配置
    baseStyle?: React.CSSProperties;
    className?: string;

    // 特定类型配置
    dateTime?: DateTimeConfig;
    color?: ColorConfig;
    enum?: EnumConfig;
    boolean?: BooleanConfig;
}
```

### 日期时间控件

```typescript
interface DateTimeConfig {
    showTime?: boolean;      // 是否显示时间
    format?: string;         // 日期格式
    icons?: {
        date?: React.ReactNode;
        time?: React.ReactNode;
    };
}
```

示例：自定义日期时间输入
{% raw %}
```tsx
<JsonEditor
  schemaInfoConfig={{
    inputs: {
      dateTime: {
        showTime: true,
        format: "YYYY-MM-DD HH:mm",
        icons: {
          date: <CalendarIcon />,
          time: <ClockIcon />
        }
      }
    }
  }}
/>
```
{% endraw %}

### 颜色控件

```typescript
interface ColorConfig {
    showPicker?: boolean;   // 显示取色器
    showInput?: boolean;    // 显示输入框
    format?: 'hex' | 'rgb' | 'hsl';
}
```

### 枚举控件

```typescript
interface EnumConfig {
    renderItem?: (value: any) => React.ReactNode;
    placeholder?: string;
}
```

### 布尔控件

```typescript
interface BooleanConfig {
    type?: 'switch' | 'checkbox' | 'button';
    labels?: {
        true?: string;
        false?: string;
    };
}
```

## 格式化系统

Schema 面板支持对显示内容进行自定义格式化：

```typescript
format?: {
    path?: (path: string) => string;
    type?: (type: string, format?: string) => string;
    description?: (desc: string) => string;
}
```

## 实战示例

### 基础配置
{% raw %}
```tsx
// 默认配置，显示所有信息
<JsonEditor
  schemaInfoConfig={{
    layout: {
      showDescription: true,
      showPath: true,
      showType: true,
      showRequired: true
    }
  }}
/>
```
{% endraw %}

### API 文档场景
{% raw %}
```tsx
// 强调字段描述和类型
<JsonEditor
  schemaInfoConfig={{
    layout: {
      order: ['description', 'type', 'required'],
      dividerStyle: { margin: '0 8px' }
    },
    format: {
      // 美化类型显示
      type: (type, format) => {
        if (format) return `${type} (${format})`;
        return type;
      },
      // 支持 Markdown 描述
      description: (desc) => marked(desc)
    }
  }}
/>
```
{% endraw %}

### 数据录入场景
{% raw %}
```tsx
// 优化输入体验
<JsonEditor
  schemaInfoConfig={{
    inputs: {
      // 日期时间
      dateTime: {
        showTime: true,
        format: "YYYY-MM-DD HH:mm"
      },
      // 枚举选项
      enum: {
        renderItem: (value) => ({
          true: '是',
          false: '否'
        }[value] || value)
      },
      // 开关控件
      boolean: {
        type: 'switch',
        labels: { true: '启用', false: '禁用' }
      }
    }
  }}
/>
```
{% endraw %}

## 性能优化

Schema 面板在处理大型 Schema 时可能面临性能挑战。以下是一些优化建议：

1. **按需渲染**: 默认只渲染可见区域的 Schema 信息
2. **缓存处理**: 缓存已解析的 Schema 路径
3. **延迟加载**: 复杂的输入控件采用延迟加载
4. **虚拟滚动**: 处理大量枚举选项时使用虚拟列表

## 常见问题

1. **Q: 如何处理循环引用的 Schema？**  
   A: Schema 面板会自动检测循环引用，并以引用路径替代完整展开。

2. **Q: 自定义输入控件如何与编辑器状态同步？**  
   A: 使用 `onValueChange` 回调，面板会自动处理数据同步。

3. **Q: 如何添加自定义的字段验证？**  
   A: 可以通过 Schema 的 `validate` 关键字自定义验证规则。

## 未来规划

1. 支持更多特殊类型的输入控件
2. 增强 Schema 关系可视化
3. 提供更多的格式化选项
4. 优化大型 Schema 的性能

> 💡 **技术思考**: Schema 面板的设计体现了"理解数据"的理念。通过将 Schema 从单纯的验证规则提升为交互界面的核心元素，我们让数据编辑变得更加智能和友好。这种设计思路启发我们：好的工具不仅要服务于当前的需求，更要助力用户达到更高的工作效率。