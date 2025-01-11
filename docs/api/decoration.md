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
  
  // 基于值的匹配装饰配置
  matchers?: Array<{
    matcher: (key: string, value: any) => boolean;
    decoration: PathDecoration;
  }>;

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

### 基于值的匹配装饰

除了基于路径的装饰外，还可以使用 `matchers` 来基于键值对的内容进行装饰。这种方式更加灵活，可以根据值的内容、类型或模式来应用装饰。

#### 基本用法

{% raw %}
```tsx
<JsonEditor
  defaultValue={`{
    "status": "warning",
    "severity": "high",
    "memory": {
      "total": 16384,
      "used": 8192
    }
  }`}
  decorationConfig={{
    matchers: [
      {
        // 匹配所有 severity 字段
        matcher: (key, value) => 
          key === 'severity' && 
          typeof value === 'string' && 
          ['high', 'medium', 'low'].includes(value),
        decoration: {
          style: "bg-orange-200 text-orange-800 px-2 rounded-full",
          target: 'value',
          icon: '⚠️'
        }
      },
      {
        // 匹配大于 80% 的内存使用率
        matcher: (key, value) => {
          if (key !== 'memory') return false;
          try {
            const mem = JSON.parse(value);
            return (mem.used / mem.total) > 0.8;
          } catch {
            return false;
          }
        },
        decoration: {
          style: "bg-red-100 text-red-800 px-2 rounded",
          target: 'both',
          onClick: (value) => alert('内存使用率过高！'),
          icon: '🚨'
        }
      }
    ]
  }}
/>
```
{% endraw %}

#### 复杂数据分析示例

使用 matchers 来识别和装饰复杂的数据结构：

{% raw %}
```tsx
<JsonEditor
  defaultValue={`{
    "metrics": {
      "cpu": {
        "usage": 78.5,
        "temperature": 65
      },
      "memory": {
        "total": 16384,
        "used": 8192
      }
    },
    "analysis": {
      "status": "warning",
      "issues": [
        {
          "type": "performance",
          "severity": "medium",
          "description": "High CPU usage detected"
        }
      ]
    },
    "timestamp": "2024-01-22T08:30:00Z"
  }`}
  decorationConfig={{
    matchers: [
      {
        // 匹配包含完整指标和分析的数据结构
        matcher: (key, value) => {
          try {
            const data = JSON.parse(value);
            return (
              data &&
              typeof data === 'object' &&
              'metrics' in data &&
              'analysis' in data &&
              'timestamp' in data
            );
          } catch {
            return false;
          }
        },
        decoration: {
          style: "bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded",
          target: 'key',
          onClick: (value) => {
            const data = JSON.parse(value);
            alert(
              `分析报告:\n` +
              `状态: ${data.analysis.status}\n` +
              `CPU使用率: ${data.metrics.cpu.usage}%\n` +
              `内存使用: ${data.metrics.memory.used}/${data.metrics.memory.total} MB`
            );
          },
          icon: '📊'
        }
      }
    ]
  }}
/>
```
{% endraw %}

#### 条件样式装饰

使用 matchers 来根据值的内容应用不同的样式：

{% raw %}
```tsx
<JsonEditor
  defaultValue={`{
    "temperature": 75.5,
    "humidity": 45,
    "pressure": 1013
  }`}
  decorationConfig={{
    matchers: [
      {
        // 匹配温度值并根据范围应用不同样式
        matcher: (key, value) => {
          if (key !== 'temperature') return false;
          const temp = Number(value);
          return !isNaN(temp);
        },
        decoration: {
          style: (value) => {
            const temp = Number(value);
            if (temp > 80) return "bg-red-100 text-red-800";
            if (temp > 60) return "bg-yellow-100 text-yellow-800";
            return "bg-green-100 text-green-800";
          },
          target: 'value'
        }
      }
    ]
  }}
/>
```
{% endraw %}

#### 最佳实践

