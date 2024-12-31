import { EditorState, Transaction } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { defaultKeymap } from '@codemirror/commands';
import { lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { bracketMatching } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { createDecorationExtension } from '../extensions/decoration';
import { DecorationConfig, ValidationError, EditorConfig } from './types';
import { light } from '../themes/light';

// 基础样式增强
const baseTheme = EditorView.theme({
    "&": {
        height: '100%'
    },
    ".cm-scroller": {
        overflow: "auto"
    }
});

export class EditorCore {
    private view: EditorView | null = null;
    private container: HTMLElement;
    private config: EditorConfig;
    private schema: object | null = null;

    constructor(container: HTMLElement, config: EditorConfig = {}) {
        console.log('EditorCore constructor:', { container, config });
        this.container = container;
        this.config = config;
        this.schema = config.schema || null;

        // 立即初始化编辑器
        this.init(config.value || '');
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
                    if (this.view) {
                        this.view.update([tr]);
                        if (tr.docChanged && this.config.onChange) {
                            const value = this.getValue();
                            this.config.onChange(value);
                        }
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
        this.config = { ...this.config, ...config };
        if (this.view) {
            const state = this.createEditorState(this.getValue());
            this.view.setState(state);
        }
    }

    /**
     * 创建编辑器状态
     */
    private createEditorState(content: string) {
        console.log('Creating editor state with content length:', content.length);
        return EditorState.create({
            doc: content,
            extensions: [
                // 基础功能
                lineNumbers(),
                highlightActiveLineGutter(),
                bracketMatching(),
                keymap.of(defaultKeymap),
                // JSON 支持
                json(),
                // 装饰扩展
                createDecorationExtension(this.config.decoration || {}),
                // 主题
                this.config.theme === 'dark' ? oneDark : light,
                // 基础样式
                baseTheme,
                // 光标活动监听
                EditorView.updateListener.of(update => {
                    if (update.selectionSet && this.config.onCursorActivity) {
                        const pos = update.state.selection.main.head;
                        const line = update.state.doc.lineAt(pos);
                        this.config.onCursorActivity({
                            line: line.number,
                            col: pos - line.from + 1
                        });
                    }
                    if (update.docChanged && this.config.onDocChanged) {
                        const doc = update.state.doc;
                        this.config.onDocChanged({
                            lines: doc.lines,
                            bytes: doc.toString().length
                        });
                    }
                })
            ]
        });
    }

    /**
     * 格式化 JSON
     */
    format() {
        console.log('Formatting JSON');
        try {
            const content = this.getValue();
            const formatted = JSON.stringify(JSON.parse(content), null, 2);
            this.setValue(formatted);
            return true;
        } catch (error) {
            console.error('Format failed:', error);
            if (this.config.onError) {
                this.config.onError(error instanceof Error ? error : new Error(String(error)));
            }
            return false;
        }
    }

    /**
     * 压缩 JSON
     */
    minify() {
        console.log('Minifying JSON');
        try {
            const content = this.getValue();
            const minified = JSON.stringify(JSON.parse(content));
            this.setValue(minified);
            return true;
        } catch (error) {
            console.error('Minify failed:', error);
            if (this.config.onError) {
                this.config.onError(error instanceof Error ? error : new Error(String(error)));
            }
            return false;
        }
    }

    /**
     * 验证 JSON
     */
    validate(): ValidationError[] {
        console.log('Validating JSON');
        try {
            const content = this.getValue();
            JSON.parse(content); // 基本语法验证
            
            if (this.schema) {
                // TODO: 实现基于 schema 的验证
                return [];
            }
            
            return [];
        } catch (error) {
            console.error('Validation failed:', error);
            if (this.config.onError) {
                this.config.onError(error instanceof Error ? error : new Error(String(error)));
            }
            return [{
                path: '',
                message: error instanceof Error ? error.message : 'Invalid JSON',
                keyword: 'syntax'
            }];
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
            this.view.dispatch({
                changes: {
                    from: 0,
                    to: this.view.state.doc.length,
                    insert: value
                }
            });
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
} 