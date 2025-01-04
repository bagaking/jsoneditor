# 定制化指南

> "主题和样式系统是编辑器的核心基础设施之一。通过深入理解其工作原理，我们可以构建出既美观又实用的编辑体验。"

## 样式隔离机制

JSON Editor 采用多层次的样式隔离机制，确保编辑器的样式不会受到外部环境的影响，同时也不会污染全局样式。

### 数据属性隔离

每个主要组件都使用特定的 `data-bkjson-*` 属性来标识：

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

这种机制确保：
1. 样式选择器具有足够的特异性
2. 避免与页面其他元素的样式冲突
3. 便于调试和样式覆盖

### CSS 模块化

组件样式采用 CSS Modules 方案：

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

优势：
1. 样式作用域完全隔离
2. 类名自动唯一化
3. 支持组合和继承

### 主题样式隔离

主题相关的样式通过特定的选择器组合来实现隔离：

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

这种方式确保：
1. 主题样式不会泄露
2. 支持嵌套的主题定义
3. 便于主题切换

### 动态样式注入

对于需要动态计算的样式，使用 CSS-in-JS 方案：

```typescript
const dynamicStyle = {
  height: expanded ? 'auto' : getCollapsedHeight(),
  transition: 'height 0.3s ease-in-out',
  overflow: 'hidden'
};

// 使用 style 属性注入
<div style={dynamicStyle}>...</div>
```

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

#### 亮色主题

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

### 主题配置

主题配置支持多个层次的定制：

1. **基础主题选择**
   ```tsx
   <JsonEditor
     themeConfig={{
       theme: 'dark'  // 'light' | 'dark'
     }}
   />
   ```

2. **主题变量覆盖**
   ```tsx
   <JsonEditor
     themeConfig={{
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
     }}
   />
   ```

3. **组件主题定制**
   ```tsx
   <JsonEditor
     themeConfig={{
       theme: 'dark',
       components: {
         // 工具栏主题
         toolbar: {
           background: '#21252b',
           borderColor: '#181a1f',
           buttonHoverBg: '#2c313a'
         },
         
         // 状态栏主题
         statusBar: {
           background: '#21252b',
           textColor: '#9da5b4'
         }
       }
     }}
   />
   ```

4. **编辑器主题定制**
   ```tsx
   <JsonEditor
     themeConfig={{
       theme: 'dark',
       code: {
         // 基础样式
         background: '#282c34',
         fontSize: '14px',
         fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
         
         // 编辑器特性
         lineNumbers: '#636d83',
         selection: '#3e4451',
         activeLine: '#2c313a',
         
         // 语法高亮
         syntax: {
           property: '#61afef',
           string: '#98c379',
           number: '#d19a66',
           boolean: '#c678dd',
           null: '#c678dd'
         }
       }
     }}
   />
   ```

### 自定义主题

要创建完全自定义的主题，需要：

1. **定义颜色方案**
   ```typescript
   import { tags as t } from '@lezer/highlight';
   
   const customColors = {
     // 定义你的颜色变量
     background: '#1e1e1e',
     foreground: '#d4d4d4',
     property: '#9cdcfe',
     string: '#ce9178',
     number: '#b5cea8',
     boolean: '#569cd6',
     null: '#569cd6'
   };
   ```

2. **创建语法高亮规则**
   ```typescript
   import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
   
   const customHighlightStyle = HighlightStyle.define([
     { tag: t.propertyName, color: customColors.property },
     { tag: t.string, color: customColors.string },
     { tag: t.number, color: customColors.number },
     { tag: t.bool, color: customColors.boolean },
     { tag: t.null, color: customColors.null }
   ]);
   ```

3. **定义主题样式**
   ```typescript
   import { EditorView } from '@codemirror/view';
   
   const customTheme = EditorView.theme({
     "&": {
       backgroundColor: customColors.background,
       color: customColors.foreground
     },
     ".cm-content": {
       caretColor: customColors.foreground,
       fontFamily: 'Consolas, monospace',
       fontSize: "14px"
     },
     // ... 更多样式定义
   });
   ```

4. **注册主题**
   ```typescript
   import { Extension } from '@codemirror/state';
   
   const custom: Extension[] = [
     customTheme,
     syntaxHighlighting(customHighlightStyle)
   ];
   
   // 使用自定义主题
   <JsonEditor
     themeConfig={{
       theme: custom
     }}
   />
   ```

### 主题切换

主题切换涉及几个关键点：

1. **状态管理**
   ```typescript
   const [theme, setTheme] = useState<'light' | 'dark'>('light');
   
   // 切换主题
   const toggleTheme = () => {
     setTheme(prev => prev === 'light' ? 'dark' : 'light');
   };
   ```

2. **主题应用**
   ```typescript
   <JsonEditor
     themeConfig={{
       theme,
       // 确保主题相关的配置随主题切换而更新
       vars: theme === 'dark' ? darkVars : lightVars,
       components: theme === 'dark' ? darkComponents : lightComponents
     }}
   />
   ```

3. **样式过渡**
   ```typescript
   // 在主题配置中添加过渡效果
   components: {
     toolbar: {
       transition: 'background-color 0.3s ease',
       // ... 其他样式
     }
   }
   ```

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