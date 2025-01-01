import { Extension } from '@codemirror/state';
import { EditorView, Decoration, DecorationSet, WidgetType, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { DecorationConfig, DecorationStyle, CustomComponent } from '../core/types';
import { JsonPath } from '../jsonkit';
import { rocketActionIcon, linkActionIcon } from '../utils/svg';

// 组件定义
class LinkWidget extends WidgetType {
    private svgContent: string;
    private id: string;

    constructor(
        private editorId: string,
        private url: string, 
        private onClick?: (url: string) => void,
        private openInNewTab: boolean = true
    ) {
        super();
        this.svgContent = linkActionIcon;
        this.id = `${this.editorId}-link-${Math.random().toString(36).slice(2, 8)}`;
    }

    toDOM() {
        const wrapper = document.createElement('span');
        wrapper.className = 'cm-url-widget';
        wrapper.dataset.url = this.url;
        wrapper.dataset.widgetId = this.id;
        wrapper.dataset.editorId = this.editorId;
        
        const button = document.createElement('button');
        button.className = 'cm-action-button';
        button.innerHTML = this.svgContent;
        button.title = 'Open URL';
        
        wrapper.appendChild(button);
        return wrapper;
    }

    eq(other: LinkWidget) {
        return this.url === other.url && this.id === other.id;
    }

    getHandler() {
        return {
            id: this.id,
            editorId: this.editorId,
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
    constructor(
        private readonly config: DecorationConfig,
        private readonly editorId: string
    ) {}

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
                this.editorId,
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
            editorId: string;

            constructor(view: EditorView) {
                this.editorId = `editor-${Math.random().toString(36).slice(2, 8)}`;
                this.factory = new DecorationFactory(config, this.editorId);
                this.clickHandlers = new Map();
                this.linkHandlers = new Map();
                this.decorations = this.buildDecorations(view);
                
                // 使用事件委托处理所有链接点击
                const handler = (e: MouseEvent) => {
                    const target = e.target as HTMLElement;
                    const widget = target.closest('.cm-url-widget') as HTMLElement;
                    if (!widget) return;

                    // 检查是否属于当前编辑器实例
                    if (widget.dataset.editorId !== this.editorId) return;

                    e.preventDefault();
                    e.stopPropagation();

                    const widgetId = widget.dataset.widgetId;
                    if (!widgetId) return;

                    const handler = this.linkHandlers.get(widgetId);
                    if (!handler) return;

                    if (handler.onClick) {
                        // 使用 requestAnimationFrame 来确保在下一帧执行,
                        // 这样可以让 React 有机会更新上下文
                        requestAnimationFrame(() => {
                            if (handler.onClick) {
                                try {
                                    handler.onClick(handler.url);
                                } catch (error) {
                                    console.error('Error in URL click handler:', error);
                                }
                            }
                        });
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

                // 收集所有装饰器
                const decorations: { range: [number, number]; decoration: Decoration }[] = [];

                // 1. 处理 path 配置的装饰
                const config = this.factory.getConfig();
                if (path && config.paths && path in config.paths) {
                    const pathConfig = config.paths[path];
                    const pathDecorations = this.factory.createPathDecoration(
                        pathConfig.style,
                        cleanValue,
                        pathConfig.onClick,
                        pathConfig.icon
                    );

                    for (const decoration of pathDecorations) {
                        if ('widget' in decoration.spec) {
                            // Widget (按钮) 总是放在值的末尾
                            decorations.push({ range: [valueEnd, valueEnd], decoration });
                        } else {
                            // 样式装饰根据 target 应用
                            const target = pathConfig.target || 'key';
                            switch (target) {
                                case 'key':
                                    decorations.push({ range: [keyStart, keyEnd], decoration });
                                    break;
                                case 'both':
                                    decorations.push({ range: [keyStart, valueEnd], decoration }); 
                                    break;
                                case 'value':
                                default:
                                    decorations.push({ range: [valueStart, valueEnd], decoration });
                                    break;
                            }                        
                        }
                    }
                }

                // 2. 处理 URL 装饰
                if (utils.isValidUrl(cleanValue)) {
                    const urlDecoration = this.factory.createUrlDecoration(cleanValue);
                    if (urlDecoration.spec.widget instanceof LinkWidget) {
                        const handler = urlDecoration.spec.widget.getHandler();
                        this.linkHandlers.set(handler.id, handler);
                    }
                    decorations.push({ range: [valueEnd, valueEnd], decoration: urlDecoration });
                }

                // 按照 from 位置排序并添加到 builder
                decorations
                    .sort((a, b) => a.range[0] - b.range[0])
                    .forEach(({ range, decoration }) => {
                        builder.push(decoration.range(range[0], range[1]));
                    });
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