import { EditorState, Transaction, Extension, Compartment, StateEffect } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { EditorConfig, JsonSchemaProperty } from './types';
import { cursorStateField, docSizeStateField } from '../extensions/state';
import { createEditorPlugin } from '../extensions/event';
import { createBasicFeatures, createCompletionExtension, createStyleExtension } from '../extensions/features';
import { configEquals } from '../extensions/config';
import { defaultCodeSettings, defaultSchemaConfig, defaultThemeConfig, defaultValidationConfig } from '../extensions/config';
import { light, dark } from '../extensions/themes';
import { createDecorationExtension } from '../extensions/decoration';
import { JsonPath } from '../jsonkit/path';

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

// 创建配置 compartments
const configCompartment = new Compartment();
const basicFeaturesCompartment = new Compartment();
const themeCompartment = new Compartment();
const completionCompartment = new Compartment();
const decorationCompartment = new Compartment();
const styleCompartment = new Compartment();
const readOnlyCompartment = new Compartment();

/**
 * 编辑器核心类
 */
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
                // important: 绝对不要在 dispatch 中处理事务, 
                // 从 CodeMirror 文档来看, 它已经不再使用事件系统, 而是使用 transactions 来表示状态更新。
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
        extensions.push(basicFeaturesCompartment.of(createBasicFeatures(codeSettings)));
        extensions.push(themeCompartment.of(themeConfig?.theme === 'dark' ? dark : light));
        extensions.push(completionCompartment.of(createCompletionExtension(codeSettings, this.schema)));
        extensions.push(styleCompartment.of(createStyleExtension(codeSettings)));
        extensions.push(configCompartment.of(createEditorPlugin(this.config)));

        // 装饰扩展
        if (this.config.decorationConfig) {
            console.log('[Decoration] Adding decoration extension with config:', this.config.decorationConfig);
            const decorationExtension = createDecorationExtension(this.config.decorationConfig);
            extensions.push(decorationCompartment.of(decorationExtension));
            console.log('[Decoration] Decoration extension added');
        } else {
            console.log('[Decoration] No decoration config provided');
        }

        // 基础样式和滚动配置
        extensions.push(baseTheme);
        extensions.push(scrollConfig);
        extensions.push(json());

        // 只读模式
        extensions.push(readOnlyCompartment.of(this.config.readonly ? EditorState.readOnly.of(true) : []));

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
     * 更新编辑器配置
     */
    updateConfig(config: EditorConfig) {
        // console.log('Updating editor config:', config);
        
        try {
            // 保存当前状态
            const hadFocus = this.view?.hasFocus;
            const cursorPos = this.view?.state.selection.main.head;
            
            // 检查配置是否真的变化
            const newConfig = this.normalizeConfig({ ...this.config, ...config });
            if (configEquals(this.config, newConfig)) {
                // console.log('Config not changed, skipping update');
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
                            createBasicFeatures(this.config.codeSettings)
                        ),
                        // 更新主题
                        themeCompartment.reconfigure(
                            this.config.themeConfig?.theme === 'dark' ? dark : light
                        ),
                        // 更新自动补全
                        completionCompartment.reconfigure(
                            createCompletionExtension(this.config.codeSettings, this.schema)
                        ),
                        // 更新样式
                        styleCompartment.reconfigure(
                            createStyleExtension(this.config.codeSettings)
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
                            : []),
                        // 更新只读状态
                        readOnlyCompartment.reconfigure(
                            this.config.readonly ? EditorState.readOnly.of(true) : []
                        )
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