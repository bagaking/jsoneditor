# 状态栏配置

> "优秀的反馈机制应该像呼吸一样自然。" 

状态栏是编辑器的信息中心，它以简洁的方式呈现编辑器的各种状态。

## 基础配置

```typescript
interface StatusBarConfig {
    // 基础样式
    className?: string;
    style?: React.CSSProperties;
    
    // 显示项配置
    features?: {
        error?: boolean;         // 错误信息
        cursorPosition?: boolean;// 光标位置
        documentSize?: boolean;  // 文档大小
        validStatus?: boolean;   // 验证状态
    };
}
```

💡 **设计理念**: 状态栏遵循"少即是多"的原则，只显示最必要的信息，避免干扰用户的编辑体验。

## 信息定制

### 格式化配置

可以自定义各类信息的展示格式:

```typescript
format?: {
    bytes?: (bytes: number) => string;
    position?: (line: number, col: number) => string;
    error?: (error: string) => string;
}
```

示例:
```tsx
<JsonEditor
  statusBarConfig={{
    format: {
      // 自定义文件大小显示
      bytes: (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        return `${(bytes / 1024).toFixed(1)} KB`;
      },
      // 简化错误信息
      error: (error) => error.split(':')[0]
    }
  }}
/>
```

### 图标配置

可以自定义状态图标:

```typescript
icons?: {
    error?: React.ReactNode;
    valid?: React.ReactNode;
    editing?: React.ReactNode;
}
```

## 布局调整

```typescript
layout?: {
    order?: string[];  // 信息项顺序
    dividerStyle?: React.CSSProperties;  // 分隔符样式
}
```

## 使用场景

### 基础模式
```tsx
// 默认配置，显示所有信息
<JsonEditor />
```

### 精简模式
```tsx
// 只显示必要信息
<JsonEditor
  statusBarConfig={{
    features: {
      error: true,
      validStatus: true
    }
  }}
/>
```

### 自定义模式
```tsx
// 定制显示内容和样式
<JsonEditor
  statusBarConfig={{
    features: {
      error: true,
      cursorPosition: true
    },
    className: "custom-status",
    format: {
      position: (line, col) => `${line}:${col}`
    }
  }}
/>
```

> 🎯 **小贴士**: 状态栏的设计重点是提供清晰的反馈，而不是成为功能的堆砌。选择性地显示真正重要的信息，往往能带来更好的用户体验。 