import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { defaultKeymap } from '@codemirror/commands';
import { lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { bracketMatching } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { createDecorationExtension } from '../extensions/decoration';
import { DecorationConfig, ValidationError } from './types';
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
    private config: DecorationConfig = {};
    private schema: object | null = null;
    private currentTheme: 'light' | 'dark' = 'light';

    constructor(container: HTMLElement, schema?: object) {
        this.container = container;
        this.schema = schema || null;
    }

    /**
     * 初始化编辑器
     */
    init(initialValue: string = '') {
        const state = EditorState.create({
            doc: initialValue,
            extensions: [
                // 基础功能
                lineNumbers(),
                highlightActiveLineGutter(),
                bracketMatching(),
                keymap.of(defaultKeymap),
                // JSON 支持
                json(),
                // 装饰扩展
                createDecorationExtension(this.config),
                // 主题
                this.currentTheme === 'dark' ? oneDark : light,
                // 基础样式
                baseTheme
            ]
        });

        this.view = new EditorView({
            state,
            parent: this.container
        });
    }

    /**
     * 更新编辑器配置
     */
    updateConfig(config: DecorationConfig) {
        this.config = config;
        if (this.view) {
            const state = this.createEditorState(this.getValue());
            this.view.setState(state);
        }
    }

    /**
     * 切换主题
     */
    setTheme(theme: 'light' | 'dark') {
        this.currentTheme = theme;
        if (this.view) {
            const state = this.createEditorState(this.getValue());
            this.view.setState(state);
        }
    }

    /**
     * 创建编辑器状态
     */
    private createEditorState(content: string) {
        return EditorState.create({
            doc: content,
            extensions: [
                lineNumbers(),
                highlightActiveLineGutter(),
                bracketMatching(),
                keymap.of(defaultKeymap),
                json(),
                createDecorationExtension(this.config),
                this.currentTheme === 'dark' ? oneDark : light,
                baseTheme
            ]
        });
    }

    /**
     * 格式化 JSON
     */
    format() {
        try {
            const content = this.getValue();
            const formatted = JSON.stringify(JSON.parse(content), null, 2);
            this.setValue(formatted);
            return true;
        } catch (error) {
            console.error('Format failed:', error);
            return false;
        }
    }

    /**
     * 压缩 JSON
     */
    minify() {
        try {
            const content = this.getValue();
            const minified = JSON.stringify(JSON.parse(content));
            this.setValue(minified);
            return true;
        } catch (error) {
            console.error('Minify failed:', error);
            return false;
        }
    }

    /**
     * 验证 JSON
     */
    validate(): ValidationError[] {
        try {
            const content = this.getValue();
            JSON.parse(content); // 基本语法验证
            
            if (this.schema) {
                // TODO: 实现基于 schema 的验证
                return [];
            }
            
            return [];
        } catch (error) {
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
        if (this.view) {
            this.view.destroy();
            this.view = null;
        }
    }
} 