---
layout: default
title: 定制化指南
description: JSON Editor 定制化指南，包含主题系统、样式隔离和组件定制的详细说明
keywords: JSON Editor, Customization, Theming, Style Isolation, Component Customization, Visual Design
parent: API 参考
nav_order: 8
---

# 定制化指南

> "主题和样式系统是编辑器的核心基础设施之一。通过深入理解其工作原理，我们可以构建出既美观又实用的编辑体验。"

## 样式隔离机制

JSON Editor 采用多层次的样式隔离机制，确保编辑器的样式不会受到外部环境的影响，同时也不会污染全局样式。

### 数据属性隔离

每个主要组件都使用特定的 `data-bkjson-*` 属性来标识：

{% raw %}
```tsx
// 编辑器容器
<div data-bkjson-root>
  // 工具栏
  <div data-bkjson-toolbar>...</div>
  
  // 编辑器主体
  <div data-bkjson-editor>...</div>
  
  // 状态栏
  <div data-bkjson-status>...</div>
  
  // Schema 面板
  <div data-bkjson-schema>...</div>
</div>
```
{% endraw %}

这种机制确保：
1. 样式选择器具有足够的特异性
2. 避免与页面其他元素的样式冲突
3. 便于调试和样式覆盖

### CSS 模块化

组件样式采用 CSS Modules 方案：

{% raw %}
```typescript
// Toolbar.module.css
.toolbar {
  display: flex;
  align-items: center;
  padding: 8px;
}

// Toolbar.tsx
import styles from './Toolbar.module.css';

export const Toolbar = () => (
  <div className={styles.toolbar}>
    ...
  </div>
);
```
{% endraw %}

优势：
1. 样式作用域完全隔离
2. 类名自动唯一化
3. 支持组合和继承

### 主题样式隔离

主题相关的样式通过特定的选择器组合来实现隔离：

{% raw %}
```typescript
const darkTheme = {
  // 编辑器范围内的样式
  "[data-bkjson-root][data-theme='dark']": {
    // 基础样式
    backgroundColor: "#282c34",
    color: "#abb2bf",
    
    // 组件样式
    "[data-bkjson-toolbar]": {
      backgroundColor: "#21252b"
    },
    
    // CodeMirror 样式
    ".cm-content": {
      caretColor: "#abb2bf"
    }
  }
};
```
{% endraw %}

这种方式确保：
1. 主题样式不会泄露
2. 支持嵌套的主题定义
3. 便于主题切换

### 动态样式注入

对于需要动态计算的样式，使用 CSS-in-JS 方案：

{% raw %}
```typescript
const dynamicStyle = {
  height: expanded ? 'auto' : getCollapsedHeight(),
  transition: 'height 0.3s ease-in-out',
  overflow: 'hidden'
};

// 使用 style 属性注入
<div style={dynamicStyle}>...</div>
```
{% endraw %}

这种方式适用于：
1. 需要基于状态计算的样式
2. 需要动态主题变量的场景
3. 需要性能优化的场景

## 主题系统

### 主题实现原理

JSON Editor 的主题系统基于 CodeMirror 的主题机制构建，同时扩展了对 JSON 特定语法的支持。主题系统包含以下核心部分：

1. **基础主题定义**
   - 编辑器背景色和前景色
   - 字体和字号设置
   - 光标和选区样式
   - 行号和装订线样式

2. **语法高亮规则**
   - JSON 属性名称
   - 字符串、数字、布尔值
   - 括号和标点符号
   - 错误标记

3. **组件主题**
   - 工具栏样式
   - 状态栏样式
   - Schema 面板样式

### 内置主题

#### 暗色主题

