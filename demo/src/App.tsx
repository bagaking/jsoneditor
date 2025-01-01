import React, { useState } from 'react';
import { JsonEditor, EditorCore, CustomComponent, DecorationConfig } from '@bagaking/jsoneditor';
import type { ToolbarConfig, ExpandOption } from '../../src/ui/types';

// 示例数据
const richExampleJson = {
  // 基础信息
  name: "Advanced JSON Editor Demo",
  version: "2.0.0",
  type: "application",
  status: "active",
  
  // 时间相关
  createdAt: "2024-01-20T08:00:00Z",
  updatedAt: "2024-01-21T10:30:00Z",
  
  // 配置信息
  config: {
    theme: {
      primary: "#1e40af",
      secondary: "#7c3aed"
    },
    features: {
      validation: true,
      autoCompletion: true,
      themeSupport: true,
      customDecorators: true
    }
  },
  
  // 复杂数组
  components: [
    {
      id: "comp-001",
      name: "Editor Core",
      version: "1.0.0",
      dependencies: ["codemirror", "react"]
    },
    {
      id: "comp-002",
      name: "Schema Validator",
      version: "1.0.0",
      dependencies: ["ajv"]
    }
  ],
  
  // 链接和资源
  resources: {
    documentation: "https://example.com/docs",
    repository: "https://github.com/example/repo",
    api: "https://api.example.com/v1",
    cdn: "https://cdn.example.com"
  }
};

// Schema 定义
const richSchema = {
  type: "object",
  required: ["name", "version", "type", "status"],
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
        required: ["id", "name", "version"],
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
    }
  }
};

// 装饰器配置
const richDecorationConfig: DecorationConfig = {
  paths: {
    // 版本号使用斜体
    '$["version"]': {
      style: "italic bg-blue-100/30 dark:bg-blue-900/30 rounded px-1",
      onClick: (value: string) => console.log('Version clicked:', value)
    },
    // 状态使用不同颜色
    '$["status"]': {
      style: "bold",
      onClick: (value: string) => {
        const colors = {
          active: 'text-green-600',
          deprecated: 'text-red-600',
          maintenance: 'text-yellow-600'
        };
        return colors[value as keyof typeof colors] || '';
      }
    },
    // 时间使用自定义组件
    '$["createdAt"]': {
      style: {
        type: 'component' as const,
        render: ({ value }: { value: string }) => {
          const date = new Date(value);
          const el = document.createElement('span');
          el.textContent = `📅 ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
          return el;
        }
      }
    },
    // 配置使用特殊背景
    '$["config"]': {
      style: "bg-purple-100/30 dark:bg-purple-900/30 rounded p-1 border border-purple-200 dark:border-purple-800"
    },
    // 组件列表使用特殊标记
    '$["components"]': {
      style: "underline bold",
      onClick: (value: string) => console.log('Components:', JSON.parse(value))
    }
  },
  // URL 处理器
  urlHandler: {
    component: {
      type: 'component' as const,
      render: ({ value, onClick }: { value: string; onClick?: (value: string) => void }) => {
        const el = document.createElement('button');
        const icon = value.includes('github') ? '🐙' : '🔗';
        el.textContent = `${icon} ${new URL(value).hostname}`;
        el.onclick = () => onClick?.(value);
        return el;
      }
    },
    onClick: (url: string) => {
      if (url.includes('api')) {
        console.log('API URL clicked:', url);
      } else {
        window.open(url, '_blank');
      }
    }
  }
};

// 自定义工具栏按钮
const customToolbarConfig: ToolbarConfig = {
  position: 'top',
  features: {
    format: true,
    minify: true,
    validate: true,
    copy: true,
    expand: true
  },
  customButtons: [
    {
      key: 'download',
      render: (editor: EditorCore) => (
        <button
          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/90 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md transition-colors border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
          onClick={() => {
            const content = editor.getValue();
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data.json';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          📥 Download
        </button>
      )
    }
  ]
};

// 展开配置
const expandOption: ExpandOption = {
  defaultExpanded: true,
  expanded: {
    autoHeight: false,
    minHeight: '200px',
    maxHeight: '800px'
  },
  collapsed: {
    height: '200px'
  },
  animation: {
    enabled: true,
    duration: 300,
    timing: 'ease-in-out'
  },
  onExpandChange: (expanded: boolean) => {
    console.log('Editor expanded:', expanded);
  }
};

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [value, setValue] = useState(JSON.stringify(richExampleJson, null, 2));
  const [error, setError] = useState<Error | null>(null);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 标题和主题切换 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Advanced JSON Editor Demo
          </h1>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="px-4 py-2 flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            {theme === 'light' ? '🌞' : '🌙'} {theme === 'light' ? 'Light' : 'Dark'} Theme
          </button>
        </div>

        {/* 功能说明 */}
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400">
            这个高级示例展示了 JSON Editor 的各种特性：
          </p>
          <ul className="text-gray-600 dark:text-gray-400 list-disc list-inside">
            <li>复杂的 Schema 验证（枚举、格式、正则等）</li>
            <li>自定义装饰器（样式、组件、交互）</li>
            <li>URL 自动识别和处理</li>
            <li>自定义工具栏按钮</li>
            <li>展开/折叠动画</li>
            <li>主题切换</li>
          </ul>
        </div>

        {/* 编辑器 */}
        <JsonEditor
          className="shadow-sm overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
          defaultValue={value}
          onValueChange={setValue}
          onError={setError}
          // 编辑器配置
          codeSettings={{
            fontSize: 14,
            lineNumbers: true,
            bracketMatching: true,
            autoCompletion: true,
            highlightActiveLine: true
          }}
          // Schema 配置
          schemaConfig={{
            schema: richSchema,
            validateOnType: true,
            validateDebounce: 300
          }}
          // 主题配置
          themeConfig={{
            theme
          }}
          // 验证配置
          validationConfig={{
            validateOnChange: true,
            autoFormat: false
          }}
          // 装饰配置
          decorationConfig={richDecorationConfig}
          // 工具栏配置
          toolbarConfig={customToolbarConfig}
          // 展开配置
          expandOption={expandOption}
        />

        {/* 错误提示 */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 