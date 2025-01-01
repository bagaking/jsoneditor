export { JsonEditor } from './ui/JsonEditor';
export { EditorCore } from './core/editor-core';

// 导出所有公共类型
export type {
    // 编辑器核心类型
    EditorConfig,
    DecorationConfig,
    DecorationStyle,
    CustomComponent,
    DecorationPathHook,
    CodeSettings,
    SchemaConfig,
    ThemeConfig,
    ValidationConfig,
} from './core/types';

export type {
    // UI 组件类型
    JsonEditorProps,
    ToolbarConfig,
    ToolbarProps,
    ExpandOption,
} from './ui/types'; 

