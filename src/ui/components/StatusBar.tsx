import React from 'react';

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
    className?: string;
    style?: React.CSSProperties;
}

export const StatusBar: React.FC<StatusBarProps> = ({
    error,
    cursorInfo,
    jsonSize,
    isValid,
    className,
    style
}) => {
    
    return (
        <div className={`
            sticky bottom-0
            flex justify-between items-center 
            px-3 py-1 text-xs 
            bg-white/90 dark:bg-gray-900/90
            backdrop-blur-sm
            border-t border-gray-200 dark:border-gray-700
            z-10
            ${className || ''}
        `}
        style={style}
        data-bkjson-status
        >
            <div className="flex items-center gap-2">
                {error ? (
                    <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1" title={error}>
                        <span className="text-red-500 dark:text-red-400">⚠️</span>
                        {error}
                    </span>
                ) : (
                    <span className={`flex items-center gap-1 font-semibold ${
                        isValid 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-600 dark:text-gray-300'
                    }`}>
                        {isValid ? '✓' : '✎'} {isValid ? 'Valid JSON' : 'Editing...'}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                <span title="Cursor position" className="font-medium flex items-center gap-1">
                    <span className="opacity-60">Ln</span> {cursorInfo.line}, <span className="opacity-60">Col</span> {cursorInfo.col}
                </span>
                <span title="Document size" className="font-medium flex items-center gap-1">
                    <span className="opacity-60">{jsonSize.lines}</span> lines, <span className="opacity-60">{jsonSize.bytes}</span> bytes
                </span>
            </div>
        </div>
    );
}; 