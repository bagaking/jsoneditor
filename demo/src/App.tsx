import React, { useState } from 'react';
import { JsonEditor } from '@bagaking/jsoneditor';

const exampleJson = {
  name: "My Project",
  version: "1.0.0",
  description: "A demo project",
  features: {
    validation: true,
    autoCompletion: true,
    themeSupport: true
  },
  links: {
    homepage: "https://github.com/bagaking/jsoneditor",
    documentation: "https://github.com/bagaking/jsoneditor#readme"
  }
};

const schema = {
  type: "object",
  required: ["name", "version"],
  properties: {
    name: {
      type: "string",
      description: "项目名称"
    },
    version: {
      type: "string",
      description: "版本号",
      pattern: "^\\d+\\.\\d+\\.\\d+$"
    },
    description: {
      type: "string",
      description: "项目描述"
    },
    features: {
      type: "object",
      description: "功能特性",
      properties: {
        validation: {
          type: "boolean",
          description: "是否启用验证"
        },
        autoCompletion: {
          type: "boolean",
          description: "是否启用自动完成"
        },
        themeSupport: {
          type: "boolean",
          description: "是否支持主题"
        }
      }
    },
    links: {
      type: "object",
      description: "相关链接",
      properties: {
        homepage: {
          type: "string",
          description: "主页",
          format: "uri"
        },
        documentation: {
          type: "string",
          description: "文档",
          format: "uri"
        }
      }
    }
  }
};

// 添加 decoration 配置
const decorationConfig = {
    paths: {
        '$["features"]': {
            style: "underline bold",
            onClick: (value: string) => {
                console.log('Features clicked:', value, typeof value);
            }
        },
        '$["links"]': {
            style: "bg-purple-100/30 dark:bg-purple-900/30 rounded px-1 border border-purple-200 dark:border-purple-800",
            onClick: (value: string) => {
                console.log('Links clicked:', value);
            }
        },
        '$["version"]': {
            style: "italic bg-yellow-100/30 dark:bg-yellow-900/30 rounded px-1",
            onClick: (value: string) => {
                console.log('Version clicked:', value);
            }
        }
    },
    urlHandler: {
        onClick: (url: string) => {
            window.open(url, '_blank');
        }
    }
};

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [value, setValue] = useState(JSON.stringify(exampleJson, null, 2));
  const [error, setError] = useState<Error | null>(null);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            JSON Editor Demo
          </h1>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="px-4 py-2 flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            {theme === 'light' ? '🌞' : '🌙'} {theme === 'light' ? 'Light' : 'Dark'} Theme
          </button>
        </div>

        <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400">
                This demo showcases various features of the JSON Editor:
            </p>
            <ul className="text-gray-600 dark:text-gray-400 list-disc list-inside">
                <li>Schema validation with detailed error messages</li>
                <li>Syntax highlighting and error detection</li>
                <li>Code formatting and minification</li>
                <li>Dark mode support</li>
                <li>Visual decorations for specific JSON paths</li>
            </ul>
        </div>

        <JsonEditor
          className="h-[500px] shadow-sm overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
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
            schema,
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
          decorationConfig={decorationConfig}
          // 工具栏配置
          toolbarConfig={{
            position: 'top',
            features: {
              format: true,
              minify: true,
              validate: true,
              copy: true,
              expand: true
            }
          }}
        />

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