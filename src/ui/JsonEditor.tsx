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

    // 重新初始化编辑器
    const initEditor = () => {
        if (!containerRef.current) return;

        // 销毁旧的编辑器实例
        editorRef.current?.destroy();

        try {
            // 确保有初始值
            const initialValue = defaultValue || '';
            
            // 创建新的编辑器实例
            editorRef.current = new EditorCore(containerRef.current, {
                ...config,
                value: initialValue,
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

            // 设置初始内容
            if (initialValue) {
                try {
                    const formattedValue = JSON.stringify(JSON.parse(initialValue), null, 2);
                    editorRef.current.setValue(formattedValue);
                } catch (err) {
                    console.warn('Failed to format initial JSON:', err);
                    editorRef.current.setValue(initialValue);
                }
            }
        } catch (err) {
            console.error('Failed to initialize editor:', err);
            setError(err instanceof Error ? err.message : String(err));
            onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    };

    // 监听配置变化，重新初始化编辑器
    useEffect(() => {
        initEditor();
        return () => {
            editorRef.current?.destroy();
        };
    }, [config, defaultValue]);

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
        <div className={`flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className || ''}`} style={style}>
            <Toolbar
                onFormat={handleFormat}
                onMinify={handleMinify}
                onValidate={handleValidate}
                error={error}
            />
            <div ref={containerRef} className="flex-1 overflow-auto min-h-[400px] text-gray-800 dark:text-gray-200" />
            <StatusBar
                error={error}
                cursorInfo={cursorInfo}
                jsonSize={jsonSize}
            />
        </div>
    );
}; 