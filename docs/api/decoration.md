---
layout: default
title: 装饰系统
description: JSON Editor 装饰系统文档，包含路径装饰、样式定制和交互功能的详细说明
keywords: JSON Editor, Decoration System, Path Decoration, Custom Styles, Interactive Features, Visual Enhancement
parent: API 参考
nav_order: 7
---

# 装饰系统

> "强大的装饰系统让 JSON 编辑器不仅是一个编辑器，更是一个可视化的数据交互平台。通过灵活的装饰配置，我们可以为 JSON 数据添加丰富的视觉和交互效果。"

## 概述

装饰系统允许你为 JSON 数据添加各种视觉增强和交互功能：

- 为特定路径的值添加样式
- 为 URL 添加可点击的链接
- 添加自定义的操作按钮
- 使用自定义组件渲染特定内容

## 配置接口

### DecorationConfig

装饰系统的主配置接口。

```typescript
interface DecorationConfig {
  // 路径装饰配置
  paths?: Record<string, PathDecoration>;
  
  // URL 处理配置
  urlHandler?: {
    component?: CustomComponent;
    onClick?: (url: string) => void;
    openInNewTab?: boolean;
  };
}

// 路径装饰配置
interface PathDecoration {
  // 装饰样式
  style: DecorationStyle;
  // 点击处理
  onClick?: (value: string) => void;
  // 自定义图标
  icon?: string;
  // 装饰目标
  target?: 'key' | 'value' | 'both';
}

// 装饰样式类型
type DecorationStyle = string | ComponentDecoration;

// 组件装饰
interface ComponentDecoration {
  type: 'component';
  component: CustomComponent;
}

// 自定义组件接口
interface CustomComponent {
  render: (props: {
    value: string;
    onClick?: (value: string) => void;
  }) => React.ReactNode;
}
```

## 基础用法

### 文本样式装饰

{% raw %}
```tsx
<JsonEditor
  defaultValue={`{
    "status": "active",
    "priority": "high",
    "url": "https://example.com"
  }`}
  decorationConfig={{
    paths: {
      "status": {
        style: "bold text-green-500",
        target: "value"
      },
      "priority": {
        style: "italic text-red-500",
        target: "value"
      }
    }
  }}
/>
```
{% endraw %}

### URL 自动识别

{% raw %}
```tsx
<JsonEditor
  defaultValue={`{
    "homepage": "https://example.com",
    "docs": "https://docs.example.com"
  }`}
  decorationConfig={{
    urlHandler: {
      onClick: (url) => {
        window.open(url, '_blank');
      },
      openInNewTab: true
    }
  }}
/>
```
{% endraw %}

### 自定义操作按钮

{% raw %}
```tsx
<JsonEditor
  defaultValue={`{
    "apiKey": "sk-xxxx",
    "secretToken": "token-xxxx"
  }`}
  decorationConfig={{
    paths: {
      "apiKey": {
        style: "bold",
        onClick: (value) => {
          navigator.clipboard.writeText(value);
          message.success('API Key copied!');
        },
        icon: "copy"  // 使用内置图标
      },
      "secretToken": {
        style: "italic",
        onClick: (value) => {
          showSecretDialog(value);
        },
        icon: "key"   // 使用内置图标
      }
    }
  }}
/>
```
{% endraw %}

### 自定义组件渲染

{% raw %}
```tsx
<JsonEditor
  defaultValue={`{
    "status": "active",
    "tags": ["frontend", "react", "typescript"]
  }`}
  decorationConfig={{
    paths: {
      "status": {
        style: {
          type: "component",
          component: {
            render: ({ value }) => (
              <StatusBadge 
                status={value}
                className="ml-2"
              />
            )
          }
        }
      },
      "tags": {
        style: {
          type: "component",
          component: {
            render: ({ value }) => (
              <TagList 
                tags={JSON.parse(value)}
                className="ml-2"
              />
            )
          }
        }
      }
    }
  }}
/>
```
{% endraw %}

## 高级用法

### 组合装饰效果

