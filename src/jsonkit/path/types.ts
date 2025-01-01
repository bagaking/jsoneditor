import { EditorView } from '@codemirror/view';
import { SyntaxNode } from '@lezer/common';

/**
 * JSON Schema 属性
 */
export interface JsonSchemaProperty {
    type?: string;
    properties?: Record<string, JsonSchemaProperty>;
    items?: JsonSchemaProperty;
    required?: string[];
    enum?: any[];
    description?: string;
}

/**
 * JSON 路径接口
 */
export interface IJsonPath {
    /**
     * 从位置获取路径
     */
    fromPosition(view: EditorView, pos: number): string | null;

    /**
     * 从节点获取路径
     */
    fromNode(view: EditorView, node: SyntaxNode): string | null;

    /**
     * 获取指定路径的 schema
     */
    getSchemaAtPath(schema: JsonSchemaProperty, path: string): JsonSchemaProperty | null;

    /**
     * 获取指定路径的属性列表
     */
    getPropertiesAtPath(schema: JsonSchemaProperty, path: string): Array<{
        name: string;
        description?: string;
        required?: boolean;
    }>;

    /**
     * 解析路径字符串
     */
    parsePath(path: string): string[];

    /**
     * 提取属性值
     */
    extractPropertyValue(content: string): { key: string; value: string } | null;
} 