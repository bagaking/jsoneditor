import React, { useState } from 'react';
import { JsonSchemaProperty } from '../../core/types';

export interface SchemaInfo {
    path: string;
    schema: JsonSchemaProperty;
    value?: string;
    onValueChange?: (value: string) => void;
}

export const SchemaInfoPanel: React.FC<SchemaInfo> = ({
    path,
    schema,
    value,
    onValueChange
}) => {
    // 编辑状态
    const [editingValue, setEditingValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);

    // 是否可编辑
    const isEditable = schema.enum || 
                      schema.format === 'date-time' || 
                      schema.format === 'color' || 
                      schema.pattern?.includes('#[0-9a-fA-F]{6}');

    // 提交更改
    const handleSubmit = () => {
        if (editingValue !== value) {
            onValueChange?.(editingValue || '');
        }
        setIsEditing(false);
    };

    // 取消编辑
    const handleCancel = () => {
        setEditingValue(value);
        setIsEditing(false);
    };

    // 开始编辑
    const handleStartEdit = () => {
        setEditingValue(value);
        setIsEditing(true);
    };

    const renderValueInput = () => {
        if (!isEditable) return null;

        // 枚举类型
        if (schema.enum) {
            return (
                <select
                    value={editingValue || ''}
                    onChange={(e) => {
                        setEditingValue(e.target.value);
                        onValueChange?.(e.target.value);
                    }}
                    className="w-40 px-2 py-0.5 text-xs rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                    <option value="">请选择...</option>
                    {schema.enum.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            );
        }

        // 日期时间类型
        if (schema.format === 'date-time') {
            return (
                <div className="flex items-center gap-1">
                    <input
                        type="datetime-local"
                        value={editingValue || ''}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={handleSubmit}
                        className="w-40 px-2 py-0.5 text-xs rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    />
                </div>
            );
        }

        // 颜色类型
        if (schema.format === 'color' || schema.pattern?.includes('#[0-9a-fA-F]{6}')) {
            return (
                <div className="flex items-center gap-1">
                    <input
                        type="color"
                        value={editingValue || '#000000'}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={handleSubmit}
                        className="w-6 h-6 rounded border border-blue-200 dark:border-blue-700"
                    />
                    <input
                        type="text"
                        value={editingValue || ''}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={handleSubmit}
                        placeholder="#000000"
                        className="w-32 px-2 py-0.5 text-xs rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border-t border-blue-200 dark:border-blue-800">
            <div className="text-xs text-blue-700 dark:text-blue-300">
                {/* 第一行：路径和必填标记 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        <span className="font-medium">路径:</span>
                        <span className="font-mono">{path}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isEditable && renderValueInput()}
                        {schema.required && (
                            <span className="text-red-500 dark:text-red-400 font-medium whitespace-nowrap">必填</span>
                        )}
                    </div>
                </div>

                {/* 第二行：类型信息 */}
                <div className="flex items-center mt-1">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-500 dark:text-gray-400">
                        {schema.type && (
                            <span className="whitespace-nowrap">
                                <span className="font-medium">类型:</span> {schema.type}
                            </span>
                        )}
                        {schema.format && (
                            <span className="whitespace-nowrap">
                                <span className="font-medium">格式:</span> {schema.format}
                            </span>
                        )}
                        {schema.pattern && (
                            <span className="whitespace-nowrap">
                                <span className="font-medium">模式:</span> {schema.pattern}
                            </span>
                        )}
                    </div>
                </div>

                {/* 第三行：描述信息 */}
                {schema.description && (
                    <div className="mt-1 text-gray-600 dark:text-gray-400 truncate">
                        {schema.description}
                    </div>
                )}
            </div>
        </div>
    );
}; 