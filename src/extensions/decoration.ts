import { Extension } from '@codemirror/state';
import { EditorView, Decoration, DecorationSet, WidgetType, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { DecorationConfig, DecorationStyle, CustomComponent } from '../core/types';
import { JsonPath } from '../jsonkit';
import { rocketActionIcon, linkActionIcon } from '../utils/svg';

// 组件定义
class LinkWidget extends WidgetType {
    private svgContent: string;
    private static counter = 0;
    private id: string;

    constructor(
        private url: string, 
        private onClick?: (url: string) => void,
        private openInNewTab: boolean = true
    ) {
        super();
        this.svgContent = linkActionIcon;
        this.id = `link-widget-${LinkWidget.counter++}`;
    }

    toDOM() {
        const wrapper = document.createElement('span');
        wrapper.className = 'cm-url-widget';
        wrapper.dataset.url = this.url;
        wrapper.dataset.widgetId = this.id;
        
        const button = document.createElement('button');
        button.className = 'cm-action-button';
        button.innerHTML = this.svgContent;
        button.title = 'Open URL';
        
        // 不再直接绑定 onclick
        wrapper.appendChild(button);
        return wrapper;
    }

    eq(other: LinkWidget) {
        return this.url === other.url && this.id === other.id;
    }

    // 新增：获取处理函数
    getHandler() {
        return {
            id: this.id,
            onClick: this.onClick,
            openInNewTab: this.openInNewTab,
            url: this.url
        };
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
            // 只阻止冒泡，不阻止默认行为
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
    constructor(private readonly config: DecorationConfig) {}

    getConfig(): DecorationConfig {
        return this.config;
    }

    createPathDecoration(style: DecorationStyle, value: string, onClick?: (value: string) => void, icon?: string) {
        const decorations: Decoration[] = [];

        // 1. 处理样式装饰
        if (typeof style === 'object' && style.type === 'component') {
            decorations.push(Decoration.widget({
                widget: new CustomDecorationWidget(style, value),
                side: 1
            }));
        } else if (typeof style === 'string') {
            // 分离基础样式和 Tailwind 类名
            const styles = style.split(' ');
            const baseStyles = styles
                .filter(s => ['underline', 'bold', 'italic'].includes(s))
                .map(s => `cm-json-${s}`);
            const tailwindClasses = styles
                .filter(s => !['underline', 'bold', 'italic'].includes(s));
            
            const className = [...baseStyles, ...tailwindClasses].join(' ');
            decorations.push(Decoration.mark({
                class: className
            }));
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
            widget: new LinkWidget(
                url, 
                this.config.urlHandler?.onClick,
                this.config.urlHandler?.openInNewTab ?? true
            ),
            side: 1
        });
    }
}

// 主扩展创建函数
export function createDecorationExtension(config: DecorationConfig = {}): Extension {
    return ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;
            factory: DecorationFactory;
            clickHandlers: Map<string, (e: MouseEvent) => void>;
            linkHandlers: Map<string, ReturnType<LinkWidget['getHandler']>>;

            constructor(view: EditorView) {
                this.factory = new DecorationFactory(config);
                this.clickHandlers = new Map();
                this.linkHandlers = new Map();
                this.decorations = this.buildDecorations(view);
                
                // 使用事件委托处理所有链接点击
                const handler = (e: MouseEvent) => {
                    const target = e.target as HTMLElement;
                    const widget = target.closest('.cm-url-widget') as HTMLElement;
                    if (!widget) return;

                    e.preventDefault();
                    e.stopPropagation();

                    const widgetId = widget.dataset.widgetId;
                    if (!widgetId) return;

                    const handler = this.linkHandlers.get(widgetId);
                    if (!handler) return;

                    if (handler.onClick) {
                        // 使用 setTimeout 来确保在正确的上下文中执行
                        setTimeout(() => handler.onClick?.(handler.url), 0);
                    } else if (handler.openInNewTab) {
                        const link = document.createElement('a');
                        link.href = handler.url;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.click();
                    }
                };

                view.dom.addEventListener('click', handler);
                this.clickHandlers.set('link-delegate', handler);
            }

            update(update: ViewUpdate) {
                if (update.docChanged || update.viewportChanged) {
                    this.cleanupClickHandlers(update.view);
                    this.linkHandlers.clear();
                    this.decorations = this.buildDecorations(update.view);
                }
            }

            destroy() {
                if (this.clickHandlers.size > 0) {
                    const editor = document.querySelector('.cm-editor') as HTMLElement;
                    if (editor) {
                        const view = EditorView.findFromDOM(editor);
                        if (view) {
                            this.cleanupClickHandlers(view);
                        }
                    }
                }
                this.linkHandlers.clear();
            }

            private cleanupClickHandlers(view: EditorView) {
                this.clickHandlers.forEach((handler) => {
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
                // 先获取路径
                const path = JsonPath.fromNode(view, cursor.node);
                
                // 再提取属性值
                const content = view.state.doc.sliceString(cursor.from, cursor.to);
                const extracted = JsonPath.extractPropertyValue(content);

                if (!extracted) return;

                const { key, value } = extracted;
                
                // 找到键的位置
                const keyMatch = content.match(new RegExp(`"${key}"`));
                if (!keyMatch) return;
                const keyStart = cursor.from + keyMatch.index;
                const keyEnd = keyStart + key.length + 2; // +2 for quotes

                // 找到值的位置
                const colonMatch = content.slice(keyMatch.index).match(/:\s*/);
                if (!colonMatch) return;
                const valueStart = keyStart + colonMatch.index + colonMatch[0].length;
                const valueEnd = cursor.to;
                const cleanValue = JsonPath.getCleanValue(value, cursor.node, view);

                // 处理 URL 装饰
                if (utils.isValidUrl(cleanValue)) {
                    const decoration = this.factory.createUrlDecoration(cleanValue);
                    if (decoration.spec.widget instanceof LinkWidget) {
                        const handler = decoration.spec.widget.getHandler();
                        this.linkHandlers.set(handler.id, handler);
                    }
                    builder.push(decoration.range(valueEnd));
                }

                // 处理 path 配置的装饰
                const config = this.factory.getConfig();
                if (path && config.paths && path in config.paths) {
                    const pathConfig = config.paths[path];
                    const decorations = this.factory.createPathDecoration(
                        pathConfig.style,
                        cleanValue,
                        pathConfig.onClick,
                        pathConfig.icon
                    );

                    for (const decoration of decorations) {
                        if ('widget' in decoration.spec) {
                            // Widget (按钮) 总是放在值的末尾
                            builder.push(decoration.range(valueEnd));
                        } else {
                            // 样式装饰根据 target 应用
                            const target = pathConfig.target || 'key';
                            switch (target) {
                                case 'key':
                                    builder.push(decoration.range(keyStart, keyEnd));
                                    break;
                                case 'both':
                                    builder.push(decoration.range(keyStart, valueEnd)); 
                                    break;
                                case 'value':
                                default:
                                    builder.push(decoration.range(valueStart, valueEnd));
                                    break;
                            }                        
                        }
                    }
                }
            }
        },
        {
            /**
             * 【关键配置】装饰器系统与 CodeMirror 的桥接点
             * 
             * 这个配置告诉 CodeMirror 如何从插件实例中获取装饰器集合：
             * 1. v 是插件实例
             * 2. v.decorations 返回 DecorationSet
             * 3. CodeMirror 使用返回的集合来渲染装饰器
             * 
             * 这个配置是必需的，没有它：
             * - 装饰器虽然会被创建
             * - 但不会被应用到编辑器中
             * - DOM 不会显示任何装饰效果
             * 
             * @param v - 插件实例
             * @returns DecorationSet - 当前的装饰器集合
             */
            decorations: v => v.decorations
        }
    );
} 