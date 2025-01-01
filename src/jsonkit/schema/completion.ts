import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { ISchemaCompletion } from './types';
import { JsonPath } from '../path';
import { JsonSchemaProperty } from '../path/types';

/**
 * Schema 补全提供者
 */
export class SchemaCompletion implements ISchemaCompletion {
    /**
     * 获取 Schema 自动补全建议
     */
    public getCompletions(schema: JsonSchemaProperty, context: CompletionContext): CompletionResult | null {
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
                options: currentSchema.enum.map((value: unknown) => ({
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
                options: properties.map((prop) => ({
                    label: prop.name,
                    type: 'property',
                    info: prop.description,
                    boost: prop.required ? 1 : 0
                }))
            };
        }

        return null;
    }
}

// 导出默认实例
export const schemaCompletion = new SchemaCompletion(); 