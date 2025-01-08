import { EditorView } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';
import { JsonSchemaProperty } from './types';

/**
 * JSON 路径工具类
 */
export class JsonPath {
    /**
     * 从节点获取完整的 JSON 路径
     */
    static fromNode(view: EditorView, node: SyntaxNode): string {
        // console.log('JsonPath.fromNode input:', {
        //     name: node.name,
        //     text: view.state.doc.sliceString(node.from, node.to),
        //     parent: node.parent?.name
        // });

        const parts: string[] = [];
        let current: SyntaxNode | null = node;

        // 先找到最近的 Property 节点
        if (current.name !== "Property" && current.parent) {
            current = current.parent;
        }

        // 然后向上遍历所有父节点
        while (current) {
            // console.log('Processing node:', {
            //     name: current.name,
            //     text: view.state.doc.sliceString(current.from, current.to),
            //     parent: current.parent?.name
            // });

            if (current.name === "Property") {
                const content = view.state.doc.sliceString(current.from, current.to);
                const keyMatch = content.match(/"([^"]+)"\s*:/);
                if (keyMatch) {
                    // console.log('Found property key:', keyMatch[1]);
                    parts.unshift(`["${keyMatch[1]}"]`);
                }
            }
            current = current.parent;
        }

        const result = '$' + parts.join('');
        // console.log('Generated path:', result);
        return result;
    }

    /**
     * 从位置获取 JSON 路径
     */
    static fromPosition(view: EditorView, pos: number): string | null {
        console.log('[JsonPath] Resolving path at position:', pos);
        const node = syntaxTree(view.state).resolveInner(pos);
        console.log('[JsonPath] Found node:', {
            name: node?.name,
            text: node ? view.state.doc.sliceString(node.from, node.to) : null,
            node
        });
        if (!node) return null;

        // 如果在属性名上，直接返回路径
        if (node.name === "PropertyName" || node.parent?.name === "Property") {
            console.log('[JsonPath] Found property node', { node });
            return this.fromNode(view, node.parent || node);
        }

        // 如果在值上，返回父属性的路径
        const property = this.findParentProperty(node);
        console.log('[JsonPath] Found parent property:', property?.name);
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

    /**
     * 从 schema 中获取指定路径的定义
     */
    static getSchemaAtPath(schema: JsonSchemaProperty, path: string): JsonSchemaProperty | null {
        console.log('[JsonPath] Getting schema at path:', { path, schema });
        const parts = this.parsePath(path);
        console.log('[JsonPath] Parsed path parts:', parts);
        let current: JsonSchemaProperty | null = schema;

        for (const part of parts) {
            if (!current) {
                console.log('[JsonPath] Current schema is null, returning null');
                return null;
            }

            // 处理数组
            if (Array.isArray(current.type) && current.type.includes('array')) {
                console.log('[JsonPath] Processing array type');
                current = current.items || null;
                continue;
            }

            // 处理对象
            if (current.properties && part in current.properties) {
                console.log('[JsonPath] Found property in schema:', part);
                current = current.properties[part];
            } else {
                console.log('[JsonPath] Property not found in schema:', part);
                return null;
            }
        }

        console.log('[JsonPath] Returning schema:', current);
        return current;
    }

    /**
     * 获取指定路径下的所有可用属性
     */
    static getPropertiesAtPath(schema: JsonSchemaProperty, path: string): Array<{ name: string; description?: string; required?: boolean }> {
        const current = this.getSchemaAtPath(schema, path);
        if (!current || !current.properties) return [];

        const required = new Set(current.required || []);
        return Object.entries(current.properties).map(([name, prop]) => ({
            name,
            description: (prop as JsonSchemaProperty).description,
            required: required.has(name)
        }));
    }

    /**
     * 获取指定路径的可选值列表
     */
    static getEnumAtPath(schema: JsonSchemaProperty, path: string): any[] {
        const current = this.getSchemaAtPath(schema, path);
        return current?.enum || [];
    }

    /**
     * 验证路径是否有效
     */
    static isValidPath(schema: JsonSchemaProperty, path: string): boolean {
        return this.getSchemaAtPath(schema, path) !== null;
    }

    /**
     * 获取路径的父路径
     */
    static getParentPath(path: string): string {
        const parts = this.parsePath(path);
        parts.pop();
        return this.stringifyPath(parts);
    }

    /**
     * 获取路径的最后一个部分
     */
    static getLastPart(path: string): string | null {
        const parts = this.parsePath(path);
        return parts.length > 0 ? parts[parts.length - 1] : null;
    }

    /**
     * 判断是否是子路径
     */
    static isChildPath(parentPath: string, childPath: string): boolean {
        if (parentPath === '$') return childPath !== '$';
        return childPath.startsWith(parentPath + '["') && this.parsePath(childPath).length === this.parsePath(parentPath).length + 1;
    }

    /**
     * 获取所有子路径
     */
    static getChildPaths(schema: JsonSchemaProperty, path: string): string[] {
        const current = this.getSchemaAtPath(schema, path);
        if (!current || !current.properties) return [];

        return Object.keys(current.properties).map(key => 
            path === '$' ? `$["${key}"]` : `${path}["${key}"]`
        );
    }
} 