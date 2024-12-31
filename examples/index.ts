import { EditorCore } from '../src';
import { schema } from './schema';
import sampleData from './data.json';

// 获取 DOM 元素
const editorContainer = document.getElementById('editor')!;
const btnFormat = document.getElementById('btnFormat')!;
const btnMinify = document.getElementById('btnMinify')!;
const btnValidate = document.getElementById('btnValidate')!;
const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
const status = document.getElementById('status')!;

// 创建编辑器实例
let editor = new EditorCore({
    container: editorContainer,
    content: JSON.stringify(sampleData, null, 2),
    schema: schema,
    theme: 'light',
    autoFormat: false,
    validateOnChange: true
});

// 格式化按钮
btnFormat.addEventListener('click', () => {
    const formatted = editor.format();
    editor.setContent(formatted);
    updateStatus('Formatted');
});

// 压缩按钮
btnMinify.addEventListener('click', () => {
    const minified = editor.minify();
    editor.setContent(minified);
    updateStatus('Minified');
});

// 验证按钮
btnValidate.addEventListener('click', () => {
    try {
        const content = editor.getContent();
        const data = JSON.parse(content);
        updateStatus('Valid JSON');
    } catch (e) {
        updateStatus('Invalid JSON: ' + (e as Error).message);
    }
});

// 主题切换
themeSelect.addEventListener('change', () => {
    const theme = themeSelect.value as 'light' | 'dark';
    document.body.classList.toggle('theme-dark', theme === 'dark');
    
    // 使用新配置更新编辑器
    editor.updateConfig({
        theme,
        content: editor.getContent(),
        schema: schema,
        autoFormat: false,
        validateOnChange: true
    });
});

// 更新状态栏
function updateStatus(message: string) {
    status.textContent = message;
    setTimeout(() => {
        status.textContent = 'Ready';
    }, 3000);
} 