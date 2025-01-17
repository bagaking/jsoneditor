---
layout: default
title: 装饰系统
description: JSON Editor 当前路径装饰配置边界
keywords: JSON Editor, Decoration System, Path Decoration, Custom Styles, Interactive Features
parent: API 参考
nav_order: 7
---

# 装饰系统

装饰系统可以按 JSON path 或 matcher 给字段添加样式、操作按钮和 URL 处理。通过 `decorationConfig` 传入的业务 class 必须由消费方应用自己的 CSS 或 Tailwind 构建覆盖。

## 配置接口

当前公开类型以源码中的 `DecorationConfig` 和 `DecorationPathHook` 为准：

```typescript
interface DecorationConfig {
  paths?: Record<string, DecorationPathHook>;
  matchers?: Array<{
    matcher: (key: string, value: any) => boolean;
    decoration: DecorationPathHook;
  }>;
  urlHandler?: {
    component?: CustomComponent;
    onClick?: (url: string) => void;
    openInNewTab?: boolean;
  };
}

interface DecorationPathHook {
  style: string | CustomComponent;
  target?: 'key' | 'value' | 'both';
  onClick?: (value: string) => void;
  icon?: string | React.ReactNode;
}

interface CustomComponent {
  type: 'component';
  render: (props: {
    value: string;
    onClick?: (value: string) => void;
  }) => HTMLElement;
}
```

当前 `DecorationPathHook` 没有 `tooltip` 字段，也不支持 `(value) => styleObject` 形式的样式函数。

## 路径装饰

路径使用 JSON path 字符串。`target` 默认为 `key`。

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

## Matcher 装饰

`matchers` 可按字段名和值决定是否应用某个装饰：

{% raw %}
```tsx
<JsonEditor
  defaultValue={JSON.stringify({ severity: 'high', status: 'warning' }, null, 2)}
  decorationConfig={{
    matchers: [
      {
        matcher: (key, value) =>
          key === 'severity' &&
          typeof value === 'string' &&
          ['high', 'medium', 'low'].includes(value),
        decoration: {
          target: 'value',
          style: 'bg-orange-100 text-orange-800 px-1 rounded',
          icon: '!'
        }
      }
    ]
  }}
/>
```
{% endraw %}

## URL 处理

编辑器会识别字符串值里的 URL，并可通过 `urlHandler` 定制点击行为：

{% raw %}
```tsx
<JsonEditor
  defaultValue={JSON.stringify({ docs: 'https://example.com/docs' }, null, 2)}
  decorationConfig={{
    urlHandler: {
      openInNewTab: true,
      onClick: (url) => window.open(url, '_blank')
    }
  }}
/>
```
{% endraw %}

## 自定义组件

`CustomComponent.render` 当前返回 `HTMLElement`。如果需要 React 组件，请在 render 中自行挂载到创建出的 DOM 节点。

{% raw %}
```tsx
const badgeDecoration = {
  type: 'component' as const,
  render: ({ value }) => {
    const node = document.createElement('span');
    node.textContent = value;
    node.className = 'rounded bg-green-100 px-1 text-green-700';
    return node;
  }
};

<JsonEditor
  defaultValue={JSON.stringify({ status: 'active' }, null, 2)}
  decorationConfig={{
    paths: {
      '$["status"]': {
        target: 'value',
        style: badgeDecoration
      }
    }
  }}
/>
```
{% endraw %}
