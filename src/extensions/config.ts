import { EditorConfig, CodeSettings, SchemaConfig, ThemeConfig, ValidationConfig } from '../core/types';

// 默认代码设置
export const defaultCodeSettings: CodeSettings = {
    fontSize: 14,
    lineNumbers: true,
    bracketMatching: true,
    autoCompletion: true,
    highlightActiveLine: true,
    focusRetentionStrategy: 'manual'
};

// 默认 Schema 配置
export const defaultSchemaConfig: SchemaConfig = {
    validateOnType: true,
    validateDebounce: 300
};

// 默认主题配置
export const defaultThemeConfig: ThemeConfig = {
    theme: 'light'
};

// 默认验证配置
export const defaultValidationConfig: ValidationConfig = {
    validateOnChange: true,
    autoFormat: false
};

/**
 * 比较两个编辑器配置是否相等
 * 
 * @description
 * 深度比较两个编辑器配置对象,包括所有嵌套的配置项。
 * 用于避免不必要的配置更新。
 * 
 * @param a - 第一个配置对象
 * @param b - 第二个配置对象
 * 
 * @example
 * ```typescript
 * if (configEquals(oldConfig, newConfig)) {
 *   console.log('Config not changed');
 *   return;
 * }
 * ```
 * 
 * @remarks
 * - 使用严格比较进行基本类型比较
 * - 使用 JSON.stringify 比较复杂对象
 * - 考虑了所有可能的配置项
 * 
 * @returns 两个配置是否相等
 */
export function configEquals(a: EditorConfig, b: EditorConfig): boolean {
    // 比较基础配置
    if (a.readonly !== b.readonly) return false;

    // 比较代码设置
    const codeSettingsEqual = 
        a.codeSettings?.fontSize === b.codeSettings?.fontSize &&
        a.codeSettings?.lineNumbers === b.codeSettings?.lineNumbers &&
        a.codeSettings?.bracketMatching === b.codeSettings?.bracketMatching &&
        a.codeSettings?.autoCompletion === b.codeSettings?.autoCompletion &&
        a.codeSettings?.highlightActiveLine === b.codeSettings?.highlightActiveLine;
    if (!codeSettingsEqual) return false;

    // 比较主题配置
    if (a.themeConfig?.theme !== b.themeConfig?.theme) return false;

    // 比较 schema 配置
    const schemaEqual = 
        a.schemaConfig?.validateOnType === b.schemaConfig?.validateOnType &&
        a.schemaConfig?.validateDebounce === b.schemaConfig?.validateDebounce &&
        JSON.stringify(a.schemaConfig?.schema) === JSON.stringify(b.schemaConfig?.schema);
    if (!schemaEqual) return false;

    // 比较验证配置
    const validationEqual =
        a.validationConfig?.validateOnChange === b.validationConfig?.validateOnChange &&
        a.validationConfig?.autoFormat === b.validationConfig?.autoFormat;
    if (!validationEqual) return false;

    // 比较装饰配置
    if (JSON.stringify(a.decorationConfig) !== JSON.stringify(b.decorationConfig)) return false;

    return true;
} 