import React from 'react';
import { EditorConfigState } from '../../config';
import {
  NumberInput,
  Select,
  Checkbox,
} from './FormComponents';

export interface ConfigPanelProps {
  config: EditorConfigState;
  onChange: (config: EditorConfigState) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
  
  const handleChange = <K extends keyof EditorConfigState>(
    section: K,
    key: keyof EditorConfigState[K],
    value: any
  ) => {
    onChange({
      ...config,
      [section]: {
        ...config[section],
        [key]: value
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* 标题栏 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">编辑器配置</h3>
        <button
          onClick={() => handleChange('themeConfig', 'theme', config.themeConfig.theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {config.themeConfig.theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      {/* 配置面板主体 */}
      <div className="p-4">
        <div className="flex flex-wrap gap-4">
          {/* 代码设置 */}
          <div className="flex-1 min-w-[240px]">
            <h4 className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">代码设置</h4>
            <div className="space-y-3">
              <NumberInput
                label="字体大小"
                value={config.codeSettings.fontSize}
                onChange={value => handleChange('codeSettings', 'fontSize', value)}
              />
              <div className="grid grid-cols-2 gap-1.5">
                <Checkbox
                  label="显示行号"
                  checked={config.codeSettings.lineNumbers}
                  onChange={checked => handleChange('codeSettings', 'lineNumbers', checked)}
                />
                <Checkbox
                  label="括号匹配"
                  checked={config.codeSettings.bracketMatching}
                  onChange={checked => handleChange('codeSettings', 'bracketMatching', checked)}
                />
                <Checkbox
                  label="自动完成"
                  checked={config.codeSettings.autoCompletion}
                  onChange={checked => handleChange('codeSettings', 'autoCompletion', checked)}
                />
                <Checkbox
                  label="高亮当前行"
                  checked={config.codeSettings.highlightActiveLine}
                  onChange={checked => handleChange('codeSettings', 'highlightActiveLine', checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-[240px]">
            <h4 className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">验证设置</h4>
            <div className="space-y-3">
              <Checkbox
                label="变更时验证"
                checked={config.validationConfig.validateOnChange ?? true}
                onChange={checked => handleChange('validationConfig', 'validateOnChange', checked)}
              />
            </div>
          </div>

          {/* 工具栏设置 */}
          <div className="flex-1 min-w-[240px]">
            <h4 className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">工具栏设置</h4>
            <div className="space-y-3">
              <Select
                label="位置"
                value={config.toolbarConfig.position || 'top'}
                options={[
                  { value: 'top', label: '顶部' },
                  { value: 'bottom', label: '底部' },
                  { value: 'none', label: '隐藏' }
                ]}
                onChange={value => handleChange('toolbarConfig', 'position', value)}
              />
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(config.toolbarConfig.features || {}).map(([key, value]) => (
                  <Checkbox
                    key={key}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    checked={value}
                    onChange={checked => handleChange('toolbarConfig', 'features', {
                      ...config.toolbarConfig.features,
                      [key]: checked
                    })}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 展开设置 */}
          <div className="flex-1 min-w-[240px]">
            <h4 className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">展开设置</h4>
            <div className="space-y-3">
              <NumberInput
                label="收起时显示行数"
                value={config.expandOption.collapsedLines || 5}
                onChange={value => handleChange('expandOption', 'collapsedLines', value)}
              />
              <NumberInput
                label="动画时长 (ms)"
                value={config.expandOption.animation?.duration || 300}
                onChange={value => handleChange('expandOption', 'animation', {
                  ...config.expandOption.animation,
                  duration: value
                })}
              />
              <div className="grid grid-cols-2 gap-1.5">
                <Checkbox
                  label="启用动画"
                  checked={config.expandOption.animation?.enabled || false}
                  onChange={checked => handleChange('expandOption', 'animation', {
                    ...config.expandOption.animation,
                    enabled: checked
                  })}
                />
                <Checkbox
                  label="默认展开"
                  checked={config.expandOption.defaultExpanded || false}
                  onChange={checked => handleChange('expandOption', 'defaultExpanded', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
