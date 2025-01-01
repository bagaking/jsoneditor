import React from 'react';
import { EditorConfigState } from '../config';

interface ConfigPanelProps {
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

  const features = config.toolbarConfig.features || {};

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* 标题栏 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">编辑器配置</h3>
      </div>

      {/* 配置内容 */}
      <div className="p-4 space-y-6">
        {/* 代码和 Schema 设置 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 代码设置 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-l-2 border-blue-500 pl-2">代码设置</h4>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">字体大小</label>
              <input
                type="number"
                value={config.codeSettings.fontSize}
                onChange={e => handleChange('codeSettings', 'fontSize', Number(e.target.value))}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center group">
                <input
                  type="checkbox"
                  checked={config.codeSettings.lineNumbers}
                  onChange={e => handleChange('codeSettings', 'lineNumbers', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">显示行号</span>
              </label>
              <label className="flex items-center group">
                <input
                  type="checkbox"
                  checked={config.codeSettings.bracketMatching}
                  onChange={e => handleChange('codeSettings', 'bracketMatching', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">括号匹配</span>
              </label>
              <label className="flex items-center group">
                <input
                  type="checkbox"
                  checked={config.codeSettings.autoCompletion}
                  onChange={e => handleChange('codeSettings', 'autoCompletion', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">自动完成</span>
              </label>
              <label className="flex items-center group">
                <input
                  type="checkbox"
                  checked={config.codeSettings.highlightActiveLine}
                  onChange={e => handleChange('codeSettings', 'highlightActiveLine', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">高亮当前行</span>
              </label>
            </div>
          </div>

          {/* Schema 设置 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-l-2 border-blue-500 pl-2">Schema 设置</h4>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">验证防抖时间 (ms)</label>
              <input
                type="number"
                value={config.schemaConfig.validateDebounce}
                onChange={e => handleChange('schemaConfig', 'validateDebounce', Number(e.target.value))}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center group">
                <input
                  type="checkbox"
                  checked={config.schemaConfig.validateOnType}
                  onChange={e => handleChange('schemaConfig', 'validateOnType', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">输入时验证</span>
              </label>
            </div>
          </div>
        </div>

        {/* 工具栏和展开设置 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 工具栏设置 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-l-2 border-blue-500 pl-2">工具栏设置</h4>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">位置</label>
              <select
                value={config.toolbarConfig.position}
                onChange={e => handleChange('toolbarConfig', 'position', e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              >
                <option value="top">顶部</option>
                <option value="bottom">底部</option>
                <option value="none">隐藏</option>
              </select>
            </div>
            <div className="space-y-2">
              {Object.entries(features).map(([key, value]) => (
                <label key={key} className="flex items-center group">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={e => handleChange('toolbarConfig', 'features', {
                      ...features,
                      [key]: e.target.checked
                    })}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 展开设置 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-l-2 border-blue-500 pl-2">展开设置</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">最小高度</label>
                <input
                  type="text"
                  value={config.expandOption.expanded.minHeight}
                  onChange={e => handleChange('expandOption', 'expanded', {
                    ...config.expandOption.expanded,
                    minHeight: e.target.value
                  })}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">最大高度</label>
                <input
                  type="text"
                  value={config.expandOption.expanded.maxHeight}
                  onChange={e => handleChange('expandOption', 'expanded', {
                    ...config.expandOption.expanded,
                    maxHeight: e.target.value
                  })}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">动画时长 (ms)</label>
              <input
                type="number"
                value={config.expandOption.animation?.duration}
                onChange={e => handleChange('expandOption', 'animation', {
                  ...config.expandOption.animation,
                  duration: Number(e.target.value)
                })}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center group">
                <input
                  type="checkbox"
                  checked={config.expandOption.animation?.enabled}
                  onChange={e => handleChange('expandOption', 'animation', {
                    ...config.expandOption.animation,
                    enabled: e.target.checked
                  })}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">启用动画</span>
              </label>
              <label className="flex items-center group">
                <input
                  type="checkbox"
                  checked={config.expandOption.defaultExpanded}
                  onChange={e => handleChange('expandOption', 'defaultExpanded', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">默认展开</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 