import { EditorCore } from '../src/core/editor-core';
import type { CustomComponent } from '../src/core/types';

// 获取 DOM 元素
const editorContainer = document.getElementById('editor') as HTMLElement;
const btnFormat = document.getElementById('btnFormat') as HTMLButtonElement;
const btnMinify = document.getElementById('btnMinify') as HTMLButtonElement;
const btnValidate = document.getElementById('btnValidate') as HTMLButtonElement;
const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
const statusEl = document.getElementById('status') as HTMLElement;

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

// 创建编辑器实例
const editor = new EditorCore(editorContainer);

// 初始化编辑器
editor.init(JSON.stringify({
    apiVersion: "2.0",
    metadata: {
        generated: new Date().toISOString(),
        requestId: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        responseTime: "82ms"
    },
    data: {
        project: {
            id: "project-123",
            name: "Advanced JSON Editor",
            status: "active",
            created: "2024-01-01T08:00:00Z",
            config: {
                features: {
                    pathHighlighting: true,
                    schemaValidation: true,
                    urlDetection: true
                },
                theme: {
                    light: { primary: "#1a73e8", secondary: "#40a9ff" },
                    dark: { primary: "#69c0ff", secondary: "#91d5ff" }
                }
            },
            documentation: {
                readme: "https://github.com/example/json-editor/blob/main/README.md",
                api: "https://api.example.com/docs",
                wiki: "https://wiki.example.com/json-editor"
            }
        },
        repositories: [
            {
                name: "main",
                url: "https://github.com/example/json-editor",
                branch: "main",
                lastCommit: {
                    id: "a1b2c3d",
                    message: "feat: Add advanced path highlighting",
                    author: {
                        name: "John Doe",
                        email: "john@example.com",
                        profile: "https://github.com/johndoe"
                    }
                }
            },
            {
                name: "docs",
                url: "https://github.com/example/json-editor-docs",
                branch: "main",
                lastCommit: {
                    id: "e4f5g6h",
                    message: "docs: Update API documentation",
                    author: {
                        name: "Jane Smith",
                        email: "jane@example.com",
                        profile: "https://github.com/janesmith"
                    }
                }
            }
        ],
        dependencies: {
            core: [
                { name: "@codemirror/state", version: "^6.0.0" },
                { name: "@codemirror/view", version: "^6.0.0" },
                { name: "@codemirror/lang-json", version: "^6.0.0" }
            ],
            optional: [
                { name: "ajv", version: "^8.0.0", purpose: "JSON Schema validation" },
                { name: "prettier", version: "^2.0.0", purpose: "Code formatting" }
            ]
        },
        stats: {
            stars: 1250,
            forks: 89,
            issues: {
                open: 12,
                closed: 384,
                details: "https://github.com/example/json-editor/issues"
            },
            performance: {
                loadTime: "120ms",
                parseTime: "45ms",
                memoryUsage: "5.2MB"
            }
        }
    }
}, null, 2));

// 配置路径高亮和 URL 按钮
editor.updateConfig({
    // 高亮重要字段
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
            onClick: (value) => updateStatus(`Enabled Features: ${JSON.stringify(value)}`)
        },
        '$["data"]["stats"]["stars"]': {
            style: 'bold',
            onClick: (value) => updateStatus(`GitHub Stars: ${value}`)
        },
        '$["data"]["stats"]["performance"]': {
            style: 'underline',
            onClick: (value) => {
                const perf = JSON.parse(value);
                updateStatus(`Performance Metrics - Load: ${perf.loadTime}, Parse: ${perf.parseTime}, Memory: ${perf.memoryUsage}`);
            }
        }
    },
    // 自定义 URL 处理
    urlHandler: {
        component: UrlBadgeComponent,
        onClick: (url) => {
            updateStatus(`Opening: ${url}`);
            window.open(url, '_blank');
        }
    }
});

// 绑定事件处理
btnFormat.onclick = () => {
    if (editor.format()) {
        updateStatus('JSON formatted successfully');
    } else {
        updateStatus('Failed to format JSON', true);
    }
};

btnMinify.onclick = () => {
    if (editor.minify()) {
        updateStatus('JSON minified successfully');
    } else {
        updateStatus('Failed to minify JSON', true);
    }
};

btnValidate.onclick = () => {
    const errors = editor.validate();
    if (errors.length === 0) {
        updateStatus('JSON is valid');
        
        // 额外的数据验证
        try {
            const data = JSON.parse(editor.getValue());
            const validations = [
                data.apiVersion === "2.0" ? null : "Invalid API version",
                data.data?.project?.status === "active" ? null : "Project is not active",
                data.data?.dependencies?.core?.length > 0 ? null : "No core dependencies defined",
                data.data?.stats?.stars >= 0 ? null : "Invalid stars count"
            ].filter(Boolean);

            if (validations.length > 0) {
                updateStatus(`Custom validation warnings: ${validations.join('; ')}`, true);
            }
        } catch (e) {
            updateStatus('Failed to perform custom validation', true);
        }
    } else {
        updateStatus(`Validation errors: ${errors.map(e => e.message).join('; ')}`, true);
    }
};

themeSelect.onchange = () => {
    const theme = themeSelect.value as 'light' | 'dark';
    document.body.className = theme;
    editor.setTheme(theme);
    updateStatus(`Theme changed to ${theme}`);
};

// 更新状态栏
function updateStatus(message: string, isError = false) {
    statusEl.textContent = message;
    statusEl.className = isError ? 'error' : '';
} 