import { DecorationConfig, CodeSettings, SchemaConfig, ThemeConfig, ValidationConfig, JsonSchemaProperty } from '../core/types';
import { EditorCore } from '../core/editor-core';

import React from 'react';
import { Extension } from '@codemirror/state';

// 主题类型
export type Theme = 'light' | 'dark';

// 按钮样式配置
export interface ButtonStyle {
    className?: string;
    style?: React.CSSProperties;
    icon?: React.ReactNode;
    text?: string;
    tooltip?: string;
}

// 按钮组配置
export interface ButtonGroup {
    key: string;
    buttons: string[];
    className?: string;
    style?: React.CSSProperties;
}

// 工具栏配置
export interface ToolbarConfig {
    position?: 'top' | 'bottom' | 'none';
    className?: string;
    style?: React.CSSProperties;
    
    // 功能开关
    features?: {
        format?: boolean;
        minify?: boolean;
        validate?: boolean;
        copy?: boolean;
        expand?: boolean;
    };
    
    // 自定义按钮
    customButtons?: Array<{
        key: string;
        render: (editor: EditorCore) => React.ReactNode;
    }>;
    
    // 按钮排序
    buttonOrder?: string[];

    // 按钮分组
    buttonGroups?: ButtonGroup[];

    // 按钮样式
    buttonStyles?: Record<string, ButtonStyle>;

    // 分隔符样式
    dividerStyle?: React.CSSProperties;
}

// 状态栏配置
export interface StatusBarConfig extends ComponentStyles {
    // 显示项配置
    features?: {
        error?: boolean;
        cursorPosition?: boolean;
        documentSize?: boolean;
        validStatus?: boolean;
    };

    // 格式化配置
    format?: {
        bytes?: (bytes: number) => string;
        position?: (line: number, col: number) => string;
        error?: (error: string) => string;
    };

    // 图标配置
    icons?: {
        error?: React.ReactNode;
        valid?: React.ReactNode;
        editing?: React.ReactNode;
    };

    // 布局配置
    layout?: {
        order?: string[];
        dividerStyle?: React.CSSProperties;
    };
}

// Schema 信息面板配置
export interface SchemaInfoConfig extends ComponentStyles {
    // 布局配置
    layout?: {
        showDescription?: boolean;
        showPath?: boolean;
        showType?: boolean;
        showRequired?: boolean;
        order?: string[];
        dividerStyle?: React.CSSProperties;
    };

    // 输入控件配置
    inputs?: {
        // 基础样式
        baseStyle?: React.CSSProperties;
        className?: string;

        // 特定类型的控件配置
        dateTime?: {
            showTime?: boolean;
            format?: string;
            icons?: {
                date?: React.ReactNode;
                time?: React.ReactNode;
            };
        };
        color?: {
            showPicker?: boolean;
            showInput?: boolean;
            format?: 'hex' | 'rgb' | 'hsl';
        };
        enum?: {
            renderItem?: (value: any) => React.ReactNode;
            placeholder?: string;
        };
        boolean?: {
            type?: 'switch' | 'checkbox' | 'button';
            labels?: {
                true?: string;
                false?: string;
            };
        };
    };

    // 格式化配置
    format?: {
        path?: (path: string) => string;
        type?: (type: string, format?: string) => string;
        description?: (desc: string) => string;
    };
}

// 展开/收缩配置
export interface ExpandOption {
    /** 默认是否展开 */
    defaultExpanded?: boolean;
    
    /** 收起时显示的行数 */
    collapsedLines?: number;
    
    /** 动画配置 */
    animation?: {
        /** 是否启用动画 */
        enabled?: boolean;
        /** 动画持续时间(ms) */
        duration?: number;
        /** 动画缓动函数 */
        timing?: string;
    };
    
    /** 展开状态变化回调 */
    onExpandChange?: (expanded: boolean) => void;
}

/**
 * 子组件样式配置
 */
export interface ComponentStyles {
    className?: string;
    style?: React.CSSProperties;
}

/**
 * 编辑器组件 Props
 */
export interface JsonEditorProps {
    // 基础属性
    className?: string;
    style?: React.CSSProperties;
    defaultValue?: string;
    readOnly?: boolean;

    // 回调函数
    onValueChange?: (value: string) => void;
    onError?: (error: Error) => void;
    onCopy?: (content: string) => void;

    // 编辑器配置
    codeSettings?: CodeSettings;
    schemaConfig?: SchemaConfig;
    themeConfig?: ThemeConfig;
    decorationConfig?: DecorationConfig;
    validationConfig?: ValidationConfig;
    extensions?: Extension[];

    // UI 配置
    toolbarConfig?: ToolbarConfig & ComponentStyles;
    statusBarConfig?: StatusBarConfig;
    schemaInfoConfig?: SchemaInfoConfig;
    expandOption?: ExpandOption;
}

// 工具栏组件属性
export interface ToolbarProps {
  config: ToolbarConfig;
  editor: EditorCore | null;
  state: {
    isValid?: boolean;
    isExpanded?: boolean;
  };
  handlers: {
    onFormat?: () => void;
    onMinify?: () => void;
    onValidate?: () => void;
    onCopy?: () => void;
    onToggleExpand?: () => void;
  };
}

// Schema 信息面板属性
export interface SchemaInfo {
  path: string;
  schema: JsonSchemaProperty;
  value?: string;
  onValueChange?: (value: string) => void;
}

// 状态栏属性
export interface StatusBarProps {
  error?: string | null;
  cursorInfo: {
    line: number;
    col: number;
  };
  jsonSize: {
    lines: number;
    bytes: number;
  };
  isValid?: boolean;
} 