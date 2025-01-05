---
layout: default
title: 工具栏配置
description: JSON Editor 工具栏配置文档，包含按钮、布局、样式和自定义功能的详细说明
keywords: JSON Editor, Toolbar, Configuration, Buttons, Layout, Customization, UI Components
parent: API 参考
nav_order: 3
---

# 工具栏配置

> "如果说编辑器是乐器,那工具栏就是它的控制面板。一个好的工具栏设计,不仅要让常用功能触手可及,更要能启发用户探索更多可能。" 

工具栏是编辑器的核心交互界面,它不仅提供了常用操作的快捷访问,更是扩展功能的重要入口。本文将从设计理念出发,详细介绍工具栏的配置方案。

## 设计理念

在设计工具栏时,我们遵循以下原则:

1. **简洁至上**: 默认只显示最常用的操作,避免界面杂乱
2. **渐进增强**: 通过配置逐步添加更多功能,而不是一次性暴露所有选项
3. **灵活可控**: 提供细粒度的样式和行为定制能力
4. **直观反馈**: 按钮状态清晰地反映编辑器状态
5. **可扩展性**: 支持自定义按钮和行为,满足特定需求

## 基础配置

### 位置布局

工具栏支持三种位置布局:

```typescript
toolbarConfig: {
  position: 'top' | 'bottom' | 'none'
}
```

- `top`: 置顶布局 (默认) - 最传统和直观的位置
- `bottom`: 底部布局 - 适合强调编辑区域的场景
- `none`: 隐藏工具栏 - 极简模式或自定义工具栏时使用

💡 **最佳实践**: 除非有特殊的交互需求,建议保持默认的顶部布局。这符合用户习惯,也便于与其他编辑器工具协同。

### 样式定制

我们提供了两种样式定制方式:

```typescript
toolbarConfig: {
  className?: string;  // 类名方式
  style?: React.CSSProperties;  // 内联样式
}
```

🎯 **小贴士**: 优先使用 `className` 进行样式定制,这样可以:
- 更好地复用样式
- 维护主题一致性
- 实现响应式设计
- 优化性能

## 功能模块

### 核心功能

工具栏的核心功能采用模块化设计:

```typescript
toolbarConfig: {
  features: {
    format?: boolean;    // 格式化 - 规范代码格式
    minify?: boolean;    // 压缩 - 优化代码体积
    validate?: boolean;  // 验证 - 确保数据有效
    copy?: boolean;      // 复制 - 分享与复用
    expand?: boolean;    // 展开 - 优化阅读体验
  }
}
```

每个功能模块都经过精心设计,既能独立运行,又能无缝协作。例如,格式化后会自动触发验证,压缩时会保持数据结构完整性。

### 功能扩展

对于特定场景的需求,我们提供了强大的扩展机制:

```typescript
toolbarConfig: {
  customButtons: Array<{
    key: string;
    render: (editor: EditorCore) => React.ReactNode;
  }>
}
```

这不是简单的按钮添加,而是一个完整的功能扩展系统:
- 可访问编辑器实例
- 支持状态管理
- 响应主题变化
- 支持快捷键绑定

示例:实现一个智能导出按钮
{% raw %}
```tsx
<JsonEditor
  toolbarConfig={{
    customButtons: [{
      key: 'export',
      render: (editor) => (
        <button 
          onClick={async () => {
            const content = editor.getValue();
            // 智能检测数据结构
            const structure = analyzeStructure(content);
            // 根据结构选择最优导出格式
            const format = suggestFormat(structure);
            // 执行导出
            await exportData(content, format);
          }}
          title="智能分析数据结构并选择最优导出格式"
        >
          导出
        </button>
      )
    }]
  }}
/>
```
{% endraw %}

## 交互优化

### 按钮风格

每个按钮都可以定制其外观和交互:

```typescript
toolbarConfig: {
  buttonStyles: {
    [key: string]: {
      className?: string;
      style?: React.CSSProperties;
      icon?: React.ReactNode;
      text?: string;
      tooltip?: string;
    }
  }
}
```

🔍 **深入理解**: 按钮不仅是触发操作的入口,更是功能的可视化表达:
- 图标要简洁明了
- 文字要精准传达意图
- 提示要有实际帮助
- 状态要及时反馈

### 按钮编排

通过分组和排序,构建清晰的功能层级:

```typescript
toolbarConfig: {
  // 逻辑分组
  buttonGroups: Array<{
    key: string;
    buttons: string[];
    className?: string;
    style?: React.CSSProperties;
  }>,
  
  // 视觉顺序
  buttonOrder: string[],
  
  // 分隔样式
  dividerStyle: React.CSSProperties
}
```

💡 **布局建议**:
- 常用操作放左侧
- 相关功能组合在一起
- 危险操作特殊处理
- 预留扩展空间

## 实战案例

### 场景一：轻量编辑器

适合简单的数据编辑场景:

{% raw %}
```tsx
<JsonEditor
  toolbarConfig={{
    position: "top",
    features: {
      format: true,
      validate: true
    }
  }}
/>
```
{% endraw %}

### 场景二：专业工作台

面向开发者的完整功能集:

{% raw %}
```tsx
<JsonEditor
  toolbarConfig={{
    position: "top",
    features: {
      format: true,
      minify: true,
      validate: true,
      copy: true,
      expand: true
    },
    buttonGroups: [{
      key: "code",
      buttons: ["format", "minify"]
    }, {
      key: "tools",
      buttons: ["validate", "copy"]
    }],
    buttonStyles: {
      validate: {
        text: "验证",
        tooltip: "验证 JSON 结构和 Schema",
        icon: <ValidateIcon />,
        className: "validate-btn"
      }
    }
  }}
/>
```
{% endraw %}

### 场景三：自定义工作流

为特定团队定制的工具链:

{% raw %}
```tsx
<JsonEditor
  toolbarConfig={{
    // ... 完整示例见文档
  }}
/>
```
{% endraw %}

## 性能考虑

工具栏的设计充分考虑了性能因素:

1. **按需渲染**: 未激活的功能不会产生 DOM
2. **事件委托**: 统一的事件处理减少监听器
3. **状态管理**: 精细的更新粒度避免重渲染
4. **样式优化**: 合理使用 CSS-in-JS

## 常见问题

1. **Q: 如何实现自定义快捷键？**  
   A: 通过 `customButtons` 的 `render` 函数可以访问编辑器实例,在其中绑定快捷键。

2. **Q: 按钮状态如何与编辑器同步？**  
   A: 工具栏组件会自动监听编辑器状态变化,你也可以通过 `editor` 实例手动同步。

3. **Q: 如何添加右键菜单？**  
   A: 可以通过自定义按钮实现,我们提供了上下文菜单组件。

## 未来规划

1. 支持更多的按钮类型
2. 增强自定义布局能力
3. 提供更多的主题选项
4. 优化移动端适配

> 💡 **技术思考**: 工具栏的设计体现了"渐进增强"的理念 - 从最基础的功能开始,通过配置逐步添加更多特性,让用户能够根据需求构建最适合自己的编辑器。 