{% raw %}
```tsx
<JsonEditor
  defaultValue={`{
    "deployment": {
      "status": "running",
      "url": "https://app.example.com",
      "lastUpdated": "2024-01-20T10:00:00Z"
    }
  }`}
  decorationConfig={{
    paths: {
      "deployment.status": {
        style: "bold",
        target: "key"
      },
      "deployment.url": {
        style: "text-blue-500 underline",
        onClick: (url) => window.open(url, '_blank'),
        icon: "link"
      },
      "deployment.lastUpdated": {
        style: {
          type: "component",
          component: {
            render: ({ value }) => (
              <TimeAgo 
                date={value}
                className="text-gray-500 ml-2"
              />
            )
          }
        }
      }
    }
  }}
/>
```
{% endraw %}

### 动态装饰

{% raw %}
```tsx
function App() {
  const [decorations, setDecorations] = useState({});

  useEffect(() => {
    // 动态更新装饰配置
    const updateDecorations = async () => {
      const data = await fetchDecorationConfig();
      setDecorations(data);
    };

    updateDecorations();
  }, []);

  return (
    <JsonEditor
      defaultValue={`{...}`}
      decorationConfig={{
        paths: decorations
      }}
    />
  );
}
```
{% endraw %}

### 条件装饰

{% raw %}
```tsx
<JsonEditor
  defaultValue={`{
    "status": "active",
    "health": 98,
    "errors": []
  }`}
  decorationConfig={{
    paths: {
      "status": {
        style: (value) => value === "active" ? "text-green-500" : "text-red-500",
        target: "value"
      },
      "health": {
        style: (value) => {
          const health = Number(value);
          if (health > 90) return "text-green-500";
          if (health > 70) return "text-yellow-500";
          return "text-red-500";
        }
      },
      "errors": {
        style: (value) => {
          const errors = JSON.parse(value);
          return errors.length > 0 ? "text-red-500 font-bold" : "text-gray-400";
        }
      }
    }
  }}
/>
```
{% endraw %}

## 性能优化

### 装饰缓存

```tsx
function App() {
  const decorationCache = useMemo(() => ({
    paths: {
      // 缓存装饰配置...
    }
  }), [/* 依赖项 */]);

  return (
    <JsonEditor
      defaultValue={`{...}`}
      decorationConfig={decorationCache}
    />
  );
}
```

### 按需渲染

{% raw %}
```tsx
<JsonEditor
  decorationConfig={{
    paths: {
      "largeArray[*]": {
        style: {
          type: "component",
          component: {
            render: ({ value }) => (
              <LazyRender
                value={value}
                threshold={100}
              />
            )
          }
        }
      }
    }
  }}
/>
```
{% endraw %}

## 最佳实践

1. **性能考虑**
   - 避免过多的装饰器
   - 使用简单的样式字符串
   - 缓存装饰配置
   - 延迟加载大型组件

2. **样式管理**
   - 使用一致的样式命名
   - 避免样式冲突
   - 保持视觉统一
   - 注意响应式设计

3. **交互设计**
   - 提供清晰的视觉反馈
   - 保持交互一致性
   - 处理边界情况
   - 支持键盘操作

4. **错误处理**
   - 验证装饰配置
   - 处理渲染错误
   - 提供降级方案
   - 记录错误日志

## 常见问题

### 1. 装饰不生效

检查以下几点：
- 路径是否正确
- 样式语法是否正确
- 组件是否正确渲染
- 配置是否正确传入

### 2. 性能问题

优化建议：
- 减少装饰器数量
- 简化样式定义
- 使用性能分析工具
- 实现虚拟化渲染

### 3. 样式冲突

解决方案：
- 使用唯一的类名前缀
- 采用 CSS Modules
- 使用 CSS-in-JS
- 避免全局样式

> 💡 **小贴士**: 装饰系统是 JSON 编辑器的一个强大特性，它可以让你的 JSON 数据更具可读性和交互性。但要记住，装饰应该服务于提升用户体验，而不是喧宾夺主。在添加装饰时，始终要考虑其必要性和对性能的影响。 