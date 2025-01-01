import { Extension } from '@codemirror/state';
import { EditorView, Decoration, DecorationSet, WidgetType, ViewPlugin, ViewUpdate, PluginValue } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { DecorationConfig, DecorationStyle, CustomComponent } from '../core/types';
import { JsonPath } from '../jsonkit';
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
            // 只阻止冒泡，不阻止默认行为
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
            widget: new LinkWidget(url, this.config.urlHandler?.onClick),
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

            constructor(view: EditorView) {
                this.factory = new DecorationFactory(config);
                this.clickHandlers = new Map();
                this.decorations = this.buildDecorations(view);
            }

            update(update: ViewUpdate) {
                if (update.docChanged || update.viewportChanged) {
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
                    builder.push(this.factory.createUrlDecoration(cleanValue).range(valueEnd));
                }

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