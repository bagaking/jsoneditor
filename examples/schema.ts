/**
 * JSON Editor 示例的 Schema 定义
 */
export const schema = {
    type: "object",
    required: ["apiVersion", "metadata", "data"],
    properties: {
        apiVersion: {
            type: "string",
            description: "API 版本号",
            enum: ["1.0", "2.0", "3.0"]
        },
        metadata: {
            type: "object",
            description: "元数据信息",
            required: ["generated", "requestId", "responseTime"],
            properties: {
                generated: {
                    type: "string",
                    format: "date-time",
                    description: "生成时间"
                },
                requestId: {
                    type: "string",
                    pattern: "^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$",
                    description: "请求 ID"
                },
                responseTime: {
                    type: "string",
                    pattern: "^\\d+ms$",
                    description: "响应时间"
                }
            }
        },
        data: {
            type: "object",
            description: "主数据",
            required: ["project"],
            properties: {
                project: {
                    type: "object",
                    required: ["id", "name", "status", "created", "config"],
                    properties: {
                        id: {
                            type: "string",
                            pattern: "^project-\\d+$",
                            description: "项目 ID"
                        },
                        name: {
                            type: "string",
                            minLength: 1,
                            maxLength: 100,
                            description: "项目名称"
                        },
                        status: {
                            type: "string",
                            enum: ["active", "inactive", "archived"],
                            description: "项目状态"
                        },
                        created: {
                            type: "string",
                            format: "date-time",
                            description: "创建时间"
                        },
                        config: {
                            type: "object",
                            required: ["features", "theme", "documentation"],
                            properties: {
                                features: {
                                    type: "object",
                                    description: "功能配置",
                                    properties: {
                                        pathHighlighting: {
                                            type: "boolean",
                                            description: "路径高亮功能"
                                        },
                                        schemaValidation: {
                                            type: "boolean",
                                            description: "Schema 验证功能"
                                        },
                                        urlDetection: {
                                            type: "boolean",
                                            description: "URL 检测功能"
                                        }
                                    }
                                },
                                theme: {
                                    type: "object",
                                    description: "主题配置",
                                    required: ["light", "dark"],
                                    properties: {
                                        light: {
                                            type: "object",
                                            required: ["primary", "secondary"],
                                            properties: {
                                                primary: {
                                                    type: "string",
                                                    pattern: "^#[0-9a-fA-F]{6}$",
                                                    description: "主要颜色"
                                                },
                                                secondary: {
                                                    type: "string",
                                                    pattern: "^#[0-9a-fA-F]{6}$",
                                                    description: "次要颜色"
                                                }
                                            }
                                        },
                                        dark: {
                                            type: "object",
                                            required: ["primary", "secondary"],
                                            properties: {
                                                primary: {
                                                    type: "string",
                                                    pattern: "^#[0-9a-fA-F]{6}$",
                                                    description: "主要颜色"
                                                },
                                                secondary: {
                                                    type: "string",
                                                    pattern: "^#[0-9a-fA-F]{6}$",
                                                    description: "次要颜色"
                                                }
                                            }
                                        }
                                    }
                                },
                                documentation: {
                                    type: "object",
                                    required: ["url", "version"],
                                    properties: {
                                        url: {
                                            type: "string",
                                            format: "uri",
                                            description: "文档 URL"
                                        },
                                        version: {
                                            type: "string",
                                            pattern: "^\\d+\\.\\d+\\.\\d+$",
                                            description: "文档版本"
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