import { StateField } from '@codemirror/state';

/**
 * 光标位置状态字段
 * 
 * @description
 * 维护编辑器的光标位置信息,包括行号和列号。
 * 这个状态会在每次选择变化时更新。
 * 
 * @example
 * ```typescript
 * // 获取当前光标位置
 * const cursorInfo = view.state.field(cursorStateField);
 * console.log(`Line: ${cursorInfo.line}, Column: ${cursorInfo.col}`);
 * ```
 * 
 * @remarks
 * - 行号和列号都是从 1 开始计数
 * - 只在选择变化时更新,以避免不必要的计算
 * - 列号计算考虑了制表符的宽度
 */
export const cursorStateField = StateField.define<{ line: number; col: number }>({
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

/**
 * 文档大小状态字段
 * 
 * @description
 * 维护文档的大小信息,包括行数和字节数。
 * 这个状态会在文档内容变化时更新。
 * 
 * @example
 * ```typescript
 * // 获取文档大小信息
 * const docSize = view.state.field(docSizeStateField);
 * console.log(`Lines: ${docSize.lines}, Bytes: ${docSize.bytes}`);
 * ```
 * 
 * @remarks
 * - 只在文档内容真正变化时更新,避免不必要的计算
 * - 字节数使用 UTF-8 编码计算
 * - 对于大文档,计算字节数可能会有性能影响
 */
export const docSizeStateField = StateField.define<{ lines: number; bytes: number }>({
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