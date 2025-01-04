import { useRef, useEffect, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { EditorCore } from '../core/editor-core';
import { Toolbar } from './components/Toolbar';
import { StatusBar } from './components/StatusBar';
import { SchemaInfoPanel } from './components/SchemaInfoPanel';
import { JsonSchemaProperty } from '../core/types';
import { SchemaValidator } from '../core/schema-validator';
import { JsonEditorProps } from './types';
import { jsonParser } from '../jsonkit/parser';
import { copyToClipboard } from '../utils/clipboard';

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
    onCopy,

    // 编辑器配置
    codeSettings = {},
    schemaConfig = {},
    themeConfig = {},
    decorationConfig,
    validationConfig = {},
    extensions = [],

    // UI 配置
    toolbarConfig,
    statusBarConfig,
    schemaInfoConfig,
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
    const [minifyLevel, setMinifyLevel] = useState(-1);
    const [isEditorReady, setIsEditorReady] = useState(false);
    
    // 使用 useRef 存储所有可变的配置和回调
    const stateRef = useRef({
        onValueChange,
        onError,
        onCopy,
        validateOnChange: validationConfig?.validateOnChange,
        schema: schemaConfig?.schema,
        theme: themeConfig?.theme,
        decoration: decorationConfig,
        defaultValue,
        readOnly,
        fontSize: codeSettings?.fontSize
    });

    // 暴露编辑器实例给父组件
    useImperativeHandle(ref, () => {
        if (!editorRef.current) {
            console.warn('[@bagaking/jsoneditor/core] Editor instance not ready');
            // 返回一个空的实现，但保持类型兼容
            const emptyEditor = {
                view: null,
                container: null,
                config: {},
                schema: null,
                getValue: () => '',
                setValue: () => {},
                format: () => {},
                minify: () => {},
                destroy: () => {},
                updateConfig: () => {},
                getValueAtPath: () => null,
                setValueAtPath: () => false,
                getSchemaAtPath: () => null,
                getCursorPosition: () => ({ line: 0, column: 0 }),
                setCursorPosition: () => {},
                getSelection: () => ({ start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }),
                setSelection: () => {},
                validate: () => true,
                focus: () => {},
                blur: () => {},
            } as unknown as EditorCore;
            return emptyEditor;
        }
        return editorRef.current;
    }, [isEditorReady]);


        // 计算收起状态的高度
        const getCollapsedHeight = useCallback(() => {
            const fontSize = codeSettings?.fontSize || 14;
            const lineHeight = fontSize * 1.6; // 1.6 是行高系数
            const lines = expandOption?.collapsedLines ?? 5; // 默认显示5行
            return `${lines * lineHeight}px`;
        }, [codeSettings?.fontSize, expandOption?.collapsedLines]);
    
    // 计算编辑器样式
    const editorStyle = useMemo(() => {
        const baseStyle = {
            fontSize: `${codeSettings?.fontSize || 14}px`,
            ...style
        };

        if (!expandOption) return baseStyle;

        const { animation } = expandOption;
        
        const heightStyle = expanded
            ? {
                position: 'relative' as const,
                height: 'auto'
              }
            : {
                maxHeight: getCollapsedHeight(),
                position: 'relative' as const,
                overflowY: 'auto' as const
              };

        const transitionStyle = animation?.enabled
            ? {
                transition: [
                    `max-height ${animation.duration || 300}ms ${animation.timing || 'ease-in-out'}`,
                    `opacity ${animation.duration || 300}ms ${animation.timing || 'ease-in-out'}`
                ].join(', ')
              }
            : {};

        return {
            ...baseStyle,
            ...heightStyle,
            ...transitionStyle
        };
    }, [expanded, expandOption, codeSettings?.fontSize, style, getCollapsedHeight]);

    // 编辑器容器样式
    const containerStyle = useMemo(() => {
        if (!expandOption || expanded) return {
            position: 'relative' as const
        };
        
        const { animation } = expandOption;
        return {
            maxHeight: getCollapsedHeight(),
            position: 'relative' as const,
            overflowY: 'auto' as const,
            transition: animation?.enabled
                ? [
                    `max-height ${animation.duration || 300}ms ${animation.timing || 'ease-in-out'}`,
                    `opacity ${animation.duration || 300}ms ${animation.timing || 'ease-in-out'}`
                  ].join(', ')
                : undefined
        };
    }, [expanded, expandOption, getCollapsedHeight]);
 

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

    // 初始化时计算文档大小
    useEffect(() => {
        if (defaultValue) {
            const lines = defaultValue.split('\n').length;
            const bytes = new Blob([defaultValue]).size;
            setJsonSize({ lines, bytes });
        }
    }, [defaultValue]);

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
        
        // 更新文档大小信息
        const lines = value.split('\n').length;
        const bytes = new Blob([value]).size;
        setJsonSize({ lines, bytes });
        
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
    const handleCopy = useCallback(async () => {
        const content = editorRef.current?.getValue();
        const success = await copyToClipboard(content || '', stateRef.current.onCopy);
        if (!success) {
            console.error('Failed to copy');
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

            // 标记编辑器已准备就绪
            setIsEditorReady(true);

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
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
                setIsEditorReady(false);
            }
        };
    }, []);

    // 配置变化时更新编辑器
    useEffect(() => {
        if (!editorRef.current) return;

        const currentConfig = {
            readonly: readOnly,
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
            // 获取最大压缩层级
            const maxLevel = jsonParser.getMaxShrinkLevel(content);
            
            // 计算新的压缩层级
            const newLevel = minifyLevel >= maxLevel ? 0 : minifyLevel + 1;
            setMinifyLevel(newLevel);
            
            // 使用多级压缩
            const minified = jsonParser.shrink(content, {
                level: newLevel,
                keepIndent: true,
                indentSize: 2
            });
            
            editorRef.current.setValue(minified);
            setError(null);
            setIsValid(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setIsValid(false);
            stateRef.current.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
    }, [minifyLevel]);

    // 手动验证处理
    const handleValidate = useCallback(() => {
        console.log('Manual validation triggered');
        if (!editorRef.current) return;
        validateJson(editorRef.current.getValue());
    }, [validateJson]);


    return (
        <div className={`${themeConfig.theme === 'dark' ? 'dark' : ''} bg-transparent`} data-bkjson-root>
            <div className={`flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${className || ''}`}>
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
                        className={toolbarConfig?.className}
                        style={toolbarConfig?.style}
                    />
                )}
                <div 
                    ref={containerRef} 
                    className="bg-transparent relative" 
                    style={{
                        ...editorStyle,
                        ...containerStyle,
                        overflow: expanded ? undefined : 'auto'
                    }}
                    data-bkjson-editor
                >
                   
                </div>
                {schemaInfo && (
                    <SchemaInfoPanel
                        path={schemaInfo.path}
                        schema={schemaInfo.schema}
                        value={schemaInfo.value}
                        onValueChange={handleSchemaValueChange}
                        className={schemaInfoConfig?.className}
                        style={schemaInfoConfig?.style}
                    />
                )}
                <StatusBar
                    cursorInfo={cursorInfo}
                    jsonSize={jsonSize}
                    isValid={isValid}
                    error={error}
                    className={statusBarConfig?.className}
                    style={statusBarConfig?.style}
                />
            </div>
        </div>
    );
}); 