import { useState, useRef } from 'react';
import { JsonEditor, EditorCore } from '@bagaking/jsoneditor';
import { ConfigPanel } from '../components/ConfigPanel';
import { defaultConfig } from '../config';
import { linkExamples } from '../config/link-examples';

export const LinkDemo = () => {
  const [config, setConfig] = useState(defaultConfig);
  const editorRefs = [useRef<EditorCore>(null), useRef<EditorCore>(null), useRef<EditorCore>(null)];
  const [values, setValues] = useState([
    JSON.stringify(linkExamples.example1, null, 2),
    JSON.stringify(linkExamples.example2, null, 2),
    JSON.stringify(linkExamples.example3, null, 2),
  ]);

  const handleLinkClick = (url: string, editorIndex: number) => {
    console.log(`Editor ${editorIndex + 1} clicked link: ${url}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* 配置面板 */}
      <div className="lg:w-[480px] p-4">
        <ConfigPanel config={config} onChange={setConfig} />
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {editorRefs.map((ref, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 p-2 text-sm font-medium">
              Editor {index + 1}
            </div>
            <JsonEditor
              ref={ref}
              defaultValue={values[index]}
              readOnly={false}
              codeSettings={config.codeSettings}
              toolbarConfig={config.toolbarConfig}
              expandOption={config.expandOption}
              decorationConfig={{
                ...config.decorationConfig,
                urlHandler: {
                  onClick: (url) => handleLinkClick(url, index),
                  openInNewTab: false
                }
              }}
              onValueChange={(newValue) => {
                const newValues = [...values];
                newValues[index] = newValue;
                setValues(newValues);
              }}
              themeConfig={config.themeConfig}
            />
          </div>
        ))}
      </div>
    </div>
  );
}; 