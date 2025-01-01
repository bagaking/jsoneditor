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

        // 检查焦点是否在编辑器相关的 UI 元素上
        isEditorRelatedElement(element: Element | null): boolean {
            if (!element) return false;
            
            // 检查是否是编辑器相关的类名
            const isEditorUI = element.closest('.cm-editor, .cm-json-editor-ui, .cm-panel') !== null;
            
            // 检查常见的编辑器 UI 元素
            const isCommonUI = element.tagName === 'SELECT' || 
                             element.tagName === 'INPUT' ||
                             element.getAttribute('role') === 'listbox' ||
                             element.getAttribute('role') === 'dialog' ||  // 日期选择器通常是 dialog
                             element.getAttribute('role') === 'presentation';
            
            // 检查父元素是否包含日期选择器相关类名
            const hasDatePickerParent = element.closest('[class*="calendar"],[class*="picker"],[class*="popup"],[class*="date"]') !== null;
            
            return isEditorUI || isCommonUI || hasDatePickerParent;
        }

        // 温和地恢复焦点
        requestFocus() {
            // 如果编辑器已经有焦点，不需要处理
            if (this.view.hasFocus) return;

            const focusRetentionStrategy = config.codeSettings?.focusRetentionStrategy;
            
            // 如果配置指定不自动恢复焦点，不处理
            if (focusRetentionStrategy === 'manual') return;

            // 使用 setTimeout 给 UI 元素一些时间完成它们的操作
            setTimeout(() => {
                const activeElement = document.activeElement;
                
                // 再次检查焦点状态和当前活动元素
                if (!this.view.hasFocus && !this.isEditorRelatedElement(activeElement)) {
                    if (focusRetentionStrategy === 'strict') {
                        // 严格模式：主动恢复焦点
                        console.log('Focus lost to non-editor element, strictly restoring...');
                        this.view.focus();
                    } else {  // soft 模式（默认）
                        // 只在焦点完全丢失（到 body）时恢复
                        if (activeElement === document.body) {
                            console.log('Focus lost to body, softly restoring...');
                            this.view.focus();
                        }
                    }
                }
            }, 150);  // 给 UI 元素 150ms 的操作时间
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
                    // console.log('Cursor moved:', cursorInfo);
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
                    // 检查当前焦点元素
                    const activeElement = document.activeElement;
                    
                    // 只有当焦点不在编辑器相关的 UI 元素上时，才考虑恢复焦点
                    if (!this.isEditorRelatedElement(activeElement)) {
                        this.requestFocus();
                    } else {
                        console.log('Focus moved to editor UI element, keeping...');
                    }
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