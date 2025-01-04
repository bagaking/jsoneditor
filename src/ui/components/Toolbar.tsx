import React, { useState } from 'react';
import { EditorCore } from '../../core/editor-core';
import { ToolbarConfig } from '../types';

const buttonClassNames = {
    default: `
        px-2 py-1
        text-gray-600 dark:text-gray-300
        text-xs font-medium
        rounded
        transition-all duration-200
        hover:bg-gray-100/80 dark:hover:bg-gray-800/60
        active:bg-gray-200/90 dark:active:bg-gray-700/70
        focus:outline-none focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700
    `,
    validate: (isValid: boolean | undefined) => `
        px-2 py-1
        text-xs font-medium
        rounded
        transition-all duration-200
        focus:outline-none focus:ring-1
        ${isValid 
            ? 'text-green-600 dark:text-green-400 hover:bg-green-50/80 dark:hover:bg-green-900/30 focus:ring-green-200 dark:focus:ring-green-800'
            : 'text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/30 focus:ring-red-200 dark:focus:ring-red-800'
        }
    `
};

const EDITOR_ACTIONS: string[] = ['validate', 'expand'] as const;

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
    className?: string;
    style?: React.CSSProperties;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    config,
    editor,
    state,
    handlers,
}) => {
    const [isExpanded, setIsExpanded] = useState(state.isExpanded);

    const getButtons = (): React.ReactNode[] => {
        const buttons = [];
        
        if (config.features?.validate) buttons.push(
            <button key="validate" onClick={handlers.onValidate} className={buttonClassNames.validate(state.isValid)}>
                Validate
            </button>
        );
        if (config.features?.expand) buttons.push(
            <button key="expand" onClick={() => {
                setIsExpanded(!isExpanded);
                handlers.onToggleExpand?.();
            }} className={buttonClassNames.default}>
                {isExpanded ? 'Collapse' : 'Expand'}
            </button>
        );

        if (config.features?.format) buttons.push(
            <button key="format" onClick={handlers.onFormat} className={buttonClassNames.default}>
                Format
            </button>
        );
        if (config.features?.minify) buttons.push(
            <button key="minify" onClick={handlers.onMinify} className={buttonClassNames.default}>
                Minify
            </button>
        );
        if (config.features?.copy) buttons.push(
            <button key="copy" onClick={handlers.onCopy} className={buttonClassNames.default}>
                Copy
            </button>
        );
        
        return [...buttons, ...(config.customButtons?.map(btn => editor && btn.render(editor)) || [])];
    };
    
    return (
        <div 
            className={`
                sticky top-0
                w-full z-20
                bg-white/90 dark:bg-gray-900/90
                backdrop-blur-sm
                shadow-sm dark:shadow-gray-800/30
                transition-all duration-300 ease-in-out
                ${config.className || ''}
            `}
            style={config.style}
            data-bkjson-toolbar
        >
            <div className="px-2 flex flex-wrap items-center gap-1.5">
                <div className="flex items-center gap-1">
                    {getButtons()
                        .filter((btn: React.ReactNode) => React.isValidElement(btn) && EDITOR_ACTIONS.includes(btn.key as string))
                        .map(btn => (
                            <div key={React.isValidElement(btn) ? btn.key : undefined}>
                                {btn}
                            </div>
                        ))
                    }
                </div>
                <div className="flex-grow" />
                <div className="flex items-center gap-1">
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