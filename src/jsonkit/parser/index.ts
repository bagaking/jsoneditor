import { ParseResult, IJsonParser, ShrinkOptions } from './types';

/**
 * JSON 解析器
 * 负责 JSON 的解析、格式化和压缩
 */
export class JsonParser implements IJsonParser {
    /**
     * 解析 JSON 字符串
     */
    public parse(content: string): ParseResult {
        try {
            const value = JSON.parse(content);
            return {
                valid: true,
                value
            };
        } catch (e) {
            const error = e as SyntaxError;
            // 尝试获取错误位置
            const posMatch = error.message.match(/at position (\d+)/);
            const position = posMatch ? parseInt(posMatch[1], 10) : undefined;
            
            return {
                valid: false,
                error: {
                    message: error.message,
                    position
                }
            };
        }
    }

    /**
     * 格式化 JSON 字符串
     */
    public format(content: string): string {
        const parseResult = this.parse(content);
        if (!parseResult.valid) {
            return content; // 如果解析失败，返回原内容
        }
        return JSON.stringify(parseResult.value, null, 2);
    }

    /**
     * 压缩 JSON 字符串
     */
    public minify(content: string): string {
        const parseResult = this.parse(content);
        if (!parseResult.valid) {
            return content; // 如果解析失败，返回原内容
        }
        return JSON.stringify(parseResult.value);
    }

    /**
     * 多级压缩 JSON 字符串
     */
    public shrink(content: string, options: ShrinkOptions = {}): string {
        const parseResult = this.parse(content);
        if (!parseResult.valid) {
            return content;
        }
        return this.shrinkLevel(parseResult.value, options);
    }

    /**
     * 获取最大压缩层级
     */
    public getMaxShrinkLevel(content: string): number {
        const parseResult = this.parse(content);
        if (!parseResult.valid) {
            return 0;
        }
        return this.getMaxDepth(parseResult.value);
    }

    /**
     * 检查字符串是否为有效的 JSON
     */
    public isValid(content: string): boolean {
        try {
            JSON.parse(content);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 获取指定路径的值
     */
    public getValueAtPath(content: string, path: string[]): any {
        const parseResult = this.parse(content);
        if (!parseResult.valid) {
            return undefined;
        }

        let current = parseResult.value;
        for (const key of path) {
            if (current === undefined || current === null) {
                return undefined;
            }
            current = current[key];
        }
        return current;
    }

    /**
     * 设置指定路径的值
     */
    public setValueAtPath(content: string, path: string[], value: any): string {
        const parseResult = this.parse(content);
        if (!parseResult.valid) {
            return content;
        }

        let current = parseResult.value;
        const lastKey = path[path.length - 1];
        
        // 遍历到倒数第二层
        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            if (current[key] === undefined || current[key] === null) {
                current[key] = {};
            }
            current = current[key];
        }

        // 设置最后一层的值
        current[lastKey] = value;

        return JSON.stringify(parseResult.value, null, 2);
    }

    /**
     * 获取对象的最大嵌套深度
     */
    private getMaxDepth(obj: any): number {
        if (typeof obj !== 'object' || obj === null) {
            return 0;
        }
        
        return 1 + Math.max(
            0,
            ...Object.values(obj).map(value => this.getMaxDepth(value))
        );
    }

    /**
     * 递归压缩 JSON 对象
     */
    private shrinkLevel(
        obj: any, 
        options: ShrinkOptions,
        currentDepth: number = 0
    ): string {
        const {
            level = 1,
            keepIndent = false,
            indentSize = 2
        } = options;

        // 基础类型直接返回
        if (typeof obj !== 'object' || obj === null) {
            return JSON.stringify(obj);
        }

        // 数组处理
        if (Array.isArray(obj)) {
            // 如果当前深度大于等于压缩层级,则压缩成一行
            if (currentDepth >= level) {
                return `[${obj.map(item => 
                    this.shrinkLevel(item, options, currentDepth + 1)
                ).join(',')}]`;
            }
            
            // 否则保持格式化
            const indent = keepIndent ? ' '.repeat(indentSize * currentDepth) : '';
            const childIndent = keepIndent ? ' '.repeat(indentSize * (currentDepth + 1)) : '';
            
            return '[\n' +
                obj.map(item => 
                    childIndent + this.shrinkLevel(item, options, currentDepth + 1)
                ).join(',\n') +
                '\n' + indent + ']';
        }

        // 对象处理
        const entries = Object.entries(obj);
        
        // 如果当前深度大于等于压缩层级,则压缩成一行
        if (currentDepth >= level) {
            return '{' + 
                entries.map(([key, value]) => 
                    `"${key}":${this.shrinkLevel(value, options, currentDepth + 1)}`
                ).join(',') + 
                '}';
        }
        
        // 否则保持格式化
        const indent = keepIndent ? ' '.repeat(indentSize * currentDepth) : '';
        const childIndent = keepIndent ? ' '.repeat(indentSize * (currentDepth + 1)) : '';
        
        return '{\n' +
            entries.map(([key, value]) =>
                `${childIndent}"${key}": ${this.shrinkLevel(value, options, currentDepth + 1)}`
            ).join(',\n') +
            '\n' + indent + '}';
    }
}

// 导出默认实例
export const jsonParser = new JsonParser(); 