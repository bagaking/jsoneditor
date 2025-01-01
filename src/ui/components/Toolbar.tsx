import React from 'react';
import { ToolbarProps } from '../types';

const buttonClassNames = {
    default: "px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/90 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md transition-colors border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500",
    validate: (isValid: boolean | undefined) => `px-3 py-1.5 ${
        isValid 
            ? 'bg-green-50 hover:bg-green-100 dark:bg-green-900/40 dark:hover:bg-green-800/60 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600'
            : 'bg-red-50 hover:bg-red-100 dark:bg-red-900/40 dark:hover:bg-red-800/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600'
    } text-sm font-medium rounded-md transition-colors`
};

export const Toolbar: React.FC<ToolbarProps> = ({
    config,
    editor,
    state,
    handlers
}) => {
    const { features = {}, customButtons = [], buttonOrder = [] } = config;
    const { isValid, isExpanded } = state;
    const {
        onFormat,
        onMinify,
        onValidate,
        onCopy,
        onToggleExpand
    } = handlers;

    // 默认按钮配置
    const defaultButtons: Record<string, React.ReactNode> = {
        format: features.format && (
            <button
                key="format"
                onClick={onFormat}
                className={buttonClassNames.default}
                title="Format JSON"
            >
                Format
            </button>
        ),
        minify: features.minify && (
            <button
                key="minify"
                onClick={onMinify}
                className={buttonClassNames.default}
                title="Minify JSON"
            >
                Minify
            </button>
        ),
        validate: features.validate && (
            <button
                key="validate"
                onClick={onValidate}
                className={buttonClassNames.validate(isValid)}
                title="Validate JSON"
            >
                Validate
            </button>
        ),
        copy: features.copy && (
            <button
                key="copy"
                onClick={onCopy}
                className={buttonClassNames.default}
                title="Copy JSON"
            >
                Copy
            </button>
        ),
        expand: features.expand && (
            <button
                key="expand"
                onClick={onToggleExpand}
                className={buttonClassNames.default}
                title={isExpanded ? "Collapse" : "Expand"}
            >
                {isExpanded ? "Collapse" : "Expand"}
            </button>
        )
    };

    // 获取要显示的按钮
    const getButtons = () => {
        const buttons = { ...defaultButtons };
        
        // 添加自定义按钮
        if (editor) {  // 只在 editor 存在时添加自定义按钮
            customButtons.forEach(btn => {
                buttons[btn.key] = btn.render(editor);
            });
        }
        
        // 按指定顺序排序，如果没有指定顺序，使用默认顺序
        const order = buttonOrder.length > 0 
            ? buttonOrder 
            : ['format', 'minify', 'validate', 'copy', 'expand', ...customButtons.map(b => b.key)];
            
        return order
            .map(key => buttons[key])
            .filter(Boolean);
    };

    return (
        <div 
            className={`flex items-center gap-2 p-3 bg-white dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700 ${config.className || ''}`}
            style={config.style}
        >
            {getButtons()}
        </div>
    );
}; 