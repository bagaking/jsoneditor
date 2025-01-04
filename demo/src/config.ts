import { ToolbarConfig, ExpandOption, DecorationConfig } from '@bagaking/jsoneditor';
import { JsonSchemaProperty } from '@bagaking/jsoneditor';

export interface EditorConfigState {
  codeSettings: {
    fontSize: number;
    lineNumbers: boolean;
    bracketMatching: boolean;
    autoCompletion: boolean;
    highlightActiveLine: boolean;
  };
  schemaConfig: {
    validateDebounce: number;
    validateOnType: boolean;
  };
  themeConfig: {
    theme: 'light' | 'dark';
  };
  toolbarConfig: ToolbarConfig;
  expandOption: ExpandOption;
  decorationConfig: DecorationConfig;
}

export const defaultConfig: EditorConfigState = {
  codeSettings: {
    fontSize: 14,
    lineNumbers: true,
    bracketMatching: true,
    autoCompletion: true,
    highlightActiveLine: true,
  },
  schemaConfig: {
    validateDebounce: 300,
    validateOnType: true,
  },
  themeConfig: {
    theme: 'light',
  },
  toolbarConfig: {
    position: 'top',
    features: {
      format: true,
      minify: true,
      validate: true,
      copy: true,
      expand: true,
    },
  },
  expandOption: {
    defaultExpanded: true,
    collapsedLines: 12,
    animation: {
      enabled: true,
      duration: 300,
      timing: 'ease-in-out'
    }
  },
  decorationConfig: {
    paths: {},
    urlHandler: {
      openInNewTab: true
    }
  }
};

// 示例 JSON 数据
export const exampleJson = {
  // 基本信息
  name: "Advanced JSON Editor Demo",
  version: "2.0.0",
  status: "active",
  type: "application",
  description: "A powerful JSON editor with rich features",
  ttt_url: "https://github.com/bagaking/jsoneditor/issues",
  // 时间相关
  createdAt: "2024-01-20T08:00:00Z",
  updatedAt: "2024-01-21T10:30:00Z",
  lastAccess: "2024-01-21T15:45:00Z",
  
  // 统计信息
  stats: {
    views: 1234,
    downloads: 567,
    stars: 89,
    rating: 4.8
  },
  

  // 配置信息
  config: {
    theme: {
      primary: "#1e40af",
      secondary: "#7c3aed",
      background: "#ffffff"
    },
    features: {
      validation: true,
      autoCompletion: true,
      themeSupport: true,
      customDecorators: true
    }
  },
  
  // 组件列表
  components: [
    {
      id: "comp-001",
      name: "Editor Core",
      version: "1.0.0",
      status: "stable",
      dependencies: ["codemirror", "react"]
    },
    {
      id: "comp-002",
      name: "Schema Validator",
      version: "1.0.0",
      status: "beta",
      dependencies: ["ajv"]
    }
  ],
  
  // 资源链接
  resources: {
    documentation: "https://github.com/bagaking/jsoneditor#readme",
    repository: "https://github.com/bagaking/jsoneditor",
    api: "https://api.example.com/v1",
    cdn: "https://cdn.example.com"
  },
  
  // 标签和元数据
  tags: ["editor", "json", "react", "typescript"],
  metadata: {
    license: "MIT",
    author: "John Doe",
    organization: "Example Inc.",
    keywords: ["json", "editor", "schema", "validation"]
  }
};