{% raw %}
```typescript
// 暗色主题的颜色定义
const darkColors = {
  chalky: "#e5c07b",    // 用于类名和属性名
  coral: "#e06c75",     // 用于关键字和标签
  cyan: "#56b6c2",      // 用于内置函数
  ivory: "#abb2bf",     // 基础文本颜色
  stone: "#7d8799",     // 用于注释
  malibu: "#61afef",    // 用于函数和属性
  sage: "#98c379",      // 用于字符串
  whiskey: "#d19a66",   // 用于数字
  violet: "#c678dd"     // 用于特殊关键字
};

// 语法高亮规则
const darkHighlightStyle = HighlightStyle.define([
  // JSON 特定语法
  { tag: t.propertyName, color: darkColors.malibu, fontWeight: "500" },
  { tag: t.string, color: darkColors.sage },
  { tag: t.number, color: darkColors.whiskey },
  { tag: t.bool, color: darkColors.violet, fontWeight: "500" },
  { tag: t.null, color: darkColors.violet, fontWeight: "500" },
  { tag: t.keyword, color: darkColors.coral },
  { tag: t.operator, color: darkColors.ivory },
  { tag: t.bracket, color: darkColors.ivory },
  { tag: t.punctuation, color: darkColors.ivory },
  { tag: t.invalid, color: darkColors.invalid, backgroundColor: darkColors.coral }
]);

// 编辑器主题
const darkTheme = EditorView.theme({
  "&": {
    backgroundColor: "#282c34",
    color: darkColors.ivory
  },
  ".cm-content": {
    caretColor: darkColors.ivory,
    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
    fontSize: "14px"
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: darkColors.ivory
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "#3E4451"
  },
  ".cm-activeLine": { 
    backgroundColor: "#2c313a" 
  },
  ".cm-gutters": {
    backgroundColor: "#282c34",
    color: darkColors.stone,
    border: "none",
    borderRight: "1px solid #3E4451"
  }
}, { dark: true });
```
{% endraw %}

#### 亮色主题

{% raw %}
```typescript
// 亮色主题的颜色定义
const lightColors = {
  chalky: "#e5c07b",    // 用于类名和属性名
  coral: "#e06c75",     // 用于关键字和标签
  cyan: "#56b6c2",      // 用于内置函数
  ivory: "#24292e",     // 基础文本颜色
  stone: "#7d8799",     // 用于注释
  malibu: "#0366d6",    // 用于函数和属性
  sage: "#98c379",      // 用于字符串
  whiskey: "#d19a66",   // 用于数字
  violet: "#6f42c1"     // 用于特殊关键字
};

// 语法高亮规则
const lightHighlightStyle = HighlightStyle.define([
  // JSON 特定语法
  { tag: t.propertyName, color: lightColors.malibu, fontWeight: "500" },
  { tag: t.string, color: lightColors.sage },
  { tag: t.number, color: lightColors.whiskey },
  { tag: t.bool, color: lightColors.violet, fontWeight: "500" },
  { tag: t.null, color: lightColors.violet, fontWeight: "500" },
  { tag: t.keyword, color: lightColors.coral },
  { tag: t.operator, color: lightColors.ivory },
  { tag: t.bracket, color: lightColors.ivory },
  { tag: t.punctuation, color: lightColors.ivory },
  { tag: t.invalid, color: lightColors.invalid, backgroundColor: lightColors.coral }
]);

// 编辑器主题
const lightTheme = EditorView.theme({
  "&": {
    backgroundColor: "#ffffff",
    color: lightColors.ivory
  },
  ".cm-content": {
    caretColor: lightColors.ivory,
    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
    fontSize: "14px"
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: lightColors.ivory
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "#0366d625"
  },
  ".cm-activeLine": { 
    backgroundColor: "#f6f8fa" 
  },
  ".cm-gutters": {
    backgroundColor: "#ffffff",
    color: lightColors.stone,
    border: "none",
    borderRight: "1px solid #e1e4e8"
  }
}, { dark: false });
```
{% endraw %}

### 自定义主题

你可以通过 `themeConfig` 属性来自定义主题：

{% raw %}
```typescript
const customTheme = {
  theme: 'dark',
  vars: {
    // 基础颜色
    primary: '#1890ff',
    secondary: '#52c41a',
    error: '#f5222d',
    
    // 编辑器颜色
    editorBg: '#282c34',
    editorFg: '#abb2bf',
    selectionBg: '#3E4451',
    
    // 语法高亮
    propertyColor: '#61afef',
    stringColor: '#98c379',
    numberColor: '#d19a66'
  }
};

// 使用自定义主题
<JsonEditor themeConfig={customTheme} />
```
{% endraw %}

