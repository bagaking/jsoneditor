/**
 * 防抖函数
 * 
 * @description
 * 创建一个防抖函数,在指定时间内只执行最后一次调用。
 * 
 * @param func - 要执行的函数
 * @param wait - 等待时间(毫秒)
 * 
 * @example
 * ```typescript
 * const debouncedSave = debounce((text) => saveToServer(text), 1000);
 * input.onchange = (e) => debouncedSave(e.target.value);
 * ```
 * 
 * @remarks
 * - 使用 TypeScript 泛型保持类型安全
 * - 自动清理之前的定时器
 * - 支持任意参数类型
 * 
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}; 