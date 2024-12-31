import React, { useRef, useEffect, useState } from 'react';
import { EditorCore } from '../core/editor-core';
import { EditorConfig } from '../core/types';
import { Toolbar } from './components/Toolbar';
import { StatusBar } from './components/StatusBar';

export interface JsonEditorProps {
    // UI 相关配置
    className?: string;
    style?: React.CSSProperties;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onError?: (error: Error) => void;
    
    // 编辑器核心配置
    config?: EditorConfig;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
    className,
    style,
    defaultValue = '',
    onChange,
    onError,
    config = {}
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorCore | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });
    const [jsonSize, setJsonSize] = useState({ lines: 1, bytes: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        try {
            editorRef.current = new EditorCore(containerRef.current, {
                ...config,
                value: defaultValue,
                onChange: (value: string) => {
                    setError(null);
                    onChange?.(value);
                },
                onError: (err: Error) => {
                    setError(err.message);
                    onError?.(err);
                },
                onCursorActivity: (info: { line: number; col: number }) => {
                    setCursorInfo(info);
                },
                onDocChanged: (info: { lines: number; bytes: number }) => {
                    setJsonSize(info);
                }
            });
        } catch (err) {
            console.error('Failed to initialize editor:', err);
            setError(err instanceof Error ? err.message : String(err));
            onError?.(err instanceof Error ? err : new Error(String(err)));
        }

        return () => {
            editorRef.current?.destroy();
        };
    }, [config]);

    const handleFormat = () => {
        try {
            editorRef.current?.format();
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const handleMinify = () => {
        try {
            editorRef.current?.minify();
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const handleValidate = () => {
        try {
            editorRef.current?.validate();
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    return (
        <div className={`json-editor-container ${className || ''}`} style={style}>
            <Toolbar
                onFormat={handleFormat}
                onMinify={handleMinify}
                onValidate={handleValidate}
                error={error}
            />
            <div ref={containerRef} className="json-editor-content" />
            <StatusBar
                error={error}
                cursorInfo={cursorInfo}
                jsonSize={jsonSize}
            />
        </div>
    );
}; 