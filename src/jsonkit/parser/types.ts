/**
 * JSON 解析结果
 */
export interface ParseResult {
    valid: boolean;
    value?: any;
    error?: {
        message: string;
        position?: number;
    };
}

/**
 * JSON 多级压缩配置
 */
export interface ShrinkOptions {
    /** 当前压缩层级 */
    level?: number;
    /** 是否保持缩进 */
    keepIndent?: boolean;
    /** 每层缩进空格数 */
    indentSize?: number;
}

/**
 * JSON 解析器接口
 */
export interface IJsonParser {
    /** 解析 JSON 字符串 */
    parse(content: string): ParseResult;
    
    /** 格式化 JSON 字符串 */
    format(content: string): string;
    
    /** 完全压缩 JSON 字符串 */
    minify(content: string): string;
    
    /** 多级压缩 JSON 字符串 */
    shrink(content: string, options?: ShrinkOptions): string;
    
    /** 获取最大压缩层级 */
    getMaxShrinkLevel(content: string): number;
    
    /** 检查字符串是否为有效的 JSON */
    isValid(content: string): boolean;
    
    /** 获取指定路径的值 */
    getValueAtPath(content: string, path: string[]): any;
    
    /** 设置指定路径的值 */
    setValueAtPath(content: string, path: string[], value: any): string;
} 