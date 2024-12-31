import React from 'react';

export interface ToolbarProps {
    onFormat?: () => void;
    onMinify?: () => void;
    onValidate?: () => void;
    error?: string | null;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    onFormat,
    onMinify,
    onValidate,
    error
}) => {
    return (
        <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <button
                onClick={onFormat}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-gray-700 dark:text-blue-400 text-sm font-medium rounded-md transition-colors"
                title="Format JSON"
            >
                Format
            </button>
            <button
                onClick={onMinify}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-gray-700 dark:text-blue-400 text-sm font-medium rounded-md transition-colors"
                title="Minify JSON"
            >
                Minify
            </button>
            <button
                onClick={onValidate}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-gray-700 dark:text-blue-400 text-sm font-medium rounded-md transition-colors"
                title="Validate JSON"
            >
                Validate
            </button>
            {error && (
                <span className="ml-auto text-sm text-red-600 dark:text-red-400" title={error}>
                    ⚠️ {error}
                </span>
            )}
        </div>
    );
}; 