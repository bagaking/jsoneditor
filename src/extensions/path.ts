import { EditorView } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';

/**
 * JSON 路径工具类
 */
export class JsonPath {
    /**
     * 从节点获取完整的 JSON 路径
     */
    static fromNode(view: EditorView, node: SyntaxNode): string {
        const parts: string[] = [];
        let current = node;

        while (current && current.parent) {
            if (current.name === "Property") {
                const content = view.state.doc.sliceString(current.from, current.to);
                const keyMatch = content.match(/"([^"]+)"\s*:/);
                if (keyMatch) {
                    parts.unshift(`["${keyMatch[1]}"]`);
                }
            }
            current = current.parent;
        }

        return '$' + parts.join('');
    }

    /**
     * 从位置获取 JSON 路径
     */
    static fromPosition(view: EditorView, pos: number): string | null {
        const node = syntaxTree(view.state).resolveInner(pos);
        if (!node) return null;

        // 如果在属性名上，直接返回路径
        if (node.name === "PropertyName" || node.parent?.name === "Property") {
            return this.fromNode(view, node.parent || node);
        }

        // 如果在值上，返回父属性的路径
        const property = this.findParentProperty(node);
        return property ? this.fromNode(view, property) : null;
    }

    /**
     * 解析属性值
     */
    static extractPropertyValue(content: string): { key: string, value: string } | null {
        const keyMatch = content.match(/"([^"]+)"\s*:/);
        const valueMatch = content.match(/:\s*(.+)/);
        if (!keyMatch || !valueMatch) return null;
        return {
            key: keyMatch[1],
            value: valueMatch[1].trim()
        };
    }

    /**
     * 获取清理后的值
     */
    static getCleanValue(value: string, node: SyntaxNode, view: EditorView): string {
        // 如果是字符串类型
        if (value.startsWith('"')) {
            return value.replace(/^"(.*)".*$/, '$1');
        }
        
        // 如果是对象或数组类型
        const valueNode = node.getChild('Object') || node.getChild('Array');
        if (valueNode) {
            return view.state.doc.sliceString(valueNode.from, valueNode.to);
        }
        
        // 其他类型（数字、布尔等）
        return value;
    }

    /**
     * 查找父级属性节点
     */
    private static findParentProperty(node: SyntaxNode): SyntaxNode | null {
        let current = node;
        while (current && current.parent) {
            if (current.name === "Property") {
                return current;
            }
            current = current.parent;
        }
        return null;
    }

    /**
     * 将路径字符串解析为路径数组
     */
    static parsePath(path: string): string[] {
        if (!path.startsWith('$')) return [];
        return path.slice(1).split(/[\[\]]/)
            .filter(p => p && p !== '"' && p !== "'")
            .map(p => p.replace(/['"]/g, ''));
    }

    /**
     * 将路径数组转换为路径字符串
     */
    static stringifyPath(parts: string[]): string {
        return '$' + parts.map(p => `["${p}"]`).join('');
    }
} 