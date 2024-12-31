import { EditorState, Transaction } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { defaultKeymap } from '@codemirror/commands';
import { lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { bracketMatching } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { createDecorationExtension } from '../extensions/decoration';
import { EditorConfig } from './types';
import { light } from '../themes/light';
import { getCompletions } from './schema';

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
    private lastCursor: { line: number; col: number } | null = null;

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
        this.config = { ...this.config, ...config };
        this.schema = config.schema || null;
        
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
                // 自动补全
                autocompletion({
                    override: [(context: CompletionContext) => {
                        if (this.schema) {
                            return getCompletions(this.schema, context);
                        }
                        return null;
                    }],
                    defaultKeymap: true
                }),
                // 装饰扩展
                createDecorationExtension(this.config.decoration || {}),
                // 主题
                this.config.theme === 'dark' ? oneDark : light,
                // 基础样式
                baseTheme
            ]
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
} 