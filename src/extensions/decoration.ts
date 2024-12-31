import { Extension } from '@codemirror/state';
import { EditorView, Decoration, DecorationSet, WidgetType, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';
import { DecorationConfig, DecorationStyle, CustomComponent } from '../core/types';
import { JsonPath } from './path';

// 组件定义
class LinkWidget extends WidgetType {
    constructor(private url: string, private onClick?: (url: string) => void) {
        super();
    }

    toDOM() {
        const button = document.createElement('button');
        button.className = 'cm-link-button';
        button.innerHTML = '🔗';
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

// 工具函数
const utils = {
    createStyleClassName(style: DecorationStyle): string {
        if (typeof style === 'object' && style.type === 'component') {
            return 'cm-custom-decoration';
        }
        const styles = typeof style === 'string' ? style.split(' ') : [style];
        return styles.map(s => typeof s === 'string' ? `cm-json-${s.trim()}` : 'cm-json-custom').join(' ');
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

    createPathDecoration(style: DecorationStyle, value: string, onClick?: (value: string) => void) {
        if (typeof style === 'object' && style.type === 'component') {
            return Decoration.widget({
                widget: new CustomDecorationWidget(style, value, onClick),
                side: 1
            });
        }
        return Decoration.mark({
            class: utils.createStyleClassName(style)
        });
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
    const decorationPlugin = ViewPlugin.fromClass(class {
        decorations: DecorationSet;
        factory: DecorationFactory;

        constructor(view: EditorView) {
            this.factory = new DecorationFactory(config);
            this.decorations = this.buildDecorations(view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
                this.decorations = this.buildDecorations(update.view);
            }
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
            const keyStart = cursor.from + content.indexOf('"' + key + '"');
            const keyEnd = keyStart + key.length + 2;

            // 处理路径装饰
            const path = JsonPath.fromNode(view, cursor.node);
            if (config.paths && path in config.paths) {
                const pathConfig = config.paths[path];
                const cleanValue = JsonPath.getCleanValue(value, cursor.node, view);
                const decoration = this.factory.createPathDecoration(
                    pathConfig.style,
                    cleanValue,
                    pathConfig.onClick
                );

                if (typeof pathConfig.style === 'object' && pathConfig.style.type === 'component') {
                    builder.push(decoration.range(cursor.to));
                } else {
                    builder.push(decoration.range(keyStart, keyEnd));
                    this.addClickHandler(view, keyStart, keyEnd, cleanValue, pathConfig.onClick);
                }
            }

            // 处理 URL 装饰
            const urlMatch = value.match(/^"(https?:\/\/[^"]+)"/);
            if (urlMatch && utils.isValidUrl(urlMatch[1])) {
                builder.push(this.factory.createUrlDecoration(urlMatch[1]).range(cursor.to));
            }
        }

        private addClickHandler(view: EditorView, start: number, end: number, value: string, onClick?: (value: string) => void) {
            if (typeof onClick === 'function') {
                const handler = (e: MouseEvent) => {
                    const pos = view.posAtCoords({ x: e.clientX, y: e.clientY });
                    if (pos !== null && pos >= start && pos <= end) {
                        onClick(value);
                    }
                };
                view.dom.addEventListener('click', handler);
            }
        }
    }, {
        decorations: v => v.decorations,
        provide: plugin => EditorView.atomicRanges.of(view => {
            return view.plugin(plugin)?.decorations || Decoration.none;
        })
    });

    return [
        decorationPlugin,
        EditorView.baseTheme({
            '.cm-json-underline': {
                borderBottom: '1px dashed #40a9ff !important',
                cursor: 'pointer !important'
            },
            '.cm-json-bold': {
                fontWeight: 'bold !important'
            },
            '.cm-json-italic': {
                fontStyle: 'italic !important'
            },
            '&dark .cm-json-underline': {
                borderBottom: '1px dashed #69c0ff !important',
                cursor: 'pointer !important'
            },
            '.cm-link-button': {
                border: 'none',
                background: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '0 4px',
                fontSize: '14px',
                verticalAlign: 'middle',
                opacity: 0.7,
                transition: 'opacity 0.2s',
                '&:hover': {
                    opacity: 1
                }
            }
        })
    ];
} 