import { JsonSchemaProperty } from '../src/extensions/path';

/**
 * 示例 JSON Schema
 */
export const schema: JsonSchemaProperty = {
    type: 'object',
    required: ['apiVersion', 'metadata', 'data'],
    properties: {
        apiVersion: {
            type: 'string',
            description: 'API 版本号',
            enum: ['1.0', '2.0', '3.0']
        },
        metadata: {
            type: 'object',
            description: '元数据信息',
            required: ['generated', 'requestId'],
            properties: {
                generated: {
                    type: 'string',
                    description: '生成时间',
                    format: 'date-time'
                },
                requestId: {
                    type: 'string',
                    description: '请求 ID',
                    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                },
                responseTime: {
                    type: 'string',
                    description: '响应时间',
                    pattern: '^\\d+ms$'
                }
            }
        },
        data: {
            type: 'object',
            description: '主要数据',
            required: ['project'],
            properties: {
                project: {
                    type: 'object',
                    description: '项目信息',
                    required: ['id', 'name', 'status'],
                    properties: {
                        id: {
                            type: 'string',
                            description: '项目 ID'
                        },
                        name: {
                            type: 'string',
                            description: '项目名称'
                        },
                        status: {
                            type: 'string',
                            description: '项目状态',
                            enum: ['active', 'inactive', 'archived']
                        },
                        created: {
                            type: 'string',
                            description: '创建时间',
                            format: 'date-time'
                        },
                        config: {
                            type: 'object',
                            description: '项目配置',
                            properties: {
                                features: {
                                    type: 'object',
                                    description: '功能开关',
                                    properties: {
                                        pathHighlighting: {
                                            type: 'boolean',
                                            description: '路径高亮功能'
                                        },
                                        schemaValidation: {
                                            type: 'boolean',
                                            description: 'Schema 验证功能'
                                        },
                                        urlDetection: {
                                            type: 'boolean',
                                            description: 'URL 检测功能'
                                        }
                                    }
                                },
                                theme: {
                                    type: 'object',
                                    description: '主题配置',
                                    properties: {
                                        light: {
                                            type: 'object',
                                            description: '亮色主题',
                                            properties: {
                                                primary: {
                                                    type: 'string',
                                                    description: '主色',
                                                    pattern: '^#[0-9a-fA-F]{6}$'
                                                },
                                                secondary: {
                                                    type: 'string',
                                                    description: '次色',
                                                    pattern: '^#[0-9a-fA-F]{6}$'
                                                }
                                            }
                                        },
                                        dark: {
                                            type: 'object',
                                            description: '暗色主题',
                                            properties: {
                                                primary: {
                                                    type: 'string',
                                                    description: '主色',
                                                    pattern: '^#[0-9a-fA-F]{6}$'
                                                },
                                                secondary: {
                                                    type: 'string',
                                                    description: '次色',
                                                    pattern: '^#[0-9a-fA-F]{6}$'
                                                }
                                            }
                                        }
                                    }
                                },
                                documentation: {
                                    type: 'object',
                                    description: '文档配置',
                                    required: ['url'],
                                    properties: {
                                        url: {
                                            type: 'string',
                                            description: '文档 URL',
                                            format: 'uri'
                                        },
                                        version: {
                                            type: 'string',
                                            description: '文档版本'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}; 