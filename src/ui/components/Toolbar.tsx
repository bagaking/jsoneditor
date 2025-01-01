import React, { useState } from 'react';
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
    const [isExpanded, setIsExpanded] = useState(false);
    
    const EDITOR_ACTIONS: string[] = ['validate', 'expand'] as const;
    
    const getButtons = (): React.ReactNode[] => {
        const buttons = [];
        
        if (config.features?.validate) buttons.push(<button key="validate" onClick={handlers.onValidate} className={buttonClassNames.validate(state.isValid)}>验证</button>);
        if (config.features?.expand) buttons.push(<button key="expand" onClick={handlers.onToggleExpand} className={buttonClassNames.default}>展开</button>);

        if (config.features?.format) buttons.push(<button key="format" onClick={handlers.onFormat} className={buttonClassNames.default}>格式化</button>);
        if (config.features?.minify) buttons.push(<button key="minify" onClick={handlers.onMinify} className={buttonClassNames.default}>压缩</button>);
        if (config.features?.copy) buttons.push(<button key="copy" onClick={handlers.onCopy} className={buttonClassNames.default}>复制</button>);
        
        return [...buttons, ...(config.customButtons?.map(btn => editor && btn.render(editor)) || [])];
    };
    
    return (
        <div 
            className={`
                fixed bottom-0 sm:sticky sm:top-0 sm:bottom-auto
                w-full z-20
                bg-white/95 dark:bg-gray-900/95 
                backdrop-blur-sm
                border-t sm:border-t-0 sm:border-b 
                border-gray-200 dark:border-gray-700/50
                transition-all duration-300 ease-in-out
                ${config.className || ''}
            `}
            style={config.style}
        >
            {/* 桌面端工具栏 */}
            <div className="sm:flex items-center justify-between p-2">
                <div className="flex items-center gap-1.5">
                    {getButtons()
                        .filter((btn: React.ReactNode) => React.isValidElement(btn) && EDITOR_ACTIONS.includes(btn.key as string))
                        .map(btn => (
                            <div key={React.isValidElement(btn) ? btn.key : undefined}>
                                {btn}
                            </div>
                        ))
                    }
                </div>
                <div className="flex items-center gap-1.5">
                    {getButtons()
                        .filter(btn => React.isValidElement(btn) && !EDITOR_ACTIONS.includes(btn.key as string))
                        .map(btn => (
                            <div key={React.isValidElement(btn) ? btn.key : undefined}>
                                {btn}
                            </div>
                        ))
                    }
                </div>
            </div>

        </div>
    );
}; 