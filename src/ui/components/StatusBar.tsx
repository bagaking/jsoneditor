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
}

export const StatusBar: React.FC<StatusBarProps> = ({
    error,
    cursorInfo,
    jsonSize
}) => {
    return (
        <div className="json-editor-statusbar">
            <div className="json-editor-statusbar-left">
                {error ? (
                    <span className="json-editor-error" title={error}>
                        ⚠️ {error}
                    </span>
                ) : (
                    <span className="json-editor-status">
                        Valid JSON
                    </span>
                )}
            </div>
            <div className="json-editor-statusbar-right">
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