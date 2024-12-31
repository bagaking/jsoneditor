import { EditorState, Extension } from '@codemirror/state';
import { EditorView, keymap, ViewUpdate } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { json } from '@codemirror/lang-json';
import { linter, lintGutter, Diagnostic } from '@codemirror/lint';
import { oneDark } from '@codemirror/theme-one-dark';

import { EditorConfig } from './types';
import { createSchemaExtension } from '../extensions/schema';
import { createCompletionExtension } from '../extensions/completion';
import { createPathExtension } from '../extensions/path';

/**
 * 编辑器核心实现
 * 基于 CodeMirror 实现编辑器功能
 */
export class EditorCore {
    private config: EditorConfig;
    private view: EditorView;

    constructor(config: EditorConfig) {
        this.config = config;

        // 创建编辑器
        this.view = new EditorView({
            state: this.createEditorState(),
            parent: config.container
        });
    }

    /**
     * 创建编辑器状态
     */
    private createEditorState(): EditorState {
        const extensions: Extension[] = [
            // 基础功能
            keymap.of(defaultKeymap),
            // JSON 语言支持
            json(),
            // 错误提示
            lintGutter(),
            // 主题
            this.config.theme === 'dark' ? oneDark : [],
            // 编辑器配置
            EditorView.updateListener.of(this.handleUpdate.bind(this)),
            EditorView.editable.of(!this.config.readonly),
            EditorState.changeFilter.of(() => !this.config.readonly)
        ];

        // Schema 验证
        if (this.config.schema) {
            extensions.push(createSchemaExtension({
                schema: this.config.schema,
                validateOnType: this.config.validateOnChange
            }));
        }

        // 自动补全
        extensions.push(createCompletionExtension({
            schema: this.config.schema
        }));

        // 路径提示
        extensions.push(createPathExtension({
            showInGutter: true,
            showInTooltip: true,
            highlightPath: true
        }));

        // 自定义扩展
        if (this.config.extensions) {
            extensions.push(...this.config.extensions);
        }

        return EditorState.create({
            doc: this.config.content || '',
            extensions
        });
    }

    /**
     * 更新编辑器配置
     */
    public updateConfig(config: Partial<EditorConfig>): void {
        // 更新配置
        this.config = { ...this.config, ...config };

        // 创建新的编辑器状态
        const state = this.createEditorState();

        // 使用新状态重新配置编辑器
        this.view.setState(state);
    }

    /**
     * 处理编辑器更新
     */
    private handleUpdate(update: ViewUpdate) {
        if (update.docChanged) {
            const content = update.state.doc.toString();
            
            // 自动格式化
            if (this.config.autoFormat) {
                const formatted = this.format();
                if (formatted !== content) {
                    this.setContent(formatted);
                }
            }
        }
    }

    /**
     * 获取编辑器内容
     */
    public getContent(): string {
        return this.view.state.doc.toString();
    }

    /**
     * 设置编辑器内容
     */
    public setContent(content: string): void {
        this.view.dispatch({
            changes: {
                from: 0,
                to: this.view.state.doc.length,
                insert: content
            }
        });
    }

    /**
     * 格式化内容
     */
    public format(): string {
        try {
            const content = this.getContent();
            return JSON.stringify(JSON.parse(content), null, 2);
        } catch {
            return this.getContent();
        }
    }

    /**
     * 压缩内容
     */
    public minify(): string {
        try {
            const content = this.getContent();
            return JSON.stringify(JSON.parse(content));
        } catch {
            return this.getContent();
        }
    }

    /**
     * 获取编辑器实例
     */
    public getView(): EditorView {
        return this.view;
    }

    /**
     * 销毁编辑器
     */
    public destroy(): void {
        this.view.destroy();
    }
} 