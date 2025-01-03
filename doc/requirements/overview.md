# JSON Editor 需求概览

## 项目简介

JSON Editor 是一个基于 Web 的 JSON 编辑器组件，专注于提供复杂 JSON 数据的编辑、验证和交互能力。它的主要特点是：
- 支持大规模 JSON 数据的高性能编辑
- 提供字段级别的样式和交互定制
- 通过插件机制支持功能扩展

本组件适用于需要对 JSON 数据进行专业编辑和管理的场景，如配置管理系统、规则引擎设计器等。

> 📘 **相关文档**
> - 详细的使用场景请参考 [用户故事](./stories.md)
> - 术语解释请参考 [术语表](./glossary.md)
> - 技术实现请参考 [技术规范](./technical.md)

## 核心目标

1. **高度可定制**
   - 支持调用方通过 JSONPath（如 `$.store.book[*].author`）或正则表达式自定义字段匹配规则
   - 为命中匹配的内容提供样式定制能力：
     * 文字样式：颜色、字体、粗细、斜体等
     * 装饰样式：下划线（实线、虚线、波浪线）、背景色、边框等
     * 图标定制：内置图标集、自定义 SVG 图标、角标等
     * 扩展菜单：右键菜单项、快捷操作按钮等
   - 提供丰富的交互回调机制：
     * 点击事件：单击、双击、右键等
     * 悬浮事件：鼠标进入、离开等
     * 编辑事件：值变更、格式化等
     * 自定义事件：支持注册自定义事件类型
   - 支持特殊字段的语法校验和格式化 [➜ 详见术语表](./glossary.md#字段类型)
   - 提供字段级别的编辑控制：
     * 访问控制：只读、条件编辑
     * 值校验：格式、范围、依赖关系
     * 编辑提示：自动完成、值建议、错误提示

2. **优秀的用户体验**
   - 高性能文件处理：
     * 支持大文件（>1MB）分段加载
     * 实现虚拟滚动（仅渲染可视区域）
     * 后台加载和解析（不阻塞主线程）
   - 专业的编辑功能：
     * 代码折叠（支持快捷键和点击折叠）
     * 多光标编辑（支持 Alt+Click）
     * 块选择（支持 Shift+Alt+拖动）
     * 查找替换（支持正则表达式）
   - 极致的响应速度：
     * 输入响应 < 50ms
     * 滚动帧率 > 60fps
     * 解析速度 > 1MB/s
   - 智能的编辑辅助：
     * 基于上下文的代码补全
     * 实时的语法错误提示
     * 智能的格式化建议

3. **强大的扩展性**
   - 插件系统：
     * 支持运行时动态加载插件
     * 提供插件间通信机制
     * 支持插件的热插拔
     * 插件级别的资源隔离
   - 生命周期钩子：
     * 编辑器初始化前后
     * 内容加载和更新时
     * 特殊字段处理前后
     * 样式渲染前后
   - 事件系统：
     * 支持自定义事件的发布订阅
     * 提供事件过滤和转换能力
     * 支持异步事件处理
     * 内置事件日志和调试工具
   - 字段处理器：
     * 自定义字段的识别规则
     * 自定义字段的解析逻辑
     * 自定义字段的渲染组件
     * 支持处理器的优先级设置
   - 界面定制：
     * 支持自定义主题
     * 允许注入自定义组件
     * 提供布局自定义能力
     * 支持快捷键自定义

## 技术选型

- **核心框架**: React 18 + TypeScript 5.0
- **编辑器引擎**: CodeMirror 6
- **样式方案**: TailwindCSS 3.0
- **构建工具**: Vite 4.0
- **包管理**: pnpm 8.0

## 功能概览

### 1. 基础功能
> 详细的技术实现请参考 [技术规范](./technical.md#编辑器基础)

- JSON 数据的解析、校验和格式化
- 支持 JSON5 语法的容错解析
- 多主题的语法高亮
- 带行号的代码折叠

### 2. 匹配系统
> 详细的匹配规则请参考 [术语表](./glossary.md#匹配方式)

- 支持 JSONPath（如 `$.store.book[*].author`）
- 支持正则表达式（如字段值的格式校验）
- 支持组合匹配规则
- 匹配结果的样式和行为配置

### 3. 显示控制
> 具体使用场景请参考 [用户故事](./stories.md#基础编辑能力)

- 可配置的默认展示行数（如默认显示前 10 行）
- 支持代码块的展开/收起
- 大文件的分段加载和虚拟滚动

### 4. 扩展功能
> 技术细节请参考 [技术规范](./technical.md#扩展系统)

- 支持自定义插件的注册和管理
- 提供快捷键自定义
- 支持主题切换和自定义

### 5. 特殊字段支持
> 字段类型定义请参考 [术语表](./glossary.md#字段类型)

- **脚本字段**
  * JavaScript 语法检查和格式化
  * 提供脚本的测试执行环境
  * 支持上下文变量的智能提示

- **引用字段**
  * 引用完整性校验
  * 支持跳转到引用源
  * 提供引用关系的可视化

- **必填字段**
  * 实时的必填校验
  * 清晰的视觉提示
  * 一键定位所有必填项

## 项目规划

### 第一阶段：核心功能（M1）
> 详细的技术实现请参考 [技术规范](./technical.md#核心功能)

- 实现基础的 JSON 编辑功能
- 完成字段匹配系统
- 构建可配置的样式系统
- 实现特殊字段的处理机制

### 第二阶段：扩展能力（M2）
> 扩展机制说明请参考 [技术规范](./technical.md#扩展系统)

- 设计并实现插件系统
- 完成生命周期钩子机制
- 构建事件总线系统

### 第三阶段：高级特性（M3）
> 具体场景请参考 [用户故事](./stories.md#扩展支持)

- 实现高级交互功能
- 完成性能优化目标
- 补充技术文档

## 质量目标

1. **性能指标**
   - 编辑器初始化时间：冷启动 < 500ms，热启动 < 200ms
   - 按键响应时间：输入延迟 < 50ms
   - 大文件(>1MB)首次渲染时间 < 1s
   - 内存占用：静态 < 50MB，峰值 < 100MB

2. **代码质量**
   - TypeScript 类型覆盖率 > 95%
   - 单元测试覆盖率 > 80%
   - 零阻塞性 bug，P0 级别问题修复时间 < 24h

3. **用户体验**
   > 详细的用户体验要求请参考 [用户故事](./stories.md#通用需求)
   - 操作响应及时，无明显卡顿
   - 遵循主流编辑器的快捷键习惯
   - 提供清晰的错误提示和操作引导

## 交付标准

1. **代码要求**
   > 详细的技术规范请参考 [技术规范](./technical.md)
   - 完整的 TypeScript 类型定义
   - 符合 JSDoc 规范的注释
   - 遵循 ESLint 配置的代码风格

2. **文档要求**
   - 包含完整的 API 文档和类型定义
   - 提供常见使用场景的代码示例
   - 包含架构设计和扩展开发指南

3. **测试要求**
   - 完整的单元测试套件
   - 核心功能的集成测试
   - 性能测试报告和基准数据 