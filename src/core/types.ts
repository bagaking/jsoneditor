import type { Extension } from '@codemirror/state';

/**
 * 装饰配置
 */
export interface DecorationConfig {
    paths?: {
        [path: string]: {
            style?: 'underline' | 'background' | 'border';
            color?: string;
            onClick?: (value: any) => void;
        };
    };
    urlPaths?: string[];  // JSON paths that contain URL values
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