1. **性能优化**
   - 保持 matcher 函数简单高效
   - 避免在 matcher 中进行复杂计算
   - 对于频繁使用的正则表达式，考虑预编译
   - 缓存 JSON.parse 的结果

2. **错误处理**
   - 始终在 JSON.parse 时使用 try-catch
   - 为所有类型检查添加防御性编程
   - 处理 undefined 和 null 值
   - 验证数值范围和类型

3. **可维护性**
   - 将复杂的 matcher 逻辑拆分为小函数
   - 使用清晰的命名约定
   - 添加注释说明匹配逻辑
   - 考虑使用 TypeScript 类型

4. **用户体验**
   - 提供清晰的视觉反馈
   - 使用合适的图标
   - 添加有用的交互功能
   - 保持装饰风格的一致性

## 高级用法

### 复杂配置装饰

通过组合使用样式、图标和交互，可以为复杂的配置对象提供更好的可视化和操作体验：

{% raw %}
```tsx
const complexConfig = {
  advancedConfig: {
    performance: {
      cacheStrategy: "memory",
      maxCacheSize: 1024,
      ttl: 3600,
      prefetch: true
    },
    security: {
      encryption: {
        algorithm: "AES-256-GCM",
        keyRotation: "30d"
      },
      rateLimit: {
        enabled: true,
        maxRequests: 1000,
        window: "1h"
      }
    },
    optimization: {
      compression: true,
      minification: true,
      treeshaking: true
    }
  }
};

<JsonEditor
  value={JSON.stringify(complexConfig, null, 2)}
  decorationConfig={{
    paths: {
      '$["advancedConfig"]': {
        // 使用紫色背景突出显示
        style: "bg-purple-100/30 dark:bg-purple-900/30 rounded px-1 font-semibold",
        target: 'key',
        // 点击时格式化显示配置详情
        onClick: (value) => {
          const formatted = JSON.stringify(JSON.parse(value), null, 2);
          alert(`高级配置详情:\n${formatted}`);
        },
        // 添加设置图标
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19. ....."></path></svg>`
      }
    }
  }}
  schemaConfig={{
    schema: {
      type: "object",
      properties: {
        advancedConfig: {
          type: "object",
          description: "高级配置选项",
          properties: {
            performance: {
              type: "object",
              properties: {
                cacheStrategy: { 
                  type: "string",
                  enum: ["memory", "disk", "hybrid"]
                },
                maxCacheSize: { 
                  type: "number",
                  minimum: 0 
                },
                ttl: { 
                  type: "number",
                  minimum: 0 
                },
                prefetch: { type: "boolean" }
              }
            },
            security: {
              type: "object",
              properties: {
                encryption: {
                  type: "object",
                  properties: {
                    algorithm: { 
                      type: "string",
                      enum: ["AES-256-GCM", "ChaCha20-Poly1305"]
                    },
                    keyRotation: { 
                      type: "string",
                      pattern: "^\\d+[dhmw]$"
                    }
                  }
                },
                rateLimit: {
                  type: "object",
                  properties: {
                    enabled: { type: "boolean" },
                    maxRequests: { 
                      type: "number",
                      minimum: 1 
                    },
                    window: { 
                      type: "string",
                      pattern: "^\\d+[dhm]$"
                    }
                  }
                }
              }
            },
            optimization: {
              type: "object",
              properties: {
                compression: { type: "boolean" },
                minification: { type: "boolean" },
                treeshaking: { type: "boolean" }
              }
            }
          }
        }
      }
    }
  }}
