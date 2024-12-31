import { Extension } from '@codemirror/state';
import { linter, Diagnostic } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import { JsonPath, JsonSchemaProperty } from './path';
import { SchemaValidator } from '../core/schema-validator';

/**
 * Schema 编辑器扩展配置
 */
export interface SchemaEditorConfig {
    schema: JsonSchemaProperty;
    validateOnType?: boolean;
    validateDebounce?: number;
}

/**
 * 创建 Schema 编辑器扩展
 */
export function createSchemaEditorExtension(config: SchemaEditorConfig): Extension {
    const validator = new SchemaValidator();
    let timer: number | null = null;

    const schemaLinter = linter((view: EditorView): Diagnostic[] => {
        const content = view.state.doc.toString();
        const diagnostics: Diagnostic[] = [];

        try {
            const value = JSON.parse(content);
            const errors = validator.validate(value, config.schema);

            for (const error of errors) {
                const path = error.path || '';
                const pos = findPositionForPath(view, path);
                
                if (pos !== null) {
                    diagnostics.push({
                        from: pos,
                        to: pos,
                        severity: 'error',
                        message: error.message
                    });
                }
            }
        } catch (e) {
            // JSON 解析错误由 JSON 语言扩展处理
        }

        return diagnostics;
    });

    return [
        schemaLinter,
        EditorView.updateListener.of(update => {
            if (update.docChanged && config.validateOnType) {
                if (timer) {
                    window.clearTimeout(timer);
                }
                timer = window.setTimeout(() => {
                    update.view.dispatch({});
                    timer = null;
                }, config.validateDebounce || 300);
            }
        })
    ];
}

/**
 * 获取 Schema 自动补全建议
 */
export function getSchemaCompletions(schema: JsonSchemaProperty, context: CompletionContext): CompletionResult | null {
    if (!context.view) return null;
    
    const path = JsonPath.fromPosition(context.view, context.pos);
    if (!path) return null;

    // 获取当前路径的 schema 定义
    const currentSchema = JsonPath.getSchemaAtPath(schema, path);
    if (!currentSchema) return null;

    // 如果是枚举类型，提供可选值
    if (currentSchema.enum) {
        return {
            from: context.pos,
            options: currentSchema.enum.map(value => ({
                label: String(value),
                type: 'value'
            }))
        };
    }

    // 如果是对象类型，提供属性建议
    if (currentSchema.properties) {
        const properties = JsonPath.getPropertiesAtPath(schema, path);
        return {
            from: context.pos,
            options: properties.map(prop => ({
                label: prop.name,
                type: 'property',
                info: prop.description,
                boost: prop.required ? 1 : 0
            }))
        };
    }

    return null;
}

/**
 * 根据路径查找位置
 */
function findPositionForPath(view: EditorView, path: string): number | null {
    if (!path) return null;

    const tree = syntaxTree(view.state);
    let cursor = tree.cursor();

    while (cursor.next()) {
        if (cursor.name === "Property") {
            const currentPath = JsonPath.fromNode(view, cursor.node);
            if (currentPath === path) {
                return cursor.from;
            }
        }
    }

    return null;
} 