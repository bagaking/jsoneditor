import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { JsonEditor } from '../src';

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

    return (
        <div className={`app ${theme}`}>
            <div className="header">
                <h1>JSON Editor Demo</h1>
                <select 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                >
                    <option value="light">Light Theme</option>
                    <option value="dark">Dark Theme</option>
                </select>
            </div>
            <JsonEditor
                className={theme}
                defaultValue={value}
                onChange={setValue}
                onError={setError}
                config={{
                    theme,
                    decoration: {
                        paths: {
                            '$["apiVersion"]': {
                                style: 'underline bold',
                                onClick: (value) => alert(`API Version: ${value}`)
                            },
                            '$["data"]["project"]["config"]["features"]': {
                                style: 'underline',
                                onClick: (value) => alert(`Features:\n${value}`)
                            },
                            '$["data"]["project"]["config"]["documentation"]["url"]': {
                                style: 'underline',
                                onClick: (value) => window.open(value, '_blank')
                            }
                        }
                    }
                }}
            />
            {error && (
                <div className="error-message">
                    {error.message}
                </div>
            )}
        </div>
    );
}

// 渲染应用
const root = createRoot(document.getElementById('root')!);
root.render(<App />); 