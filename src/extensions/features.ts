import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { history, historyKeymap } from '@codemirror/commands';
import { lineNumbers, highlightActiveLine } from '@codemirror/view';
import { bracketMatching } from '@codemirror/language';
import { keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { CodeSettings } from '../core/types';
import { schemaCompletion } from '../jsonkit/schema/completion';

/**
 * 创建基础功能扩展
 * 
 * @description
 * 创建编辑器的基础功能扩展,包括:
 * - 历史记录(撤销/重做)
 * - 行号显示
 * - 活动行高亮
 * - 括号匹配
 * - 基础快捷键
 * 
 * @param codeSettings - 代码编辑器设置
 * 
 * @example
 * ```typescript
 * const extensions = createBasicFeatures({
 *   lineNumbers: true,
 *   bracketMatching: true
 * });
 * ```
 * 
 * @remarks
 * - 所有功能都可以通过配置开关
 * - 使用标准的 CodeMirror 扩展
 * - 保持轻量级,避免不必要的功能
 * 
 * @returns 基础功能扩展数组
 */
export function createBasicFeatures(codeSettings: CodeSettings | undefined): Extension[] {
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
 * 
 * @description
 * 创建编辑器的自动补全功能扩展。
 * 支持基于 JSON Schema 的智能提示。
 * 
 * @param codeSettings - 代码编辑器设置
 * @param schema - JSON Schema 对象
 * 
 * @example
 * ```typescript
 * const extensions = createCompletionExtension(
 *   { autoCompletion: true },
 *   mySchema
 * );
 * ```
 * 
 * @remarks
 * - 可以通过配置完全禁用
 * - 使用 JSON Schema 提供智能提示
 * - 支持自定义补全提供者
 * 
 * @returns 自动补全扩展数组
 */
export function createCompletionExtension(codeSettings: CodeSettings | undefined, schema: object | null): Extension[] {
    if (codeSettings?.autoCompletion === false) return [];
    
    return [autocompletion({
        override: [(context: CompletionContext) => {
            if (schema) {
                return schemaCompletion.getCompletions(schema, context);
            }
            return null;
        }],
        defaultKeymap: true
    })];
}

/**
 * 创建样式扩展
 * 
 * @description
 * 创建编辑器的样式相关扩展,包括:
 * - 字体大小
 * - 字体族
 * - 行高
 * - 各种元素的样式
 * 
 * @param codeSettings - 代码编辑器设置
 * 
 * @example
 * ```typescript
 * const extension = createStyleExtension({
 *   fontSize: 14
 * });
 * ```
 * 
 * @remarks
 * - 使用 CSS 变量实现主题支持
 * - 保持响应式设计
 * - 考虑可访问性
 * 
 * @returns 样式扩展
 */
export function createStyleExtension(codeSettings: CodeSettings | undefined): Extension {
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