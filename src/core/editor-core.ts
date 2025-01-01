import { EditorState, Transaction, Extension, StateEffect, StateField, Compartment } from '@codemirror/state';
import { EditorView, keymap, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { lineNumbers, highlightActiveLineGutter, highlightActiveLine } from '@codemirror/view';
import { bracketMatching } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { createDecorationExtension } from '../extensions/decoration';
import { EditorConfig, CodeSettings, SchemaConfig, ThemeConfig, ValidationConfig, JsonSchemaProperty } from './types';
import { light } from '../themes/light';
import { getSchemaCompletions } from '../extensions/schema-extension';
import { createSchemaEditorExtension } from '../extensions/schema-extension';
import { JsonPath } from '../extensions/path';

// 基础样式增强
const baseTheme = EditorView.theme({
    "&": {
        position: 'relative',
        height: '100%'
    },
    ".cm-scroller": {
        overflow: "auto",
        height: '100%'
    },
    ".cm-content": {
        whiteSpace: 'pre',
        minHeight: '100%'
    }
});

// 滚动配置
const scrollConfig = EditorView.scrollMargins.of(() => ({
    top: 0,
    bottom: 0
}));

// 默认配置
const defaultCodeSettings: CodeSettings = {
    fontSize: 14,
    lineNumbers: true,
    bracketMatching: true,
    autoCompletion: true,
    highlightActiveLine: true
};

const defaultSchemaConfig: SchemaConfig = {
    validateOnType: true,
    validateDebounce: 300
};

const defaultThemeConfig: ThemeConfig = {
    theme: 'light'
};

const defaultValidationConfig: ValidationConfig = {
    validateOnChange: true,
    autoFormat: false
};

// 创建状态字段
const cursorStateField = StateField.define<{ line: number; col: number }>({
    create: () => ({ line: 1, col: 1 }),
    update(value, tr) {
        if (!tr.selection) return value;
        const pos = tr.selection.main.head;
        const line = tr.state.doc.lineAt(pos);
        return {
            line: line.number,
            col: pos - line.from + 1
        };
    }
});

const docSizeStateField = StateField.define<{ lines: number; bytes: number }>({
    create: () => ({ lines: 1, bytes: 0 }),
    update(value, tr) {
        if (!tr.docChanged) return value;
        
        // 只在文档内容真正变化时更新
        const newDoc = tr.state.doc;
        const newValue = {
            lines: newDoc.lines,
            bytes: newDoc.toString().length
        };
        
        // 如果值没有变化,返回旧值以避免不必要的更新
        if (newValue.lines === value.lines && newValue.bytes === value.bytes) {
            return value;
        }
        
        return newValue;
    }
});

// 创建配置 compartments
const configCompartment = new Compartment();
const basicFeaturesCompartment = new Compartment();
const themeCompartment = new Compartment();
const completionCompartment = new Compartment();
const decorationCompartment = new Compartment();
const styleCompartment = new Compartment();

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

// 创建视图插件
const createEditorPlugin = (config: EditorConfig) => {
    return ViewPlugin.fromClass(class {
        private hadFocus: boolean = false;
        private debouncedDocChange: (value: string) => void;
        private debouncedCursorActivity: (info: { line: number; col: number }) => void;
        private lastValue: string = '';

        constructor(private view: EditorView) {
            console.log('Editor plugin initialized');
            this.lastValue = view.state.doc.toString();
            
            // 创建防抖的回调函数
            this.debouncedDocChange = debounce((value: string) => {
                try {
                    // 只在值真正变化时触发回调
                    if (value !== this.lastValue) {
                        this.lastValue = value;
                        config.onChange?.(value);
                    }
                } catch (error) {
                    console.error('Error in onChange callback:', error);
                }
            }, 100);

            this.debouncedCursorActivity = debounce((info: { line: number; col: number }) => {
                try {
                    config.onCursorActivity?.(info);
                } catch (error) {
                    console.error('Error in onCursorActivity callback:', error);
                }
            }, 50);
        }

        update(update: ViewUpdate) {
            try {
                // 处理文档变化
                if (update.docChanged) {
                    const value = update.state.doc.toString();
                    // 只在值真正变化时处理
                    if (value !== this.lastValue) {
                        console.log('Document changed:', { valueLength: value.length });
                        this.debouncedDocChange(value);
                    }
                }

                // 处理光标移动
                if (update.selectionSet && config.onCursorActivity) {
                    const cursorInfo = update.state.field(cursorStateField);
                    console.log('Cursor moved:', cursorInfo);
                    this.debouncedCursorActivity(cursorInfo);
                }

                // 处理文档大小变化
                if (update.docChanged && config.onDocChanged) {
                    const docSize = update.state.field(docSizeStateField);
                    console.log('Document size changed:', docSize);
                    try {
                        config.onDocChanged(docSize);
                    } catch (error) {
                        console.error('Error in onDocChanged callback:', error);
                    }
                }

                // 处理焦点
                const hasFocus = this.view.hasFocus;
                if (this.hadFocus && !hasFocus) {
                    console.log('Focus lost, restoring...');
                    this.view.focus();
                }
                this.hadFocus = hasFocus;
            } catch (error) {
                console.error('Error in plugin update:', error);
            }
        }

        destroy() {
            console.log('Editor plugin destroyed');
        }
    });
};

export class EditorCore {
    private view: EditorView | null = null;
    private container: HTMLElement;
    private config: EditorConfig;
    private schema: object | null = null;
    private extensions: Extension[] = [];

    constructor(container: HTMLElement, config: EditorConfig = {}) {
        console.log('EditorCore constructor:', { container, config });
        this.container = container;
        this.config = this.normalizeConfig(config);
        this.schema = this.config.schemaConfig?.schema || null;

        // 立即初始化编辑器
        this.init(config.value || '');
    }

    /**
     * 规范化配置
     */
    private normalizeConfig(config: EditorConfig): EditorConfig {
        return {
            ...config,
            codeSettings: {
                ...defaultCodeSettings,
                ...config.codeSettings
            },
            schemaConfig: {
                ...defaultSchemaConfig,
                ...config.schemaConfig
            },
            themeConfig: {
                ...defaultThemeConfig,
                ...config.themeConfig
            },
            validationConfig: {
                ...defaultValidationConfig,
                ...config.validationConfig
            }
        };
    }

    /**
     * 初始化编辑器
     */
    private init(initialValue: string = '') {
        console.log('Initializing editor with value:', initialValue);
        try {
            const state = this.createEditorState(initialValue);
            
            this.view = new EditorView({
                state,
                parent: this.container,
                // important: 绝对不要在 dispatch 中处理事务, 从 CodeMirror 文档来看, 它已经不再使用事件系统,而是使用 transactions 来表示状态更新。
                dispatch: (tr: Transaction) => { 
                    if (!this.view) return;
                    this.view.update([tr]);
                }
            });

            console.log('Editor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize editor:', error);
            throw error;
        }
    }

    /**
     * 更新编辑器配置
     */
    updateConfig(config: EditorConfig) {
        console.log('Updating editor config:', config);
        
        try {
            // 保存当前状态
            const hadFocus = this.view?.hasFocus;
            const cursorPos = this.view?.state.selection.main.head;
            
            // 检查配置是否真的变化
            const newConfig = this.normalizeConfig({ ...this.config, ...config });
            if (this.configEquals(this.config, newConfig)) {
                console.log('Config not changed, skipping update');
                return;
            }
            
            // 更新配置
            this.config = newConfig;
            this.schema = this.config.schemaConfig?.schema || null;
            
            // 重新创建编辑器状态
            if (this.view) {
                // 批量更新所有配置
                this.view.dispatch({
                    effects: [
                        // 更新基础功能
                        basicFeaturesCompartment.reconfigure(
                            this.createBasicFeatures(this.config.codeSettings)
                        ),
                        // 更新主题
                        themeCompartment.reconfigure(
                            this.config.themeConfig?.theme === 'dark' ? oneDark : light
                        ),
                        // 更新自动补全
                        completionCompartment.reconfigure(
                            this.createCompletionExtension(this.config.codeSettings)
                        ),
                        // 更新样式
                        styleCompartment.reconfigure(
                            this.createStyleExtension(this.config.codeSettings)
                        ),
                        // 更新事件处理插件
                        configCompartment.reconfigure(
                            createEditorPlugin(this.config)
                        ),
                        // 更新装饰
                        ...(this.config.decorationConfig
                            ? [decorationCompartment.reconfigure(
                                createDecorationExtension(this.config.decorationConfig)
                              )]
                            : [])
                    ]
                });

                // 恢复焦点和光标位置
                if (hadFocus) {
                    this.view.focus();
                }
                if (cursorPos !== undefined) {
                    this.view.dispatch({
                        selection: { anchor: cursorPos }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to update config:', error);
            throw error;
        }
    }

    /**
     * 比较两个配置是否相等
     */
    private configEquals(a: EditorConfig, b: EditorConfig): boolean {
        // 比较基础配置
        if (a.readonly !== b.readonly) return false;

        // 比较代码设置
        const codeSettingsEqual = 
            a.codeSettings?.fontSize === b.codeSettings?.fontSize &&
            a.codeSettings?.lineNumbers === b.codeSettings?.lineNumbers &&
            a.codeSettings?.bracketMatching === b.codeSettings?.bracketMatching &&
            a.codeSettings?.autoCompletion === b.codeSettings?.autoCompletion &&
            a.codeSettings?.highlightActiveLine === b.codeSettings?.highlightActiveLine;
        if (!codeSettingsEqual) return false;

        // 比较主题配置
        if (a.themeConfig?.theme !== b.themeConfig?.theme) return false;

        // 比较 schema 配置
        const schemaEqual = 
            a.schemaConfig?.validateOnType === b.schemaConfig?.validateOnType &&
            a.schemaConfig?.validateDebounce === b.schemaConfig?.validateDebounce &&
            JSON.stringify(a.schemaConfig?.schema) === JSON.stringify(b.schemaConfig?.schema);
        if (!schemaEqual) return false;

        // 比较验证配置
        const validationEqual =
            a.validationConfig?.validateOnChange === b.validationConfig?.validateOnChange &&
            a.validationConfig?.autoFormat === b.validationConfig?.autoFormat;
        if (!validationEqual) return false;

        // 比较装饰配置
        if (JSON.stringify(a.decorationConfig) !== JSON.stringify(b.decorationConfig)) return false;

        return true;
    }

    /**
     * 创建基础功能扩展
     */
    private createBasicFeatures(codeSettings: CodeSettings | undefined): Extension[] {
        const extensions: Extension[] = [];

        // 基础功能
        extensions.push(history());
        if (codeSettings?.lineNumbers !== false) {
            extensions.push(lineNumbers());
        }
        if (codeSettings?.highlightActiveLine !== false) {
            extensions.push(highlightActiveLine());
        }
        if (codeSettings?.bracketMatching !== false) {
            extensions.push(bracketMatching());
        }
        extensions.push(keymap.of([...defaultKeymap, ...historyKeymap]));

        return extensions;
    }

    /**
     * 创建自动补全扩展
     */
    private createCompletionExtension(codeSettings: CodeSettings | undefined): Extension[] {
        if (codeSettings?.autoCompletion === false) return [];
        
        return [autocompletion({
            override: [(context: CompletionContext) => {
                if (this.schema) {
                    return getSchemaCompletions(this.schema, context);
                }
                return null;
            }],
            defaultKeymap: true
        })];
    }

    /**
     * 创建样式扩展
     */
    private createStyleExtension(codeSettings: CodeSettings | undefined): Extension {
        const fontSize = codeSettings?.fontSize || 14;
        return EditorView.theme({
            "&": {
                fontSize: `${fontSize}px`,
                fontFamily: 'monospace'
            },
            ".cm-content": {
                fontSize: `${fontSize}px !important`,
                fontFamily: 'monospace',
                lineHeight: '1.6'
            },
            ".cm-line": {
                fontSize: `${fontSize}px !important`,
                fontFamily: 'monospace'
            },
            ".cm-gutters": {
                fontSize: `${Math.max(fontSize - 2, 10)}px !important`,
                fontFamily: 'monospace'
            },
            ".cm-activeLineGutter": {
                backgroundColor: 'var(--active-line-gutter-background-color)'
            },
            ".cm-activeLine": {
                backgroundColor: 'var(--active-line-background-color)'
            },
            // 确保所有编辑器内容使用正确的字体大小
            ".cm-scroller": {
                fontFamily: 'monospace'
            },
            // 确保补全提示也使用正确的字体大小
            ".cm-tooltip": {
                fontSize: `${fontSize}px !important`,
                fontFamily: 'monospace'
            },
            ".cm-tooltip-autocomplete": {
                fontSize: `${fontSize}px !important`,
                fontFamily: 'monospace'
            }
        });
    }

    /**
     * 创建编辑器状态
     */
    private createEditorState(content: string) {
        console.log('Creating editor state with content length:', content.length);
        const { codeSettings, themeConfig } = this.config;
        
        const extensions: Extension[] = [];

        // 状态字段
        extensions.push(cursorStateField);
        extensions.push(docSizeStateField);

        // 使用 compartments 包装各类扩展
        extensions.push(basicFeaturesCompartment.of(this.createBasicFeatures(codeSettings)));
        extensions.push(themeCompartment.of(themeConfig?.theme === 'dark' ? oneDark : light));
        extensions.push(completionCompartment.of(this.createCompletionExtension(codeSettings)));
        extensions.push(styleCompartment.of(this.createStyleExtension(codeSettings)));
        extensions.push(configCompartment.of(createEditorPlugin(this.config)));

        // 装饰扩展
        if (this.config.decorationConfig) {
            extensions.push(decorationCompartment.of(createDecorationExtension(this.config.decorationConfig)));
        }

        // 基础样式和滚动配置
        extensions.push(baseTheme);
        extensions.push(scrollConfig);
        extensions.push(json());

        // 用户自定义扩展
        if (this.config.extensions) {
            extensions.push(...this.config.extensions);
        }

        return EditorState.create({
            doc: content,
            extensions
        });
    }

    /**
     * 获取编辑器内容
     */
    getValue(): string {
        return this.view?.state.doc.toString() || '';
    }

    /**
     * 设置编辑器内容
     */
    setValue(value: string) {
        console.log('Setting editor value, length:', value.length);
        if (this.view) {
            const hadFocus = this.view.hasFocus;
            
            this.view.dispatch({
                changes: {
                    from: 0,
                    to: this.view.state.doc.length,
                    insert: value
                }
            });

            // 恢复焦点
            if (hadFocus) {
                this.view.focus();
            }
        }
    }

    /**
     * 销毁编辑器
     */
    destroy() {
        console.log('Destroying editor');
        if (this.view) {
            this.view.destroy();
            this.view = null;
        }
    }

    /**
     * 获取当前光标位置
     */
    getCursorPosition(): number | null {
        if (!this.view) return null;
        return this.view.state.selection.main.head;
    }

    /**
     * 获取指定位置的 schema 路径
     */
    getSchemaPathAtPosition(pos: number): string | null {
        if (!this.view) return null;
        return JsonPath.fromPosition(this.view, pos);
    }

    /**
     * 获取指定路径的 schema 定义
     */
    getSchemaAtPath(path: string): JsonSchemaProperty | null {
        if (!this.schema) return null;
        return JsonPath.getSchemaAtPath(this.schema as JsonSchemaProperty, path);
    }

    /**
     * 根据路径获取值
     */
    getValueAtPath(path: string): string | undefined {
        try {
            const content = this.getValue();
            const data = JSON.parse(content);
            const parts = JsonPath.parsePath(path);
            
            let current = data;
            for (const part of parts) {
                if (current === undefined || current === null) return undefined;
                current = current[part];
            }
            
            return typeof current === 'string' ? current : JSON.stringify(current);
        } catch (e) {
            console.error('Failed to get value at path:', e);
            return undefined;
        }
    }

    /**
     * 根据路径设置值
     */
    setValueAtPath(path: string, value: string): boolean {
        try {
            const content = this.getValue();
            const data = JSON.parse(content);
            const parts = JsonPath.parsePath(path);
            
            // 找到父对象
            let current = data;
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!(part in current)) {
                    current[part] = {};
                }
                current = current[part];
            }
            
            // 设置值
            const lastPart = parts[parts.length - 1];
            if (lastPart) {
                // 根据 schema 处理值的类型
                const schema = this.getSchemaAtPath(path);
                if (schema) {
                    if (schema.type === 'number') {
                        current[lastPart] = Number(value);
                    } else if (schema.type === 'boolean') {
                        current[lastPart] = value === 'true';
                    } else {
                        current[lastPart] = value;
                    }
                } else {
                    current[lastPart] = value;
                }
                
                // 更新编辑器内容
                const newContent = JSON.stringify(data, null, 2);
                this.setValue(newContent);

                // 触发 onChange 以便进行验证
                if (this.config.onChange) {
                    this.config.onChange(newContent);
                }
                
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to set value at path:', e);
            return false;
        }
    }

    // 获取指定行的结束位置
    getLineEndPosition(line: number): number {
        if (!this.view) throw new Error('Editor not initialized');
        const lineInfo = this.view.state.doc.line(line);
        return lineInfo.to;
    }

    // 添加扩展
    addExtension(extension: Extension) {
        if (!this.view) throw new Error('Editor not initialized');
        this.extensions.push(extension);
        this.view.dispatch({
            effects: StateEffect.appendConfig.of([extension])
        });
    }

    // 移除扩展
    removeExtension(extension: Extension) {
        if (!this.view) throw new Error('Editor not initialized');
        const index = this.extensions.indexOf(extension);
        if (index > -1) {
            this.extensions.splice(index, 1);
            // 重新创建状态以移除扩展
            this.view.setState(this.createEditorState(this.getValue()));
        }
    }

    // 滚动到指定行
    scrollToLine(line: number) {
        if (!this.view) throw new Error('Editor not initialized');
        const lineInfo = this.view.state.doc.line(Math.max(1, Math.min(line, this.view.state.doc.lines)));
        this.view.dispatch({
            effects: EditorView.scrollIntoView(lineInfo.from, {
                y: "nearest"
            })
        });
    }
} 