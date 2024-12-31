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
        <div className="json-editor-toolbar">
            <button onClick={onFormat} title="Format JSON">
                Format
            </button>
            <button onClick={onMinify} title="Minify JSON">
                Minify
            </button>
            <button onClick={onValidate} title="Validate JSON">
                Validate
            </button>
            {error && (
                <span className="json-editor-error" title={error}>
                    ⚠️ {error}
                </span>
            )}
        </div>
    );
}; 