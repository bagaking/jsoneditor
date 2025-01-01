import type { Extension } from '@codemirror/state';

// 基础样式类型
export type BaseStyle = 'underline' | 'bold' | 'italic';

/**
 * 代码编辑器设置
 */
export interface CodeSettings {
  /**
   * 字体大小
   */
  fontSize?: number;
  /**
   * 是否显示行号
   */
  lineNumbers?: boolean;
  /**
   * 是否启用括号匹配
   */
  bracketMatching?: boolean;
  /**
   * 是否启用自动完成
   */
  autoCompletion?: boolean;
  /**
   * 是否启用活动行高亮
   */
  highlightActiveLine?: boolean;

  /**
   * 编辑器焦点保持策略
   * 
   * @description
   * 控制编辑器在失去焦点时如何处理焦点恢复：
   * 
   * - 'soft': 温和模式，仅在焦点完全丢失时恢复
   *   适用于编辑器需要和其他交互元素（如日期选择器、下拉框等）共存的场景
   * 
   * - 'strict': 严格模式，主动恢复焦点到编辑器
   *   适用于编辑器是主要交互区域，需要保持持续焦点的场景
   * 
   * - 'manual': 手动模式，完全不自动恢复焦点
   *   适用于编辑器焦点需要完全手动控制的场景
   * 
   * @default 'soft'
   */
  focusRetentionStrategy?: 'soft' | 'strict' | 'manual';
}

/**
 * Schema 配置
 */
export interface SchemaConfig {
  /**
   * JSON Schema 对象
   */
  schema?: object;
  /**
   * 是否在输入时验证
   */
  validateOnType?: boolean;
  /**
   * 验证防抖时间(ms)
   */
  validateDebounce?: number;
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /**
   * 主题类型
   */
  theme?: 'light' | 'dark';
  /**
   * 自定义主题扩展
   */
  themeExtensions?: Extension[];
}

/**
 * 验证配置
 */
export interface ValidationConfig {
  /**
   * 是否在更改时验证
   */
  validateOnChange?: boolean;
  /**
   * 是否自动格式化
   */
  autoFormat?: boolean;
}

// 自定义组件类型
export interface CustomComponent {
    type: 'component';
    render: (props: {
        value: string;
        onClick?: (value: string) => void;
    }) => HTMLElement;
}

// 装饰样式类型
export type DecorationStyle = BaseStyle | string | CustomComponent;

/**
 * URL 处理器配置
 */
export interface UrlHandler {
    /**
     * 自定义组件
     * 如果不提供,则使用默认的链接按钮
     */
    component?: CustomComponent;
    /**
     * 点击回调
     * 如果不提供,则默认在新标签页打开链接
     */
    onClick?: (url: string) => void;
}

export type DecorationPathHook = {
    /**
     * 装饰样式
     * - 'underline': 下划线样式
     * - 'bold': 粗体样式
     * - 'italic': 斜体样式
     * - 'underline bold': 组合样式
     * - CustomComponent: 自定义组件
     */
    style: DecorationStyle;
    /**
     * 装饰目标
     * - 'key': 只装饰键
     * - 'value': 只装饰值
     * - 'both': 同时装饰键和值
     * @default 'key'
     */
    target?: 'key' | 'value' | 'both';
    /**
     * 点击回调
     * 注意: 设置此选项会在目标区域添加点击事件，
     * 但不会阻止文本选择等其他交互
     */
    onClick?: (value: string) => void;
    /** 图标 */
    icon?: string;
}

/**
 * 装饰配置
 */
export interface DecorationConfig {
    /**
     * 路径装饰配置
     */
    paths?: {
        [path: string]: DecorationPathHook;
    };

    /**
     * URL 处理器
     * 用于自定义 URL 的展示和交互方式
     * 如果不提供,则使用默认的链接按钮
     */
    urlHandler?: UrlHandler;
}

/**
 * 编辑器配置
 */
export interface EditorConfig {
    // 基础配置
    container?: HTMLElement;
    value?: string;
    readonly?: boolean;

    // 功能配置
    codeSettings?: CodeSettings;
    schemaConfig?: SchemaConfig;
    themeConfig?: ThemeConfig;
    decorationConfig?: DecorationConfig;
    validationConfig?: ValidationConfig;
    extensions?: Extension[];

    // 回调函数
    onChange?: (value: string) => void;
    onError?: (error: Error) => void;
    onCursorActivity?: (info: { line: number; col: number }) => void;
    onDocChanged?: (info: { lines: number; bytes: number }) => void;
}

/**
 * 验证错误
 */
export interface ValidationError {
    path: string;
    message: string;
    keyword: string;
    params?: Record<string, any>;
}

 
/**
 * JSON Schema 相关类型
 */
export interface JsonSchemaProperty {
    type?: string;
    description?: string;
    enum?: any[];
    properties?: Record<string, JsonSchemaProperty>;
    items?: JsonSchemaProperty;
    required?: string[];
    [key: string]: any;
}