/>
```
{% endraw %}

这个示例展示了如何:
1. 为复杂的配置对象添加视觉提示
2. 使用自定义图标增强可识别性
3. 添加交互功能以查看详细信息
4. 结合 Schema 验证确保数据正确性

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

## 图标和组件支持

装饰系统现在完整支持 ReactNode 类型的图标和组件，这意味着你可以：

- 使用任何 React 组件作为装饰
- 集成第三方组件库
- 创建复杂的交互式装饰
- 实现动态数据可视化

### 使用 React 组件作为图标

{% raw %}
```tsx
import { EyeIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';

<JsonEditor
  defaultValue={`{
    "stats": {
      "views": 1234,
      "likes": 567,
      "rating": 4.8
    }
  }`}
  decorationConfig={{
    paths: {
      '$["stats"]["views"]': {
        style: "bg-blue-100/50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded text-sm",
        target: 'value',
        onClick: (value) => console.log('Views:', value),
        icon: <EyeIcon className="h-4 w-4 text-blue-500" />
      },
      '$["stats"]["likes"]': {
        style: "bg-pink-100/50 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 px-1.5 py-0.5 rounded text-sm",
        target: 'value',
        onClick: (value) => console.log('Likes:', value),
        icon: <HeartIcon className="h-4 w-4 text-pink-500" />
      },
      '$["stats"]["rating"]': {
        style: "bg-yellow-100/50 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded text-sm",
        target: 'value',
        onClick: (value) => console.log('Rating:', value),
        icon: <StarIcon className="h-4 w-4 text-yellow-500" />
      }
    }
  }}
/>
```
{% endraw %}

### 集成第三方组件

例如集成 Ant Design 组件：

{% raw %}
```tsx
import { Tag, Badge, Progress } from 'antd';

<JsonEditor
  defaultValue={`{
    "task": {
      "status": "in_progress",
      "priority": "high",
      "progress": 75
    }
  }`}
  decorationConfig={{
    paths: {
      '$["task"]["status"]': {
        style: "px-1",
        target: 'value',
        icon: <Badge status="processing" text="进行中" />
      },
      '$["task"]["priority"]': {
        style: "px-1",
        target: 'value',
        icon: <Tag color="error">高优先级</Tag>
      },
      '$["task"]["progress"]': {
        style: "px-1",
        target: 'value',
        icon: <Progress type="circle" percent={75} width={20} />
      }
    }
  }}
/>
```
{% endraw %}

### 动态数据可视化

使用图表库展示数据：

{% raw %}
```tsx
import { AreaChart, Area, Tooltip } from 'recharts';

<JsonEditor
  defaultValue={`{
    "performance": {
      "cpu": [45, 62, 28, 50, 75, 62, 48],
      "memory": [1024, 1536, 2048, 1792, 1536, 1280, 1024]
    }
  }`}
  decorationConfig={{
    paths: {
      '$["performance"]["cpu"]': {
        style: "px-2",
        target: 'value',
        icon: (
          <AreaChart width={100} height={20} data={cpuData}>
            <Area dataKey="value" stroke="#3b82f6" fill="#93c5fd" />
            <Tooltip />
          </AreaChart>
        )
      },
      '$["performance"]["memory"]': {
        style: "px-2",
        target: 'value',
        icon: (
          <AreaChart width={100} height={20} data={memoryData}>
            <Area dataKey="value" stroke="#10b981" fill="#6ee7b7" />
            <Tooltip />
          </AreaChart>
        )
      }
    }
  }}
/>
```
{% endraw %}

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

## 常见问题

### 1. React 组件不渲染

检查以下几点：
- 确保组件正确导入
- 检查 props 传递
- 验证组件生命周期
- 查看控制台错误

### 2. 性能问题

优化建议：
- 使用 React.memo 优化渲染
- 实现必要的缓存
- 延迟加载大型组件
- 优化数据流转

### 3. 样式问题

解决方案：
- 检查样式优先级
- 使用独立的样式作用域
- 实现主题兼容
- 处理样式冲突

> 💡 **小贴士**: 装饰系统是 JSON 编辑器的一个强大特性，它可以让你的 JSON 数据更具可读性和交互性。但要记住，装饰应该服务于提升用户体验，而不是喧宾夺主。在添加装饰时，始终要考虑其必要性和对性能的影响。 