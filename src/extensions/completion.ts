import { Extension } from '@codemirror/state';
import { CompletionContext, CompletionResult, autocompletion, completeFromList, Completion } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';

/**
 * 补全配置
 */
export interface CompletionConfig {
    schema?: object;
    customCompletions?: Completion[];
    triggerOnQuote?: boolean;
}

/**
 * 创建补全扩展
 */
export function createCompletionExtension(config: CompletionConfig = {}): Extension {
    return autocompletion({
        override: [completeJSON],
        activateOnTyping: true,
        defaultKeymap: true
    });

    function completeJSON(context: CompletionContext): CompletionResult | null {
        const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
        const textBefore = context.state.sliceDoc(nodeBefore.from, context.pos);

        // 在对象的键位置
        if (nodeBefore.name === 'PropertyName' || textBefore.endsWith('"')) {
            return completePropertyName(context, nodeBefore.from);
        }

        // 在值的位置
        if (nodeBefore.name === 'PropertyValue' || textBefore.endsWith(':')) {
            return completePropertyValue(context, nodeBefore.from);
        }

        return null;
    }

    function completePropertyName(context: CompletionContext, from: number): CompletionResult | null {
        const completions: Completion[] = [];

        // 从 Schema 中获取可能的属性名
        if (config.schema && 'properties' in config.schema) {
            const properties = (config.schema as any).properties;
            for (const key in properties) {
                completions.push({
                    label: key,
                    type: 'property',
                    detail: properties[key].description || '',
                    boost: 1
                });
            }
        }

        // 添加自定义补全
        if (config.customCompletions) {
            completions.push(...config.customCompletions);
        }

        return {
            from,
            options: completions,
            validFor: /^["']?[a-zA-Z0-9_]*["']?$/
        };
    }

    function completePropertyValue(context: CompletionContext, from: number): CompletionResult | null {
        const completions: Completion[] = [
            { label: 'true', type: 'keyword' },
            { label: 'false', type: 'keyword' },
            { label: 'null', type: 'keyword' },
            { label: '{}', type: 'snippet', detail: 'Empty object' },
            { label: '[]', type: 'snippet', detail: 'Empty array' }
        ];

        // 从 Schema 中获取可能的值
        const path = getPropertyPath(context);
        if (config.schema && path) {
            const schema = getSchemaForPath(config.schema, path);
            if (schema && schema.enum) {
                for (const value of schema.enum) {
                    completions.push({
                        label: JSON.stringify(value),
                        type: 'enum',
                        detail: 'Enum value'
                    });
                }
            }
        }

        return {
            from,
            options: completions
        };
    }

    function getPropertyPath(context: CompletionContext): string[] | null {
        // TODO: 实现获取当前属性的路径
        return null;
    }

    function getSchemaForPath(schema: any, path: string[]): any {
        // TODO: 实现根据路径获取 Schema
        return null;
    }
} 