主题配置支持以下选项：

1. **基础设置**
   - `theme`: 'light' | 'dark' - 基础主题
   - `vars`: 主题变量对象

2. **主题变量**
   - 基础颜色
     - `primary`: 主色调
     - `secondary`: 次要色调
     - `error`: 错误色
   
   - 编辑器颜色
     - `editorBg`: 编辑器背景色
     - `editorFg`: 编辑器前景色
     - `selectionBg`: 选中背景色
     - `gutterBg`: 行号区域背景色
     - `gutterFg`: 行号颜色
   
   - 语法高亮
     - `propertyColor`: 属性名颜色
     - `stringColor`: 字符串颜色
     - `numberColor`: 数字颜色
     - `booleanColor`: 布尔值颜色
     - `nullColor`: null 值颜色
     - `bracketColor`: 括号颜色
     - `punctuationColor`: 标点符号颜色

3. **组件主题**
   - 工具栏
     - `toolbarBg`: 工具栏背景色
     - `toolbarBorder`: 工具栏边框色
     - `buttonHoverBg`: 按钮悬停背景色
   
   - 状态栏
     - `statusBg`: 状态栏背景色
     - `statusText`: 状态文本颜色
   
   - Schema 面板
     - `schemaBg`: Schema 面板背景色
     - `schemaText`: Schema 文本颜色
     - `schemaBorder`: Schema 面板边框色

### 最佳实践

1. **主题继承**
   ```typescript
   // 继承暗色主题
   const customDarkTheme = {
     theme: 'dark',
     vars: {
       ...darkTheme.vars,
       primary: '#1890ff'
     }
   };
   ```

2. **响应式主题**
   {% raw %}
   ```typescript
   // 根据系统主题切换
   const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
   
   <JsonEditor themeConfig={{ theme: systemTheme }} />
   ```
   {% endraw %}

3. **主题变量复用**
   ```typescript
   const brandColors = {
     primary: '#1890ff',
     success: '#52c41a',
     warning: '#faad14',
     error: '#f5222d'
   };
   
   const editorTheme = {
     theme: 'light',
     vars: {
       primary: brandColors.primary,
       error: brandColors.error
     }
   };
   ```

4. **性能优化**
   - 避免频繁切换主题
   - 使用 `useMemo` 缓存主题配置
   - 提取公共主题变量

## 组件定制

### 工具栏定制

工具栏支持以下定制选项：

1. **按钮配置**
   ```typescript
   interface ToolbarButtonConfig {
     icon?: React.ReactNode;
     tooltip?: string;
     disabled?: boolean;
     hidden?: boolean;
     onClick?: () => void;
     style?: React.CSSProperties;
   }
   ```

2. **按钮组**
   ```typescript
   interface ToolbarButtonGroup {
     key: string;
     buttons: string[];
     divider?: boolean;
     style?: React.CSSProperties;
   }
   ```

3. **示例配置**
   {% raw %}
   ```tsx
   <JsonEditor
     toolbarConfig={{
       // 按钮样式
       buttonStyles: {
         base: {
           height: '28px',
           padding: '0 8px',
           borderRadius: '4px',
           transition: 'all 0.3s'
         },
         hover: {
           background: 'rgba(255,255,255,0.1)'
         },
         active: {
           background: 'rgba(255,255,255,0.2)'
         }
       },
       
       // 按钮分组
       buttonGroups: [
         {
           key: 'edit',
           buttons: ['undo', 'redo'],
           divider: true
         },
         {
           key: 'format',
           buttons: ['format', 'validate']
         }
       ],
       
       // 自定义按钮
       customButtons: [
         {
           key: 'save',
           icon: <SaveIcon />,
           tooltip: '保存',
           onClick: () => {/* ... */}
         }
       ]
     }}
   />
   ```
   {% endraw %}

### 状态栏定制

状态栏支持以下定制选项：

