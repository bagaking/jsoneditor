import { Extension } from '@codemirror/state';
import { EditorView, Decoration, DecorationSet, WidgetType, ViewPlugin, ViewUpdate, PluginValue } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { DecorationConfig, DecorationStyle, CustomComponent } from '../core/types';
import { JsonPath } from './path';
import { rocketActionIcon, linkActionIcon } from '../utils/svg';

// 组件定义
class LinkWidget extends WidgetType {
    private svgContent: string;

    constructor(private url: string, private onClick?: (url: string) => void) {
        super();
        this.svgContent = linkActionIcon;
    }

    toDOM() {
        const button = document.createElement('button');
        button.className = 'cm-action-button';
        button.innerHTML = this.svgContent;
        button.title = 'Open URL';
        button.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.onClick) {
                this.onClick(this.url);
            } else {
                window.open(this.url, '_blank');
            }
        };
        return button;
    }

    eq(other: LinkWidget) {
        return this.url === other.url;
    }
}

class CustomDecorationWidget extends WidgetType {
    constructor(
        private component: CustomComponent,
        private value: string,
        private onClick?: (value: string) => void
    ) {
        super();
    }

    toDOM() {
        return this.component.render({
            value: this.value,
            onClick: this.onClick
        });
    }

    eq(other: CustomDecorationWidget) {
        return this.value === other.value;
    }
}

// 操作按钮组件
class ActionButton extends WidgetType {
    private svgContent: string;

    constructor(
        private value: string,
        private onClick: (value: string) => void,
        icon?: string
    ) {
        super();
        this.svgContent = icon || rocketActionIcon || `👆`;
    }

    toDOM() {
        const button = document.createElement('button');
        button.className = 'cm-action-button';
        button.innerHTML = this.svgContent;
        button.title = 'Click to trigger action';
        button.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.onClick(this.value);
        };
        return button;
    }

    eq(other: ActionButton) {
        return this.value === other.value && this.svgContent === other.svgContent;
    }
}

// 工具函数
const utils = {
    createStyleClassName(style: DecorationStyle): string {
        if (typeof style === 'object' && style.type === 'component') {
            return 'cm-custom-decoration';
        }
        
        if (typeof style === 'string') {
            // 处理预定义样式组合
            const baseStyles = style.split(' ');
            const presetStyles = baseStyles
                .filter(s => ['underline', 'bold', 'italic'].includes(s))
                .map(s => `cm-json-${s.trim()}`);
                
            // 处理自定义样式
            const customStyles = baseStyles
                .filter(s => !['underline', 'bold', 'italic'].includes(s));
            
            return [...presetStyles, ...customStyles].join(' ');
        }
        
        return '';
    },

    isValidUrl(str: string): boolean {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    }
};

// 装饰器工厂
class DecorationFactory {
    constructor(private config: DecorationConfig) {}

    createPathDecoration(style: DecorationStyle, value: string, onClick?: (value: string) => void, icon?: string) {
        const decorations: Decoration[] = [];

        // 1. 处理样式装饰
        if (typeof style === 'object' && style.type === 'component') {
            decorations.push(Decoration.widget({
                widget: new CustomDecorationWidget(style, value),
                side: 1
            }));
        } else if (typeof style === 'string') {
            const className = utils.createStyleClassName(style);
            if (className) {
                decorations.push(Decoration.mark({
                    class: className
                }));
            }
        }

        // 2. 如果有点击处理器，添加操作按钮
        if (onClick) {
            decorations.push(Decoration.widget({
                widget: new ActionButton(value, onClick, icon),
                side: 1
            }));
        }

        return decorations;
    }

    createUrlDecoration(url: string) {
        if (this.config.urlHandler?.component) {
            return Decoration.widget({
                widget: new CustomDecorationWidget(
                    this.config.urlHandler.component,
                    url,
                    this.config.urlHandler.onClick
                ),
                side: 1
            });
        }
        return Decoration.widget({
            widget: new LinkWidget(url, this.config.urlHandler?.onClick),
            side: 1
        });
    }
}

