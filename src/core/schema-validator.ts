import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { ValidationError } from './types';

// 创建 Ajv 实例
const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false
});
addFormats(ajv);

/**
 * JSON Schema 验证器
 */
export class SchemaValidator {
    /**
     * 验证 JSON 数据
     */
    validate(value: any, schema: object): ValidationError[] {
        try {
            const validate = ajv.compile(schema);
            const valid = validate(value);

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
     * 验证单个值
     */
    validateValue(value: any, schema: object): boolean {
        const validate = ajv.compile(schema);
        return validate(value);
    }
} 