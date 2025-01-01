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
    <div className="bg-gray-50 dark:bg-gray-900 py-8 h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 ">
        <div className="flex flex-col lg:flex-row gap-8 ">

          {/* 配置面板 */}
          <div className="lg:w-[480px]">
            <ConfigPanel config={config} onChange={setConfig} />
          </div>

          {/* 编辑器区域 */}
          <JsonEditor
                ref={editorRef}
                defaultValue={value}
                schemaConfig={{
                  schema: exampleSchema,
                  validateOnType: config.schemaConfig.validateOnType,
                  validateDebounce: config.schemaConfig.validateDebounce,
                }}
                codeSettings={config.codeSettings}
                toolbarConfig={{
                  ...config.toolbarConfig,
                  customButtons: [
                    {
                      key: 'download',
                      render: (editor) => <DownloadButton editor={editor} />
                    }
                  ]
                }}
                expandOption={config.expandOption}
                decorationConfig={decorationConfig}
                onValueChange={(newValue) => {
                  setValue(newValue);
                }}
                themeConfig={config.themeConfig}
              />

        </div>
      </div>
    </div>
  );
}

export default App; 