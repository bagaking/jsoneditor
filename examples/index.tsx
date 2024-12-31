import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { JsonEditor, CustomComponent } from '../src';

// 创建自定义组件
const BadgeComponent: CustomComponent = {
    type: 'component',
    render: ({ value, onClick }) => {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = value;
        badge.style.cssText = `
            background: #e6f7ff;
            border: 1px solid #91d5ff;
            border-radius: 2px;
            padding: 0 6px;
            font-size: 12px;
            margin-left: 8px;
            cursor: pointer;
        `;
        if (onClick) {
            badge.onclick = () => onClick(value);
        }
        return badge;
    }
};

// 创建 URL 徽章组件
const UrlBadgeComponent: CustomComponent = {
    type: 'component',
    render: ({ value, onClick }) => {
        const badge = document.createElement('span');
        badge.className = 'url-badge';
        badge.innerHTML = `🔗`;
        badge.style.cssText = `
            hover: {
                background: #f6ffed;
                border: 1px solid #b7eb8f;
                border-radius: 2px;
            }
            padding: 2px 8px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        `;
        if (onClick) {
            badge.onclick = () => onClick(value);
        }
        return badge;
    }
};

const exampleJson = {
    "apiVersion": "2.0",
    "metadata": {
        "generated": "2024-12-31T12:29:43.422Z",
        "requestId": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "responseTime": "82ms"
    },
    "data": {
        "project": {
            "id": "project-123",
            "name": "Advanced JSON Editor",
            "status": "active",
            "created": "2024-01-01T08:00:00Z",
            "config": {
                "features": {
                    "pathHighlighting": true,
                    "schemaValidation": true,
                    "urlDetection": true
                },
                "theme": {
                    "light": {
                        "primary": "#1a73e8",
                        "secondary": "#40a9ff"
                    },
                    "dark": {
                        "primary": "#69c0ff",
                        "secondary": "#91d5ff"
                    }
                },
                "documentation": {
                    "url": "https://example.com/docs",
                    "version": "1.0.0"
                }
            }
        }
    }
};

function App() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [value, setValue] = useState(JSON.stringify(exampleJson, null, 2));
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<string>('');

    // 监听系统主题变化
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setTheme(e.matches ? 'dark' : 'light');
        };
        
        // 设置初始主题
        setTheme(mediaQuery.matches ? 'dark' : 'light');
        
        // 监听变化
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const updateStatus = (message: string) => {
        setStatus(message);
        // 3秒后清除状态
        setTimeout(() => setStatus(''), 3000);
    };

    // 更新主题时同时更新 body 类名
    useEffect(() => {
        document.body.className = theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-100';
    }, [theme]);

    return (
        <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                        JSON Editor Demo
                    </h1>
                    <select 
                        value={theme} 
                        onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300"
                    >
                        <option value="light">Light Theme</option>
                        <option value="dark">Dark Theme</option>
                    </select>
                </div>
                <JsonEditor
                    className="h-[600px] shadow-sm"
                    defaultValue={value}
                    onChange={setValue}
                    onError={setError}
                    config={{
                        theme,
                        decoration: {
                            paths: {
                                '$["apiVersion"]': {
                                    style: 'underline bold',
                                    onClick: (value) => updateStatus(`API Version: ${value}`)
                                },
                                '$["data"]["project"]["status"]': {
                                    style: BadgeComponent,
                                    onClick: (value) => updateStatus(`Project Status: ${value}`)
                                },
                                '$["data"]["project"]["config"]["features"]': {
                                    style: 'underline italic',
                                    onClick: (value) => updateStatus(`Features: ${value}`)
                                },
                                '$["data"]["project"]["config"]["documentation"]["url"]': {
                                    style: 'underline',
                                    onClick: (value) => window.open(value, '_blank')
                                }
                            },
                            urlHandler: {
                                component: UrlBadgeComponent,
                                onClick: (url) => {
                                    updateStatus(`Opening: ${url}`);
                                    window.open(url, '_blank');
                                }
                            }
                        }
                    }}
                />
                {error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
                        {error.message}
                    </div>
                )}
                {status && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md text-green-600 dark:text-green-400 text-sm">
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}

// 渲染应用
const root = createRoot(document.getElementById('root')!);
root.render(<App />); 