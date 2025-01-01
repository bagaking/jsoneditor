import { useState, useRef } from 'react';
import { JsonEditor, EditorCore } from '@bagaking/jsoneditor';
import { ConfigPanel } from './components/ConfigPanel';
import { DownloadButton } from './components/DownloadButton';
import { defaultConfig, exampleJson, exampleSchema, decorationConfig } from './config';

function App() {
  const [config, setConfig] = useState(defaultConfig);
  const editorRef = useRef<EditorCore>(null);
  const [value, setValue] = useState(JSON.stringify(exampleJson, null, 2));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 编辑器区域 */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">JSON 编辑器</h2>
                <DownloadButton editor={editorRef.current} />
              </div>
              <JsonEditor
                ref={editorRef}
                defaultValue={value}
                schemaConfig={{
                  schema: exampleSchema,
                  validateOnType: config.schemaConfig.validateOnType,
                  validateDebounce: config.schemaConfig.validateDebounce,
                }}
                codeSettings={config.codeSettings}
                toolbarConfig={config.toolbarConfig}
                expandOption={config.expandOption}
                decorationConfig={decorationConfig}
                onValueChange={(newValue) => {
                  setValue(newValue);
                }}
              />
            </div>
          </div>

          {/* 配置面板 */}
          <div className="lg:w-[480px]">
            <ConfigPanel config={config} onChange={setConfig} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 