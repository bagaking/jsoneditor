import { ViewPlugin, ViewUpdate } from '@codemirror/view';
import { EditorConfig } from '../core/types';
import { cursorStateField, docSizeStateField } from './state';
import { debounce } from '../utils/function';

/**
 * 创建编辑器事件处理插件
 * 
 * @description
 * 处理编辑器的各种事件,包括:
 * - 文档内容变化
 * - 光标位置变化
 * - 文档大小变化
 * - 焦点变化
 * 
 * @param config - 编辑器配置
 * 
 * @example
 * ```typescript
 * const plugin = createEditorPlugin({
 *   onChange: (value) => console.log('Content changed:', value),
 *   onCursorActivity: (info) => console.log('Cursor moved:', info)
 * });
 * ```
 * 
 * @remarks
 * - 使用防抖处理频繁的事件
 * - 只在值真正变化时触发回调
 * - 自动恢复焦点
 * - 所有回调都有错误处理
 * 
 * @see {@link EditorConfig} 编辑器配置类型
 */
export function createEditorPlugin(config: EditorConfig) {
    return ViewPlugin.fromClass(class {
        hadFocus = false;
        debouncedDocChange: (value: string) => void;
        debouncedCursorActivity: (info: { line: number; col: number }) => void;
        lastValue = '';
        view: ViewUpdate['view'];

        constructor(view: ViewUpdate['view']) {
            console.log('Editor plugin initialized');
            this.view = view;
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
} 