import { useState, useRef } from 'react';
import { JsonEditor, EditorCore } from '@bagaking/jsoneditor';
import { ConfigPanel } from '../components/ConfigPanel';
import { DownloadButton } from '../components/DownloadButton';
import { defaultConfig, exampleJson, exampleSchema, decorationConfig } from '../config';

export const BasicDemo = () => {
  const [config, setConfig] = useState(defaultConfig);
  const editorRef = useRef<EditorCore>(null);
  const [value, setValue] = useState(JSON.stringify(exampleJson, null, 2));
  const [isReadOnly, setIsReadOnly] = useState(false);

  // 测试 ref setValue
  const handleTestRefSetValue = () => {
    if (!editorRef.current) {
      console.warn('Editor not ready');
      return;
    }
    editorRef.current.setValue(JSON.stringify({
      test: 'ref setValue test',
      timestamp: Date.now()
    }, null, 2));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* 配置面板 */}
      <div className="lg:w-[480px] p-4">
        <ConfigPanel config={config} onChange={setConfig} />
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              只读模式
            </label>
            <input
              type="checkbox"
              checked={isReadOnly}
              onChange={(e) => setIsReadOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          {/* 测试按钮 */}
          <button
            onClick={handleTestRefSetValue}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Test Ref setValue
          </button>
        </div>
      </div>

      {/* 编辑器区域 */}
      <JsonEditor
        ref={editorRef}
        defaultValue={value}
        readOnly={isReadOnly}
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
  );
}; 