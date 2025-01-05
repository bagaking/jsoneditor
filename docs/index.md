---
layout: default
title: 首页
nav_order: 1
---

# JSON Editor

> 一个功能强大的 **JSON 编辑器组件**，专注于提供最佳的 JSON 编辑体验。

[![npm version](https://img.shields.io/npm/v/@bagaking/jsoneditor.svg)](https://www.npmjs.com/package/@bagaking/jsoneditor)
[![npm downloads](https://img.shields.io/npm/dm/@bagaking/jsoneditor.svg)](https://www.npmjs.com/package/@bagaking/jsoneditor)
[![GitHub license](https://img.shields.io/github/license/bagaking/jsoneditor.svg)](https://github.com/bagaking/jsoneditor/blob/main/LICENSE)

## 🌟 亮点功能

- 🎨 **主题系统**
  - 内置明暗主题
  - 可自定义主题变量
  - 支持组件级样式定制
  
- 🔍 **智能编辑**
  - 路径高亮和提示
  - 智能补全和验证
  - 格式化和压缩
  
- ✨ **Schema 支持**
  - JSON Schema 验证
  - 实时错误提示
  - 类型感知补全
  
- 💡 **开发友好**
  - TypeScript 支持
  - 丰富的 API
  - 灵活的扩展机制

## 🚀 快速开始

### 安装

```bash
pnpm add @bagaking/jsoneditor
```

### 基础使用

{% raw %}
```tsx
import { JsonEditor } from '@bagaking/jsoneditor';

function App() {
  return (
    <JsonEditor
      defaultValue={'{"hello": "world"}'}
      themeConfig={{ theme: 'light' }}
    />
  );
}
```
{% endraw %}

## 📖 文档导航

### 使用指南
- [快速开始](./guide/getting-started.md) - 5 分钟上手 JSON Editor
- [基础用法](./guide/basic-usage.md) - 常用功能和配置说明
- [Schema 验证](./guide/schema-validation.md) - JSON Schema 验证指南
- [自定义配置](./guide/customization.md) - 主题和组件定制

### API 参考
- [编辑器](./api/editor.md) - 核心编辑器组件
- [工具栏](./api/toolbar.md) - 工具栏配置
- [状态栏](./api/statusbar.md) - 状态栏配置
- [Schema 面板](./api/schema-panel.md) - Schema 信息面板
- [装饰系统](./api/decoration.md) - 路径装饰功能

### 设计文档
- [架构设计](./design/architecture.md) - 系统架构说明
- [设计原则](./design/principles.md) - 设计理念和原则

## 🎮 在线演示

- [CodeSandbox](https://codesandbox.io/s/bagaking-jsoneditor-demo)
- [StackBlitz](https://stackblitz.com/edit/bagaking-jsoneditor-demo)

## 🤝 贡献指南

欢迎提交 [Issue](https://github.com/bagaking/jsoneditor/issues) 或 [Pull Request](https://github.com/bagaking/jsoneditor/pulls)!

## 📄 许可证

[MIT](https://github.com/bagaking/jsoneditor/blob/main/LICENSE) 