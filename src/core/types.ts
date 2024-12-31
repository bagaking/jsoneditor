import type { Extension } from '@codemirror/state';

// 基础样式类型
export type BaseStyle = 'underline' | 'bold' | 'italic';

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
     * 点击回调
     */
    onClick?: (value: string) => void;
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
    container: HTMLElement;
    content?: string;
    schema?: object;
    readonly?: boolean;
    autoFormat?: boolean;
    validateOnChange?: boolean;
    theme?: 'light' | 'dark';
    extensions?: Extension[];
    decoration?: DecorationConfig;
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
 * 主题配置
 */
export interface ThemeConfig {
    name: string;
    styles: {
        background: string;
        color: string;
        fontSize: string;
        fontFamily: string;
        lineHeight: string;
        padding: string;
    };
    syntax: {
        string: string;
        number: string;
        boolean: string;
        null: string;
        key: string;
        error: string;
    };
}

/**
 * 插件接口
 */
export interface Plugin {
    name: string;
    version: string;
    extensions?: Extension[];
    activate: (editor: any) => void;
    deactivate: () => void;
} 