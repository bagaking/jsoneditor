import React, { useState, useEffect } from 'react';
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
    const [editingValue, setEditingValue] = useState<string | undefined>(value);

    // 同步外部 value 变化到 editingValue
    useEffect(() => {
        setEditingValue(value);
    }, [value]);

    // 提交更改
    const handleSubmit = () => {
        if (editingValue !== value) {
            onValueChange?.(editingValue || '');
        }
    };

    // 是否可编辑
    const isEditable = schema.enum || 
                      schema.type === 'boolean' ||
                      schema.format === 'date-time' || 
                      schema.format === 'color' || 
                      schema.pattern?.includes('#[0-9a-fA-F]{6}');

    // 从路径中获取当前属性名
    const propertyName = path.split('.').pop() || '';
    
    // 从父级 schema 中判断是否必填
    const isRequired = React.useMemo(() => {
        const parentSchema = schema.parent as JsonSchemaProperty;
        return parentSchema?.required?.includes(propertyName) || false;
    }, [path, schema, propertyName]);

    const baseInputClass = `
        px-2 py-0.5 
        text-xs 
        rounded 
        border border-blue-200 dark:border-blue-700 
        bg-white dark:bg-gray-800 
        text-gray-800 dark:text-gray-200 
        transition-all duration-150
        focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400
        hover:border-blue-300 dark:hover:border-blue-600
        placeholder-gray-400 dark:placeholder-gray-500
    `.replace(/\s+/g, ' ').trim();

    const renderValueInput = () => {
        if (!isEditable) return null;

        // 枚举类型
        if (schema.enum) {
            return (
                <select
                    value={editingValue || ''}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        setEditingValue(newValue);
                        onValueChange?.(newValue);
                    }}
                    className={`w-40 ${baseInputClass}`}
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

        // 布尔类型
        if (schema.type === 'boolean') {
            const boolValue = editingValue === 'true';
            return (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const newValue = (!boolValue).toString();
                            setEditingValue(newValue);
                            onValueChange?.(newValue);
                        }}
                        className={`
                            px-3 py-1 text-xs rounded 
                            transition-all duration-150
                            border
                            ${boolValue 
                                ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600' 
                                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                            }
                            dark:${boolValue
                                ? 'bg-blue-600 border-blue-700 hover:bg-blue-700'
                                : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                            }
                        `}
                    >
                        {boolValue ? 'True' : 'False'}
                    </button>
                </div>
            );
        }

        // 日期时间类型
        if (schema.format === 'date-time') {
            // 解析当前值为日期和时间
            const parseDateTime = (value: string | undefined) => {
                if (!value) return { date: '', time: '' };
                try {
                    const date = new Date(value);
                    return {
                        date: date.toISOString().split('T')[0],
                        time: date.toISOString().split('T')[1].substring(0, 5)
                    };
                } catch {
                    return { date: '', time: '' };
                }
            };

            const { date, time } = parseDateTime(editingValue);

            const handleDateTimeChange = (newDate: string, newTime: string) => {
                if (!newDate) return;
                const value = newTime 
                    ? `${newDate}T${newTime}:00.000Z`
                    : `${newDate}T00:00:00.000Z`;
                setEditingValue(value);
            };

            return (
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => {
                                e.stopPropagation();
                                handleDateTimeChange(e.target.value, time);
                            }}
                            onBlur={(e) => {
                                e.stopPropagation();
                                handleSubmit();
                            }}
                            placeholder="选择日期"
                            
                            className={`w-28 pl-2 pr-8 ${baseInputClass} [&::-webkit-calendar-picker-indicator]:hidden`}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            📅
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => {
                                e.stopPropagation();
                                handleDateTimeChange(date, e.target.value);
                            }}
                            onBlur={(e) => {
                                e.stopPropagation();
                                handleSubmit();
                            }}
                            placeholder="选择时间"
                            className={`w-20 pl-2 pr-8 ${baseInputClass} [&::-webkit-calendar-picker-indicator]:hidden`}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            🕒
                        </span>
                    </div>
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
                        className="w-6 h-6 rounded border border-blue-200 dark:border-blue-700 transition-colors duration-150"
                    />
                    <input
                        type="text"
                        value={editingValue || ''}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={handleSubmit}
                        placeholder="#000000"
                        className="w-32 px-2 py-0.5 text-xs rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors duration-150"
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <div className="
            sticky bottom-[32px]
            px-3 py-2 
            bg-blue-50/95 dark:bg-blue-900/30 
            backdrop-blur-md
            border-t border-blue-200 dark:border-blue-800
            shadow-sm
            z-[9]
            transition-all duration-200
        ">
            <div className="text-xs text-blue-700 dark:text-blue-300">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        {schema.description && (
                            <>
                                <span className="text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={schema.description}>
                                    {schema.description}
                                </span>
                                <span className="text-gray-400 dark:text-gray-500">|</span>
                            </>
                        )}
                        
                        <span className="font-mono truncate" title={path}>{path}</span>
                        <span className="text-gray-400 dark:text-gray-500">|</span>
                        
                        <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {schema.type}
                            {schema.format && `:${schema.format}`}
                        </span>
                        
                        {isRequired && (
                            <span className="text-red-500 dark:text-red-400 font-medium">*</span>
                        )}
                    </div>

                    <div className="flex items-center">
                        {isEditable && renderValueInput()}
                    </div>
                </div>
            </div>
        </div>
    );
}; 