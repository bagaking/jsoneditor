import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { ValidationError } from './types';
import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';

// 创建 Ajv 实例
const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false
});
addFormats(ajv);

/**
 * 基于 JSON Schema 进行验证
 */
export function validateWithSchema(value: string, schema: object): ValidationError[] {
    try {
        const data = JSON.parse(value);
        const validate = ajv.compile(schema);
        const valid = validate(data);

        if (!valid && validate.errors) {
            return validate.errors.map(err => ({
                path: err.instancePath,
                message: err.message || 'Unknown error',
                keyword: err.keyword,
                params: err.params
            }));
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
 * 从 schema 中提取补全建议
 */
export function getCompletions(schema: object, context: CompletionContext): CompletionResult | null {
    const node = syntaxTree(context.state).resolveInner(context.pos, -1);
    const line = context.state.doc.lineAt(context.pos);
    const prefix = line.text.slice(0, context.pos - line.from);

    // 如果在对象的 key 位置
    if (node.name === "PropertyName" || prefix.trim().endsWith('"')) {
        const path = getJsonPath(context.state.doc.toString(), context.pos);
        const properties = getSchemaProperties(schema, path);
        
        if (properties) {
            return {
                from: context.pos,
                options: properties.map(prop => ({
                    label: prop.name,
                    type: "property",
                    info: prop.description || undefined
                }))
            };
        }
    }

    // 如果在值的位置
    if (node.name === "String" || node.name === "Number" || node.name === "True" || node.name === "False" || node.name === "Null") {
        const path = getJsonPath(context.state.doc.toString(), context.pos);
        const values = getSchemaValues(schema, path);
        
        if (values) {
            return {
                from: context.pos,
                options: values.map(value => ({
                    label: String(value),
                    type: "value"
                }))
            };
        }
    }

    return null;
}

/**
 * 获取当前位置的 JSON 路径
 */
function getJsonPath(doc: string, pos: number): string[] {
    // TODO: 实现 JSON 路径解析
    return [];
}

/**
 * 从 schema 中获取指定路径的属性列表
 */
function getSchemaProperties(schema: object, path: string[]): Array<{ name: string; description?: string }> {
    // TODO: 实现属性列表获取
    return [];
}

/**
 * 从 schema 中获取指定路径的可选值列表
 */
function getSchemaValues(schema: object, path: string[]): any[] {
    // TODO: 实现可选值列表获取
    return [];
} 