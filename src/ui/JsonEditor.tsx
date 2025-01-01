import React, { useRef, useEffect, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { EditorCore } from '../core/editor-core';
import { Toolbar } from './components/Toolbar';
import { StatusBar } from './components/StatusBar';
import { SchemaInfoPanel } from './components/SchemaInfoPanel';
import { JsonSchemaProperty } from '../core/types';
import { SchemaValidator } from '../core/schema-validator';
import { JsonEditorProps } from './types';

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

export const JsonEditor = forwardRef<EditorCore, JsonEditorProps>(({
    // 基础属性
    className,
    style,
    defaultValue = '',
    readOnly = false,

    // 回调函数
    onValueChange,
    onError,

    // 编辑器配置
    codeSettings = {},
    schemaConfig = {},
    themeConfig = {},
    decorationConfig,
    validationConfig = {},
    extensions = [],

    // UI 配置
    toolbarConfig,
    expandOption
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorCore | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });
    const [jsonSize, setJsonSize] = useState({ lines: 1, bytes: 0 });
    const [isValid, setIsValid] = useState(true);
    const [expanded, setExpanded] = useState(expandOption?.defaultExpanded ?? true);
    const [schemaInfo, setSchemaInfo] = useState<{
        path: string;
        schema: JsonSchemaProperty;
        value?: string;
    } | null>(null);
    
    // 使用 useRef 存储所有可变的配置和回调
    const stateRef = useRef({
        onValueChange,
        onError,
        validateOnChange: validationConfig?.validateOnChange,
        schema: schemaConfig?.schema,
        theme: themeConfig?.theme,
        decoration: decorationConfig,
        defaultValue,
        readOnly,
        fontSize: codeSettings?.fontSize
    });

    // 暴露编辑器实例给父组件
    useImperativeHandle(ref, () => editorRef.current!, []);
    
    // 计算编辑器样式
    const editorStyle = useMemo(() => {
        const baseStyle = {
            fontSize: `${codeSettings?.fontSize || 14}px`,
            ...style
        };

        if (!expandOption) return baseStyle;

        const { expanded: expandedConfig, collapsed: collapsedConfig, animation } = expandOption;

        const heightStyle = expanded
            ? {
                height: expandedConfig.autoHeight ? 'auto' : undefined,
                minHeight: expandedConfig.minHeight,
                maxHeight: expandedConfig.maxHeight
              }
            : {
                height: collapsedConfig.height ||
                  (collapsedConfig.lines ? `${collapsedConfig.lines * 20}px` : 'auto')
              };

        return {
            ...baseStyle,
            ...heightStyle,
            transition: animation?.enabled
                ? `height ${animation.duration || 300}ms ${animation.timing || 'ease-in-out'}`
                : 'none'
        };
    }, [expanded, expandOption, codeSettings?.fontSize, style]);
    
    // 只在必要的配置变化时更新引用
    useEffect(() => {
        const needsUpdate = 
            stateRef.current.schema !== schemaConfig?.schema ||
            stateRef.current.theme !== themeConfig?.theme ||
            stateRef.current.decoration !== decorationConfig ||
            stateRef.current.defaultValue !== defaultValue ||
            stateRef.current.readOnly !== readOnly ||
            stateRef.current.fontSize !== codeSettings?.fontSize;
            
        if (needsUpdate) {
            console.log('Updating config refs');
            stateRef.current = {
                ...stateRef.current,
                schema: schemaConfig?.schema,
                theme: themeConfig?.theme,
                decoration: decorationConfig,
                defaultValue,
                readOnly,
                fontSize: codeSettings?.fontSize
            };
        }
    }, [schemaConfig?.schema, themeConfig?.theme, decorationConfig, defaultValue, readOnly, codeSettings?.fontSize]);

    // 更新回调引用
    useEffect(() => {
        stateRef.current = {
            ...stateRef.current,
            onValueChange,
            onError,
            validateOnChange: validationConfig?.validateOnChange
        };
    }, [onValueChange, onError, validationConfig?.validateOnChange]);

    // 验证函数
    const validateJson = useCallback((value: string) => {
        console.log('Validating JSON:', { valueLength: value.length });
        let newError: string | null = null;
        let newIsValid = true;

        try {
            const data = JSON.parse(value);
            
            // Schema 验证
            if (stateRef.current.schema) {
                const validator = new SchemaValidator();
                const errors = validator.validate(data, stateRef.current.schema);
                if (errors.length > 0) {
                    newError = errors[0].message;
                    newIsValid = false;
                }
            }
        } catch (err) {
            newError = err instanceof Error ? err.message : String(err);
            newIsValid = false;
        }

        console.log('Validation result:', { newError, newIsValid });
        setError(newError);
        setIsValid(newIsValid);
        if (newError && stateRef.current.onError) {
            stateRef.current.onError(new Error(newError));
        }
    }, []);

    // 使用防抖的验证函数
    const debouncedValidate = useMemo(
        () => debounce((value: string) => validateJson(value), 300),
        [validateJson]
    );

    // 内容变化处理
    const handleChange = useCallback((value: string) => {
        console.log('Content changed:', { valueLength: value.length });
        
        // 触发 onChange 回调
        stateRef.current.onValueChange?.(value);
        
        // 始终进行验证
        setIsValid(false);
        debouncedValidate(value);
    }, [debouncedValidate]);

    // 光标位置变化处理
    const handleCursorActivity = useCallback((info: { line: number; col: number }) => {
        setCursorInfo(info);
        
        // 获取当前位置的 schema 信息
        if (editorRef.current && stateRef.current.schema) {
            const pos = editorRef.current.getCursorPosition();
            if (pos !== null) {
                const path = editorRef.current.getSchemaPathAtPosition(pos);
                if (path) {
                    const schema = editorRef.current.getSchemaAtPath(path);
                    if (schema) {
                        // 获取当前值
                        const value = editorRef.current.getValueAtPath(path);
                        setSchemaInfo({
                            path,
                            schema,
                            value
                        });
                        return;
                    }
                }
            }
        }
        setSchemaInfo(null);
    }, []);

    // 处理 schema 值变化
    const handleSchemaValueChange = useCallback((value: string) => {
        if (!editorRef.current || !schemaInfo) return;
        
        // 更新值
        const success = editorRef.current.setValueAtPath(schemaInfo.path, value);
        if (!success) {
            console.error('Failed to set value at path:', schemaInfo.path);
            return;
        }

        // 手动触发验证
        validateJson(editorRef.current.getValue());
    }, [schemaInfo, validateJson]);

    // 文档大小变化处理
    const handleDocChanged = useCallback((info: { lines: number; bytes: number }) => {
        setJsonSize(info);
    }, []);

    // 处理展开/收缩
    const handleToggleExpand = useCallback(() => {
        const newExpanded = !expanded;
        setExpanded(newExpanded);
        expandOption?.onExpandChange?.(newExpanded);
    }, [expanded, expandOption]);

    // 处理复制
    const handleCopy = useCallback(() => {
        const content = editorRef.current?.getValue();
        if (content) {
            navigator.clipboard.writeText(content);
        }
    }, []);

    // 初始化编辑器
    useEffect(() => {
        console.log('Initializing editor...');
        if (!containerRef.current) {
            console.log('Container ref not ready');
            return;
        }

        try {
            editorRef.current = new EditorCore(containerRef.current, {
                value: stateRef.current.defaultValue,
                readonly: stateRef.current.readOnly,
                onChange: handleChange,
                onCursorActivity: handleCursorActivity,
                onDocChanged: handleDocChanged,
                codeSettings,
                schemaConfig: {
                    schema: stateRef.current.schema
                },
                themeConfig: {
                    theme: stateRef.current.theme
                },
                decorationConfig: stateRef.current.decoration,
                validationConfig: {
                    ...validationConfig,
                    validateOnChange: stateRef.current.validateOnChange
                },
                extensions
            });

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
    }, []);

    // 配置变化时更新编辑器
    useEffect(() => {
        if (!editorRef.current) return;

        const currentConfig = {
            readonly: stateRef.current.readOnly,
            codeSettings,
            schemaConfig: {
                schema: stateRef.current.schema
            },
            themeConfig: {
                theme: stateRef.current.theme
            },
            decorationConfig: stateRef.current.decoration,
            validationConfig: {
                ...validationConfig,
                validateOnChange: stateRef.current.validateOnChange
            },
            extensions
        };

        console.log('Updating editor config');
        editorRef.current.updateConfig(currentConfig);
    }, [themeConfig?.theme, schemaConfig?.schema, decorationConfig, readOnly, codeSettings, validationConfig, extensions]);

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
        <div className={`${themeConfig.theme === 'dark' ? 'dark' : ''}`}>
            <div className={`flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${className || ''}`} style={editorStyle}>
                {toolbarConfig?.position !== 'none' && (
                    <Toolbar
                        config={{
                            position: 'top',
                            features: {
                                format: true,
                                minify: true,
                                validate: true,
                                copy: true,
                                expand: true
                            },
                            ...toolbarConfig
                        }}
                        editor={editorRef.current}
                        state={{
                            isValid,
                            isExpanded: expanded
                        }}
                        handlers={{
                            onFormat: handleFormat,
                            onMinify: handleMinify,
                            onValidate: handleValidate,
                            onCopy: handleCopy,
                            onToggleExpand: handleToggleExpand
                        }}
                    />
                )}
                <div ref={containerRef} className="flex-1 overflow-auto min-h-0 bg-transparent" />
                {schemaInfo && (
                    <SchemaInfoPanel
                        path={schemaInfo.path}
                        schema={schemaInfo.schema}
                        value={schemaInfo.value}
                        onValueChange={handleSchemaValueChange}
                    />
                )}
                <StatusBar
                    cursorInfo={cursorInfo}
                    jsonSize={jsonSize}
                    isValid={isValid}
                    error={error}
                />
            </div>
        </div>
    );
}); 