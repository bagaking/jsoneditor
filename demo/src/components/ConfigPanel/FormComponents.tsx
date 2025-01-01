import React from 'react';

// 通用样式
const baseInputClass = `
  w-full
  h-8
  px-2
  text-sm
  rounded
  border
  border-gray-300 
  dark:border-gray-600
  bg-white 
  dark:bg-gray-800
  text-gray-600 
  dark:text-gray-300
  placeholder-gray-400
  dark:placeholder-gray-500
  focus:ring-1 
  focus:ring-blue-500 
  dark:focus:ring-blue-400
  focus:border-blue-500 
  dark:focus:border-blue-400
  transition-colors
`.replace(/\s+/g, ' ').trim();

const baseLabelClass = `
  block 
  text-sm 
  text-gray-600
  dark:text-gray-400
  mb-1
`.replace(/\s+/g, ' ').trim();

const baseCheckboxClass = `
  h-4 
  w-4 
  rounded 
  border-gray-300 
  dark:border-gray-600 
  text-blue-500 
  focus:ring-blue-500 
  dark:focus:ring-blue-400 
  transition-colors
`.replace(/\s+/g, ' ').trim();

// 配置卡片组件
export const ConfigCard: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700/50 h-full">
    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-l-2 border-blue-500 pl-2 mb-4">{title}</h4>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

// 数字输入组件
export const NumberInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
}> = ({ label, value, onChange }) => (
  <label className="block">
    <span className={baseLabelClass}>{label}</span>
    <input
      type="number"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className={baseInputClass}
    />
  </label>
);

// 文本输入组件
export const TextInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <label className="block">
    <span className={baseLabelClass}>{label}</span>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      className={baseInputClass}
    />
  </label>
);

// 选择框组件
export const Select: React.FC<{
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => (
  <label className="block">
    <span className={baseLabelClass}>{label}</span>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={baseInputClass}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

// 复选框组件
export const Checkbox: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className={baseCheckboxClass}
    />
    <span>{label}</span>
  </label>
);

// 复选框网格组件
export const CheckboxGrid: React.FC<{
  items: Array<{
    key: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }>;
}> = ({ items }) => (
  <div className="grid grid-cols-2 gap-2">
    {items.map(item => (
      <Checkbox
        key={item.key}
        label={item.label}
        checked={item.checked}
        onChange={item.onChange}
      />
    ))}
  </div>
); 