import { DecorationConfig, CodeSettings, SchemaConfig, ThemeConfig, ValidationConfig } from '../core/types';
import { EditorCore } from '../core/editor-core';
import { JsonSchemaProperty } from '../extensions/path';
import React from 'react';
import { Extension } from '@codemirror/state';

// 主题类型
export type Theme = 'light' | 'dark';

// 工具栏配置
export interface ToolbarConfig {
  position?: 'top' | 'bottom' | 'none';
  className?: string;
  style?: React.CSSProperties;
  
  features?: {
    format?: boolean;
    minify?: boolean;
    validate?: boolean;
    copy?: boolean;
    expand?: boolean;
  };
  
  customButtons?: Array<{
    key: string;
    render: (editor: EditorCore) => React.ReactNode;
  }>;
  
  buttonOrder?: string[];
}

// 展开/收缩配置
export interface ExpandOption {
  defaultExpanded?: boolean;
  
  expanded: {
    minHeight?: string;
    maxHeight?: string;
    autoHeight?: boolean;
  };
  
  collapsed: {
    height?: string;
    lines?: number;
    showMore?: boolean;
    moreText?: string;
  };
  
  animation?: {
    enabled?: boolean;
    duration?: number;
    timing?: string;
  };
  
  onExpandChange?: (expanded: boolean) => void;
}

// JsonEditor 属性
export interface JsonEditorProps {
  // 基础属性
  className?: string;
  style?: React.CSSProperties;
  defaultValue?: string;
  readOnly?: boolean;

  // 回调函数
  onValueChange?: (value: string) => void;
  onError?: (error: Error) => void;

  // 编辑器配置
  codeSettings?: CodeSettings;
  schemaConfig?: SchemaConfig;
  themeConfig?: ThemeConfig;
  decorationConfig?: DecorationConfig;
  validationConfig?: ValidationConfig;
  extensions?: Extension[];

  // UI 配置
  toolbarConfig?: ToolbarConfig;
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