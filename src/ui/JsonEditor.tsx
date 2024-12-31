import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { EditorCore } from '../core/editor-core';
import { EditorConfig, ValidationError } from '../core/types';
import { Toolbar } from './components/Toolbar';
import { StatusBar } from './components/StatusBar';
import { validateWithSchema } from '../core/schema';

// 防抖函数
const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
};

export interface JsonEditorProps {
    className?: string;
    style?: React.CSSProperties;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onError?: (error: Error) => void;
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
    const configRef = useRef(config);
    const [error, setError] = useState<string | null>(null);
    const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });
    const [jsonSize, setJsonSize] = useState({ lines: 1, bytes: 0 });
    const [isValid, setIsValid] = useState(true);
    
    // 使用 useRef 存储所有可变的配置和回调
    const stateRef = useRef({
        onChange,
        onError,
        validateOnChange: config.validateOnChange,
        schema: config.schema,
        theme: config.theme,
        decoration: config.decoration,
        defaultValue
    });
    
    // 只在必要的配置变化时更新引用
    useEffect(() => {
        const needsUpdate = 
            stateRef.current.schema !== config.schema ||
            stateRef.current.theme !== config.theme ||
            stateRef.current.decoration !== config.decoration ||
            stateRef.current.defaultValue !== defaultValue;
            
        if (needsUpdate) {
            console.log('Updating config refs');
            stateRef.current = {
                ...stateRef.current,
                schema: config.schema,
                theme: config.theme,
                decoration: config.decoration,
                defaultValue
            };
        }
    }, [config.schema, config.theme, config.decoration, defaultValue]);

    // 更新回调引用
    useEffect(() => {
        stateRef.current = {
            ...stateRef.current,
            onChange,
            onError,
            validateOnChange: config.validateOnChange
        };
    }, [onChange, onError, config.validateOnChange]);

    // 验证函数 - 不依赖任何 props
    const validateJson = useCallback((value: string) => {
        console.log('Validating JSON:', { valueLength: value.length });
        let newError: string | null = null;
        let newIsValid = true;

        try {
            // 基本语法验证
            JSON.parse(value);
            
            // Schema 验证
            if (stateRef.current.schema) {
                const errors = validateWithSchema(value, stateRef.current.schema);
                if (errors.length > 0) {
                    newError = errors[0].message;
                    newIsValid = false;
                }
            }
        } catch (err) {
            newError = err instanceof Error ? err.message : String(err);
            newIsValid = false;
        }

        // 批量更新状态
        console.log('Validation result:', { newError, newIsValid });
        setError(newError);
        setIsValid(newIsValid);
        if (newError && stateRef.current.onError) {
            stateRef.current.onError(new Error(newError));
        }
    }, []); // 无依赖

    // 使用防抖的验证函数 - 不依赖任何 props
    const debouncedValidate = useMemo(
        () => debounce((value: string) => validateJson(value), 300),
        [validateJson]
    );

    // 内容变化处理 - 不依赖任何 props
    const handleChange = useCallback((value: string) => {
        console.log('Content changed:', { valueLength: value.length });
        // 总是触发 onChange
        stateRef.current.onChange?.(value);
        // 如果启用了验证，使用防抖验证
        if (stateRef.current.validateOnChange) {
            setIsValid(false);
            debouncedValidate(value);
        }
    }, [debouncedValidate]);

    // 光标位置变化处理 - 不依赖任何 props
    const handleCursorActivity = useCallback((info: { line: number; col: number }) => {
        setCursorInfo(info);
    }, []);

    // 文档大小变化处理 - 不依赖任何 props
    const handleDocChanged = useCallback((info: { lines: number; bytes: number }) => {
        setJsonSize(info);
    }, []);

    // 初始化编辑器
    useEffect(() => {
        console.log('Initializing editor...');
        if (!containerRef.current) {
            console.log('Container ref not ready');
            return;
        }

        try {
            // 创建新的编辑器实例
            editorRef.current = new EditorCore(containerRef.current, {
                value: stateRef.current.defaultValue,
                theme: stateRef.current.theme,
                schema: stateRef.current.schema,
                decoration: stateRef.current.decoration,
                onChange: handleChange,
                onCursorActivity: handleCursorActivity,
                onDocChanged: handleDocChanged
            });

            // 初始验证
            if (stateRef.current.validateOnChange && stateRef.current.defaultValue) {
                console.log('Performing initial validation');
                validateJson(stateRef.current.defaultValue);
            }

            console.log('Editor initialized successfully');
        } catch (err) {
            console.error('Failed to initialize editor:', err);
            setError(err instanceof Error ? err.message : String(err));
            setIsValid(false);
            stateRef.current.onError?.(err instanceof Error ? err : new Error(String(err)));
        }

        return () => {
            console.log('Cleaning up editor');
            editorRef.current?.destroy();
            editorRef.current = null;
        };
    }, []); // 只在组件挂载时初始化一次

    // 配置变化时更新编辑器
    useEffect(() => {
        if (!editorRef.current) return;

        const currentConfig = {
            theme: stateRef.current.theme,
            schema: stateRef.current.schema,
            decoration: stateRef.current.decoration
        };

        console.log('Updating editor config');
        editorRef.current.updateConfig(currentConfig);
    }, [config.theme, config.schema, config.decoration]);

    // 格式化处理
    const handleFormat = useCallback(() => {
        console.log('Formatting JSON');
        if (!editorRef.current) return;
        const content = editorRef.current.getValue();
        try {
            const formatted = JSON.stringify(JSON.parse(content), null, 2);
            editorRef.current.setValue(formatted);
            setError(null);
            setIsValid(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setIsValid(false);
            stateRef.current.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    }, []);

    // 压缩处理
    const handleMinify = useCallback(() => {
        console.log('Minifying JSON');
        if (!editorRef.current) return;
        const content = editorRef.current.getValue();
        try {
            const minified = JSON.stringify(JSON.parse(content));
            editorRef.current.setValue(minified);
            setError(null);
            setIsValid(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setIsValid(false);
            stateRef.current.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    }, []);

    // 手动验证处理
    const handleValidate = useCallback(() => {
        console.log('Manual validation triggered');
        if (!editorRef.current) return;
        validateJson(editorRef.current.getValue());
    }, [validateJson]);

    return (
        <div className={`flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className || ''}`} style={style}>
            <Toolbar
                onFormat={handleFormat}
                onMinify={handleMinify}
                onValidate={handleValidate}
                isValid={isValid}
            />
            <div ref={containerRef} className="flex-1 overflow-auto min-h-[400px] text-gray-800 dark:text-gray-200" />
            <StatusBar
                cursorInfo={cursorInfo}
                jsonSize={jsonSize}
                isValid={isValid}
            />
            {error && (
                <div className="p-2 bg-red-50 dark:bg-red-900/30 border-t border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
}; 