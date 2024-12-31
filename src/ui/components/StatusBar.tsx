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
}

export const StatusBar: React.FC<StatusBarProps> = ({
    error,
    cursorInfo,
    jsonSize,
    isValid
}) => {
    return (
        <div className="flex justify-between items-center px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
                {error ? (
                    <span className="text-red-500 dark:text-red-400" title={error}>
                        ⚠️ {error}
                    </span>
                ) : (
                    <span className={`${isValid ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {isValid ? 'Valid JSON' : 'Editing...'}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                <span title="Cursor position">
                    Ln {cursorInfo.line}, Col {cursorInfo.col}
                </span>
                <span title="Document size">
                    {jsonSize.lines} lines, {jsonSize.bytes} bytes
                </span>
            </div>
        </div>
    );
}; 