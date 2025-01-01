import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { JsonSchemaProperty } from '../path/types';

/**
 * 验证结果
 */
export interface ValidationResult {
    valid: boolean;
    errors?: ValidationError[];
}

/**
 * 验证错误
 */
export interface ValidationError {
    path: string;
    message: string;
    keyword: string;
    params?: Record<string, any>;
}

/**
 * Schema 验证器接口
 */
export interface ISchemaValidator {
    /**
     * 验证 JSON 数据
     */
    validate(data: any, schema: JsonSchemaProperty): ValidationResult;

    /**
     * 添加自定义格式
     */
    addFormat(name: string, format: RegExp | ((data: string) => boolean)): void;

    /**
     * 添加自定义关键字
     */
    addKeyword(keyword: string, definition: object): void;
}

/**
 * Schema 补全接口
 */
export interface ISchemaCompletion {
    /**
     * 获取 Schema 自动补全建议
     */
    getCompletions(schema: JsonSchemaProperty, context: CompletionContext): CompletionResult | null;
} 