// 装饰器配置
export const decorationConfig: DecorationConfig = {
  paths: {

    '$["name"]': {
      style: "underline",
      target: 'key',
    },
    '$["ttt_url"]': {
      style: "underline",
      target: 'key',
    },

    // 版本号使用特殊样式
    '$["version"]': {
      style: "italic bg-blue-100/30 dark:bg-blue-900/30 rounded px-1",
      target: 'value',
      onClick: (value: string) => console.log('Version:', value)
    },
    
    // 状态使用不同颜色
    '$["status"]': {
      style: "underline",
      target: 'value',
      onClick: (value: string) => console.log('Status:', value)
    },

     
    
    // 时间使用自定义组件
    '$["createdAt"]': {
      style: {
        type: 'component',
        render: ({ value }: { value: string }) => {
          const date = new Date(value);
          const el = document.createElement('span');
          el.className = 'text-gray-600 dark:text-gray-400';
          el.textContent = `📅 ${date.toLocaleDateString()}`;
          return el;
        }
      }
    },
    
    // 标签使用特殊样式
    '$["tags"][*]': {
      style: "bg-blue-100/50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded text-sm",
      target: 'both'
    },
    
    // URL 使用链接样式
    '$["resources"]["repository"]': {
      style: {
        type: 'component',
        render: ({ value }: { value: string }) => {
          const el = document.createElement('a');
          el.href = value;
          el.target = '_blank';
          el.className = 'text-blue-600 dark:text-blue-400 hover:underline';
          el.textContent = new URL(value).hostname;
          return el;
        }
      }
    }
  }
};

// JSON Schema 定义
export const exampleSchema: JsonSchemaProperty = {
  type: "object",
  required: ["name", "version", "status", "type"],
  properties: {
    name: {
      type: "string",
      description: "项目名称",
      minLength: 3
    },
    version: {
      type: "string",
      description: "版本号",
      pattern: "^\\d+\\.\\d+\\.\\d+$"
    },
    type: {
      type: "string",
      description: "项目类型",
      enum: ["application", "library", "tool"]
    },
    status: {
      type: "string",
      description: "项目状态",
      enum: ["active", "deprecated", "maintenance"]
    },
    description: {
      type: "string",
      description: "项目描述"
    },
    createdAt: {
      type: "string",
      description: "创建时间",
      format: "date-time"
    },
    updatedAt: {
      type: "string",
      description: "更新时间",
      format: "date-time"
    },
    lastAccess: {
      type: "string",
      description: "最后访问时间",
      format: "date-time"
    },
    stats: {
      type: "object",
      description: "统计信息",
      properties: {
        views: {
          type: "integer",
          minimum: 0
        },
        downloads: {
          type: "integer",
          minimum: 0
        },
        stars: {
          type: "integer",
          minimum: 0
        },
        rating: {
          type: "number",
          minimum: 0,
          maximum: 5
        },
        set: {
          type: "boolean",
        },
      }
    },
    config: {
      type: "object",
      description: "配置信息",
      properties: {
        theme: {
          type: "object",
          properties: {
            primary: {
              type: "string",
              description: "主色",
              pattern: "^#[0-9a-fA-F]{6}$"
            },
            secondary: {
              type: "string",
              description: "次色",
              pattern: "^#[0-9a-fA-F]{6}$"
            },
            background: {
              type: "string",
              description: "背景色",
              pattern: "^#[0-9a-fA-F]{6}$"
            }
          }
        },
        features: {
          type: "object",
          description: "功能特性",
          additionalProperties: {
            type: "boolean"
          }
        }
      }
    },
    components: {
      type: "array",
      description: "组件列表",
      items: {
        type: "object",
        required: ["id", "name", "version", "status"],
        properties: {
          id: {
            type: "string",
            pattern: "^comp-\\d{3}$"
          },
          name: {
            type: "string"
          },
          version: {
            type: "string",
            pattern: "^\\d+\\.\\d+\\.\\d+$"
          },
          status: {
            type: "string",
            enum: ["stable", "beta", "deprecated"]
          },
          dependencies: {
            type: "array",
            items: {
              type: "string"
            }
          }
        }
      }
    },
    resources: {
      type: "object",
      description: "资源链接",
      properties: {
        documentation: {
          type: "string",
          format: "uri"
        },
        repository: {
          type: "string",
          format: "uri"
        },
        api: {
          type: "string",
          format: "uri"
        },
        cdn: {
          type: "string",
          format: "uri"
        }
      }
    },
    tags: {
      type: "array",
      description: "标签",
      items: {
        type: "string"
      }
    },
    metadata: {
      type: "object",
      description: "元数据",
      properties: {
        license: {
          type: "string"
        },
        author: {
          type: "string"
        },
        organization: {
          type: "string"
        },
        keywords: {
          type: "array",
          items: {
            type: "string"
          }
        }
      }
    }
  }
}; 