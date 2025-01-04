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

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* 配置面板 */}
      <div className="lg:w-[480px] p-4">
        <ConfigPanel config={config} onChange={setConfig} />
        <div className="mt-4 flex items-center gap-2">
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