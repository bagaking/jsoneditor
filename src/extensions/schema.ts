import { Extension } from '@codemirror/state';
import { linter, Diagnostic } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import { SchemaValidator } from '../data/schema-validator';

/**
 * Schema 验证扩展配置
 */
export interface SchemaExtensionConfig {
    schema: object;
    validateOnType?: boolean;
    validateDebounce?: number;
}

/**
 * 创建 Schema 验证扩展
 */
export function createSchemaExtension(config: SchemaExtensionConfig): Extension {
    const validator = new SchemaValidator();
    let timer: number | null = null;

    const schemaLinter = linter((view: EditorView): Diagnostic[] => {
        const content = view.state.doc.toString();
        const diagnostics: Diagnostic[] = [];

        try {
            const value = JSON.parse(content);
            const result = validator.validate(value, config.schema);

            if (!result.valid && result.errors) {
                for (const error of result.errors) {
                    // TODO: 实现更精确的错误位置查找
                    const pos = 0;
                    diagnostics.push({
                        from: pos,
                        to: pos,
                        severity: 'error' as const,
                        message: `${error.path}: ${error.message}`
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