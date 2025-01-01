import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { ValidationResult, ValidationError, ISchemaValidator } from './types';
import { JsonSchemaProperty } from '../path/types';

/**
 * Schema 验证器
 * 负责 JSON Schema 的验证
 */
export class SchemaValidator implements ISchemaValidator {
    private ajv: Ajv;

    constructor() {
        this.ajv = new Ajv({
            allErrors: true,
            verbose: true,
            strict: false
        });
        addFormats(this.ajv);
    }

    /**
     * 验证 JSON 数据
     */
    public validate(data: any, schema: JsonSchemaProperty): ValidationResult {
        const validate = this.ajv.compile(schema);
        const valid = validate(data);

        if (!valid && validate.errors) {
            return {
                valid: false,
                errors: this.formatErrors(validate.errors)
            };
        }

        return {
            valid: true
        };
    }

    /**
     * 格式化错误信息
     */
    private formatErrors(errors: ErrorObject[]): ValidationError[] {
        return errors.map(error => ({
            path: error.instancePath || '',
            message: error.message || 'Unknown error',
            keyword: error.keyword,
            params: error.params
        }));
    }

    /**
     * 添加自定义格式
     */
    public addFormat(name: string, format: RegExp | ((data: string) => boolean)): void {
        this.ajv.addFormat(name, format);
    }

    /**
     * 添加自定义关键字
     */
    public addKeyword(keyword: string, definition: object): void {
        this.ajv.addKeyword({
            keyword,
            ...definition
        });
    }

    /**
     * 获取验证器实例
     */
    public getValidator(): Ajv {
        return this.ajv;
    }
}

// 导出默认实例
export const schemaValidator = new SchemaValidator(); 