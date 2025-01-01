import { EditorState, Transaction, Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { defaultKeymap } from '@codemirror/commands';
import { lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { bracketMatching } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { createDecorationExtension } from '../extensions/decoration';
import { EditorConfig, CodeSettings, SchemaConfig, ThemeConfig, ValidationConfig } from './types';
import { light } from '../themes/light';
import { getSchemaCompletions } from '../extensions/schema-extension';
import { createSchemaEditorExtension } from '../extensions/schema-extension';
import { JsonPath, JsonSchemaProperty } from '../extensions/path';

// 基础样式增强
const baseTheme = EditorView.theme({
    "&": {
        height: '100%'
    },
    ".cm-scroller": {
        overflow: "auto"
    }
});

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

export class EditorCore {
    private view: EditorView | null = null;
    private container: HTMLElement;
    private config: EditorConfig;
    private schema: object | null = null;
    private lastCursor: { line: number; col: number } | null = null;

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
                dispatch: (tr: Transaction) => {
                    if (!this.view) return;

                    // 保存当前光标位置
                    const oldState = this.view.state;
                    const hadFocus = this.view.hasFocus;
                    
                    // 更新视图
                    this.view.update([tr]);

                    // 如果文档发生变化
                    if (tr.docChanged) {
                        const value = this.getValue();
                        console.log('Document changed:', { valueLength: value.length });
                        
                        // 触发 onChange
                        if (this.config.onChange) {
                            this.config.onChange(value);
                        }
                    }

                    // 如果光标位置改变
                    if (tr.selection && this.config.onCursorActivity) {
                        const pos = this.view.state.selection.main.head;
                        const line = this.view.state.doc.lineAt(pos);
                        const cursorInfo = {
                            line: line.number,
                            col: pos - line.from + 1
                        };
                        
                        console.log('Cursor moved:', cursorInfo);
                        
                        // 只有当位置真的改变时才触发回调
                        if (!this.lastCursor || 
                            this.lastCursor.line !== cursorInfo.line || 
                            this.lastCursor.col !== cursorInfo.col) {
                            this.lastCursor = cursorInfo;
                            this.config.onCursorActivity(cursorInfo);
                        }
                    }

                    // 如果文档大小改变
                    if (tr.docChanged && this.config.onDocChanged) {
                        const doc = this.view.state.doc;
                        const info = {
                            lines: doc.lines,
                            bytes: doc.toString().length
                        };
                        console.log('Document size changed:', info);
                        this.config.onDocChanged(info);
                    }

                    // 如果之前有焦点，确保保持焦点
                    if (hadFocus && !this.view.hasFocus) {
                        console.log('Restoring focus');
                        this.view.focus();
                    }
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
        
        // 保存当前状态
        const hadFocus = this.view?.hasFocus;
        const cursorPos = this.view?.state.selection.main.head;
        
        // 更新配置
        this.config = this.normalizeConfig({ ...this.config, ...config });
        this.schema = this.config.schemaConfig?.schema || null;
        
        // 重新创建编辑器状态
        if (this.view) {
            const state = this.createEditorState(this.getValue());
            this.view.setState(state);
            
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
    }

    /**
     * 创建编辑器状态
     */
    private createEditorState(content: string) {
        console.log('Creating editor state with content length:', content.length);
        const { codeSettings, themeConfig } = this.config;
        
        const extensions: Extension[] = [];

        // 基础功能
        if (codeSettings?.lineNumbers !== false) {
            extensions.push(lineNumbers());
        }
        if (codeSettings?.highlightActiveLine !== false) {
            extensions.push(highlightActiveLineGutter());
        }
        if (codeSettings?.bracketMatching !== false) {
            extensions.push(bracketMatching());
        }
        extensions.push(keymap.of(defaultKeymap));

        // JSON 支持
        extensions.push(json());

        // 自动补全
        if (codeSettings?.autoCompletion !== false) {
            extensions.push(autocompletion({
                override: [(context: CompletionContext) => {
                    if (this.schema) {
                        return getSchemaCompletions(this.schema, context);
                    }
                    return null;
                }],
                defaultKeymap: true
            }));
        }

        // 装饰扩展
        if (this.config.decorationConfig) {
            extensions.push(createDecorationExtension(this.config.decorationConfig));
        }

        // 主题
        extensions.push(themeConfig?.theme === 'dark' ? oneDark : light);

        // 基础样式
        extensions.push(baseTheme);

        // 字体大小
        extensions.push(EditorView.theme({
            "&": {
                fontSize: `${codeSettings?.fontSize || 14}px`
            }
        }));

        // 添加 schema 验证扩展
        if (this.schema) {
            extensions.push(
                createSchemaEditorExtension({
                    schema: this.schema,
                    validateOnType: this.config.schemaConfig?.validateOnType,
                    validateDebounce: this.config.schemaConfig?.validateDebounce
                })
            );
        }

        // 添加自定义扩展
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
} 