// 主扩展创建函数
export function createDecorationExtension(config: DecorationConfig = {}): Extension {
    const decorationPlugin = ViewPlugin.fromClass(class implements PluginValue {
        decorations: DecorationSet;
        factory: DecorationFactory;
        clickHandlers: Map<string, (e: MouseEvent) => void>;

        constructor(view: EditorView) {
            this.factory = new DecorationFactory(config);
            this.clickHandlers = new Map();
            this.decorations = this.buildDecorations(view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
                // 清理旧的点击处理器
                this.cleanupClickHandlers(update.view);
                this.decorations = this.buildDecorations(update.view);
            }
        }

        destroy() {
            // 在插件销毁时清理所有点击处理器
            if (this.clickHandlers.size > 0) {
                const editor = document.querySelector('.cm-editor') as HTMLElement;
                if (editor) {
                    const view = EditorView.findFromDOM(editor);
                    if (view) {
                        this.cleanupClickHandlers(view);
                    }
                }
            }
        }

        private cleanupClickHandlers(view: EditorView) {
            this.clickHandlers.forEach((handler, key) => {
                view.dom.removeEventListener('click', handler);
            });
            this.clickHandlers.clear();
        }

        buildDecorations(view: EditorView) {
            const builder = new Array<any>();
            const tree = syntaxTree(view.state);
            let cursor = tree.cursor();

            while (cursor.next()) {
                if (cursor.name === "Property") {
                    this.processProperty(view, cursor, builder);
                }
            }

            return Decoration.set(builder);
        }

        private processProperty(view: EditorView, cursor: any, builder: any[]) {
            const content = view.state.doc.sliceString(cursor.from, cursor.to);
            const extracted = JsonPath.extractPropertyValue(content);
            if (!extracted) return;

            const { key, value } = extracted;
            const keyMatch = content.match(new RegExp(`"${key}"`));
            if (!keyMatch) return;

            const keyStart = cursor.from + keyMatch.index;
            const keyEnd = keyStart + key.length + 2; // +2 for quotes
            const colonMatch = content.slice(keyMatch.index).match(/:\s*/);
            if (!colonMatch) return;

            const valueStart = cursor.from + keyMatch.index + colonMatch.index + colonMatch[0].length;
            const valueEnd = cursor.to;

            // 处理路径装饰
            const path = JsonPath.fromNode(view, cursor.node);
            if (config.paths && path in config.paths) {
                const pathConfig = config.paths[path];
                const cleanValue = JsonPath.getCleanValue(value, cursor.node, view);
                const decorations = this.factory.createPathDecoration(
                    pathConfig.style,
                    cleanValue,
                    pathConfig.onClick
                );

                for (const decoration of decorations) {
                    if ('widget' in decoration.spec) {
                        // Widget (按钮) 总是放在值的末尾
                        builder.push(decoration.range(cursor.to));
                    } else {
                        // 样式装饰根据 target 应用
                        const target = pathConfig.target || 'key';
                        if (target === 'key' || target === 'both') {
                            builder.push(decoration.range(keyStart, keyEnd));
                        }
                        if (target === 'value' || target === 'both') {
                            builder.push(decoration.range(valueStart, valueEnd));
                        }
                    }
                }
            }

            // 处理 URL 装饰
            const urlMatch = value.match(/^"(https?:\/\/[^"]+)"/);
            if (urlMatch && utils.isValidUrl(urlMatch[1])) {
                builder.push(this.factory.createUrlDecoration(urlMatch[1]).range(cursor.to));
            }
        }
    }, {
        decorations: v => v.decorations
    });

    return [
        decorationPlugin,
        EditorView.baseTheme({
            '.cm-json-underline': {
                borderBottom: '1px dashed #0366d6 !important'
            },
            '.cm-json-bold': {
                fontWeight: '600 !important'
            },
            '.cm-json-italic': {
                fontStyle: 'italic !important'
            },
            '&dark .cm-json-underline': {
                borderBottom: '1px dashed #58a6ff !important'
            },
            '.cm-action-button': {
                border: 'none',
                background: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '0 4px',
                fontSize: '14px',
                verticalAlign: 'middle',
                opacity: 0.7,
                transition: 'opacity 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                '&:hover': {
                    opacity: 1
                },
                '& svg': {
                    width: '16px',
                    height: '16px'
                }
            }
        })
    ];
} 