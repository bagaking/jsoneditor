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
 * JSON 解析器
 * 负责 JSON 的解析、格式化和压缩
 */
export class JSONParser {
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
} 