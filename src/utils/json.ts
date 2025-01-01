/**
 * JSON 多级收缩配置
 */
export interface MinifyOptions {
  /** 当前收缩层级 */
  level?: number;
  /** 是否保持缩进 */
  keepIndent?: boolean;
  /** 每层缩进空格数 */
  indentSize?: number;
}

/**
 * 获取对象的最大嵌套深度
 * @param obj - 要检查的对象
 * @returns 最大嵌套深度
 */
function getMaxDepth(obj: any): number {
  if (typeof obj !== 'object' || obj === null) {
    return 0;
  }
  
  return 1 + Math.max(
    0,
    ...Object.values(obj).map(getMaxDepth)
  );
}

/**
 * 递归压缩 JSON 对象
 * @param obj - 要压缩的对象
 * @param options - 压缩配置
 * @param currentDepth - 当前深度
 * @returns 压缩后的字符串
 */
function minifyLevel(
  obj: any, 
  options: MinifyOptions,
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
      return `[${obj.map(item => minifyLevel(item, options, currentDepth + 1)).join(',')}]`;
    }
    
    // 否则保持格式化
    const indent = keepIndent ? ' '.repeat(indentSize * currentDepth) : '';
    const childIndent = keepIndent ? ' '.repeat(indentSize * (currentDepth + 1)) : '';
    
    return '[\n' +
      obj.map(item => 
        childIndent + minifyLevel(item, options, currentDepth + 1)
      ).join(',\n') +
      '\n' + indent + ']';
  }

  // 对象处理
  const entries = Object.entries(obj);
  
  // 如果当前深度大于等于压缩层级,则压缩成一行
  if (currentDepth >= level) {
    return '{' + 
      entries.map(([key, value]) => 
        `"${key}":${minifyLevel(value, options, currentDepth + 1)}`
      ).join(',') + 
      '}';
  }
  
  // 否则保持格式化
  const indent = keepIndent ? ' '.repeat(indentSize * currentDepth) : '';
  const childIndent = keepIndent ? ' '.repeat(indentSize * (currentDepth + 1)) : '';
  
  return '{\n' +
    entries.map(([key, value]) =>
      `${childIndent}"${key}": ${minifyLevel(value, options, currentDepth + 1)}`
    ).join(',\n') +
    '\n' + indent + '}';
}

/**
 * 多级压缩 JSON 字符串
 * @param json - 要压缩的 JSON 字符串
 * @param options - 压缩配置
 * @returns 压缩后的字符串
 */
export function minifyJson(json: string, options: MinifyOptions = {}): string {
  try {
    const obj = JSON.parse(json);
    return minifyLevel(obj, options);
  } catch (err) {
    throw new Error(`Invalid JSON: ${err}`);
  }
}

/**
 * 获取 JSON 字符串的最大压缩层级
 * @param json - JSON 字符串
 * @returns 最大压缩层级
 */
export function getMaxMinifyLevel(json: string): number {
  try {
    const obj = JSON.parse(json);
    return getMaxDepth(obj);
  } catch {
    return 0;
  }
}