1. **显示项配置**
   ```typescript
   interface StatusBarFeatures {
     showError?: boolean;
     showCursor?: boolean;
     showSize?: boolean;
     showValid?: boolean;
   }
   ```

2. **格式化配置**
   ```typescript
   interface StatusBarFormat {
     cursor?: (line: number, col: number) => string;
     size?: (lines: number, bytes: number) => string;
     valid?: (isValid: boolean) => StatusIndicator;
   }
   ```

3. **示例配置**
   {% raw %}
   ```tsx
   <JsonEditor
     statusBarConfig={{
       // 显示项
       features: {
         showError: true,
         showCursor: true,
         showSize: true,
         showValid: true
       },
       
       // 布局
       layout: {
         order: ['error', 'cursor', 'size', 'valid'],
         divider: '|',
         style: { padding: '0 8px' }
       },
       
       // 格式化
       format: {
         cursor: (line, col) => `Ln ${line}, Col ${col}`,
         size: (lines, bytes) => {
           const kb = (bytes / 1024).toFixed(1);
           return `${lines} 行 (${kb}KB)`;
         },
         valid: (isValid) => ({
           icon: isValid ? <CheckIcon /> : <ErrorIcon />,
           text: isValid ? '有效' : '无效',
           color: isValid ? '#52c41a' : '#f5222d'
         })
       }
     }}
   />
   ```
   {% endraw %}

### Schema 面板定制

Schema 面板支持以下定制选项：

1. **布局配置**
   ```typescript
   interface SchemaInfoLayout {
     showDescription?: boolean;
     showPath?: boolean;
     showType?: boolean;
     showRequired?: boolean;
     order?: string[];
   }
   ```

2. **格式化配置**
   ```typescript
   interface SchemaInfoFormat {
     type?: (type: string, format?: string) => string;
     description?: (desc: string) => React.ReactNode;
     path?: (path: string[]) => string;
     required?: () => React.ReactNode;
   }
   ```

3. **示例配置**
   {% raw %}
   ```tsx
   <JsonEditor
     schemaInfoConfig={{
       // 布局
       layout: {
         showDescription: true,
         showPath: true,
         showType: true,
         showRequired: true,
         order: ['description', 'type', 'required']
       },
       
       // 格式化
       format: {
         type: (type, format) => {
           if (format) return `${type} (${format})`;
           return type;
         },
         description: (desc) => <ReactMarkdown>{desc}</ReactMarkdown>,
         path: (path) => path.join(' > '),
         required: () => <Tag color="error">必填</Tag>
       },
       
       // 样式
       style: {
         padding: '16px',
         borderLeft: '1px solid #e8e8e8'
       }
     }}
   />
   ```
   {% endraw %}

## 最佳实践

1. **主题定制**
   - 保持颜色系统的一致性
   - 注意深色/浅色主题的对比度
   - 使用语义化的颜色变量
   - 考虑无障碍设计

2. **组件定制**
   - 遵循组件的设计规范
   - 保持交互的一致性
   - 提供合适的视觉反馈
   - 注意性能影响

3. **性能优化**
   - 避免过度的样式计算
   - 合理使用 React.memo
   - 优化重渲染逻辑
   - 使用性能分析工具

## 常见问题

### 1. 主题切换问题

**问题**: 主题切换后样式未完全更新
**解决方案**: 
- 确保所有组件都正确响应主题变化
- 检查是否有硬编码的样式值
- 使用 React.useEffect 处理副作用

### 2. 样式冲突

**问题**: 自定义样式被覆盖
**解决方案**: 
- 使用更高优先级的选择器
- 采用 CSS Modules
- 避免全局样式污染

### 3. 性能问题

**问题**: 样式变更导致性能下降
**解决方案**: 
- 减少样式计算
- 使用 CSS-in-JS 的缓存机制
- 优化选择器性能

> 💡 **提示**: 定制化是一个渐进的过程。建议从基础主题开始，逐步添加自定义样式，并时刻关注性能指标。合理的定制化可以提升用户体验，过度的定制化反而可能带来维护负担。 