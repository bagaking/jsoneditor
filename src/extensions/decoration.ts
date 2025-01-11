import { Extension, StateField, StateEffect } from '@codemirror/state';
import { EditorView, Decoration, DecorationSet, WidgetType, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { DecorationConfig, DecorationStyle, CustomComponent } from '../core/types';
import { JsonPath } from '../jsonkit';
import { rocketActionIcon, linkActionIcon } from '../utils/svg';
import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';

// 添加必要的样式
const decorationStyles = EditorView.baseTheme({
    '.cm-action-button': {
        border: 'none',
        background: 'none',
        padding: '0 2px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        color: 'inherit',
        height: '1.2em',
        '&:hover': {
            opacity: 0.8
        }
    }
});

// 链接点击效果
const linkClickEffect = StateEffect.define<{
    url: string;
    onClick?: (url: string) => void;
    openInNewTab: boolean;
}>();

// 链接状态字段
const linkStateField = StateField.define<
    Map<string, {
        url: string;
        onClick?: (url: string) => void;
        openInNewTab: boolean;
    }>
>({
    create() {
        return new Map();
    },
    update(value, tr) {
        if (!tr.changes.empty) {
            // 文档变化时清除所有链接状态
            return new Map();
        }
        for (let effect of tr.effects) {
            if (effect.is(linkClickEffect)) {
                const newValue = new Map(value);
                newValue.set(effect.value.url, effect.value);
                return newValue;
            }
        }
        return value;
    }
});

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

    // @ts-ignore
    toDOM(view: EditorView): HTMLElement {
        const wrapper = document.createElement('span');
        wrapper.className = 'cm-url-widget';
        wrapper.dataset.url = this.url;
        wrapper.dataset.widgetId = this.id;
        wrapper.dataset.hasCustomHandler = this.onClick ? 'true' : 'false';
        wrapper.dataset.openInNewTab = String(this.openInNewTab);
        
        const button = document.createElement('button');
        button.className = 'cm-action-button';
        button.innerHTML = this.svgContent;
        button.title = 'Open URL';
        
        wrapper.appendChild(button);
        return wrapper;
    }

    eq(other: WidgetType): boolean {
        if (!(other instanceof LinkWidget)) return false;
        return this.url === other.url && this.id === other.id;
    }

    ignoreEvent() {
        // 返回 false 让 CodeMirror 处理点击事件
        return false;
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

    // @ts-ignore
    toDOM(view: EditorView): HTMLElement {
        return this.component.render({
            value: this.value,
            onClick: this.onClick
        }) as HTMLElement;
    }

    eq(other: WidgetType): boolean {
        if (!(other instanceof CustomDecorationWidget)) return false;
        return this.value === other.value;
    }
}


// 操作按钮组件
class ActionButton extends WidgetType {
    private svgContent: string | ReactNode;
    private root: ReactDOM.Root | null = null;
    private mounted: boolean = false;
    private container: HTMLElement | null = null;

    constructor(
        private value: string,
        private onClick?: (value: string) => void,
        icon?: string | ReactNode
    ) {
        super();
        this.svgContent = icon || rocketActionIcon || `👆`;
    }

    destroy() {
        this.unmountReactComponent();
    }

    private unmountReactComponent() {
        if (this.root) {
            try {
                this.root.unmount();
            } catch (error) {
                console.error('🔴 [ActionButton] Error unmounting React component:', error);
            }
            this.root = null;
        }
        this.mounted = false;
        this.container = null;
    }

    eq(other: WidgetType): boolean {
        return other instanceof ActionButton && 
               this.value === other.value && 
               this.svgContent === other.svgContent;
    }

    // @ts-ignore
    updateDOM(dom: HTMLElement): boolean {
        // 总是返回 false 以确保重新创建 DOM
        return false;
    }

    // @ts-ignore
    toDOM(view: EditorView): HTMLElement {
        const button = document.createElement('button');
        button.className = 'cm-action-button';
        button.title = 'Click to trigger action';
        button.style.display = 'inline-flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.height = '100%';
        button.style.margin = '0 2px';
        button.style.minWidth = '1.2em';
        button.style.minHeight = '1.2em';

        button.onclick = (e) => {
            e.stopPropagation();
            if (this.onClick) {
                this.onClick(this.value);
            }
        };

        // Handle string content
        if (typeof this.svgContent === 'string') {
            button.innerHTML = this.svgContent;
            return button;
        }

        // Handle React content
        if (React.isValidElement(this.svgContent)) {
            this.container = button;

            // 使用 requestAnimationFrame 确保 DOM 已挂载
            requestAnimationFrame(() => {
                if (document.contains(this.container) && !this.mounted) {
                    try {
                        this.root = ReactDOM.createRoot(this.container!);
                        
                        const IconContainer = React.memo(() => (
                            React.createElement('div', {
                                style: {
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '100%',
                                    lineHeight: '1'
                                }
                            }, this.svgContent)
                        ));
                        
                        this.root.render(React.createElement(IconContainer));
                        this.mounted = true;
                    } catch (error) {
                        console.error('🔴 [ActionButton] Failed to render React component:', error);
                        // 回退到默认图标
                        if (this.container) {
                            this.container.innerHTML = '👆';
                        }
                    }
                }
            });

            return button;
        }

        button.innerHTML = '👆'; // 默认图标
        return button;
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
        private readonly config: DecorationConfig
    ) {}

    getConfig(): DecorationConfig {
        return this.config;
    }

    createPathDecoration(style: DecorationStyle, value: string, onClick?: (value: string) => void, icon?: string | ReactNode) {
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

        // 2. 如果有点击处理器或图标，添加操作按钮
        if (icon || onClick) {
            decorations.push(Decoration.widget({
                widget: new ActionButton(value, onClick || (() => {}), icon),
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
                'editor',  // 不再需要特定的 editorId
                url, 
                this.config.urlHandler?.onClick,
                this.config.urlHandler?.openInNewTab ?? true
            ),
            side: 1
        });
    }
}

// 装饰器类型定义
type DecorationRange = {
    range: [number, number];
    decoration: Decoration;
    source: 'path' | 'matcher' | 'url';  // 标记装饰器来源
    priority: number;  // 优先级，用于排序
};

// 主扩展创建函数
export function createDecorationExtension(config: DecorationConfig = {}): Extension {
    return [
        decorationStyles,
        linkStateField,
        ViewPlugin.fromClass(
            class {
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
                    const builder = new Array<DecorationRange>();
                    const tree = syntaxTree(view.state);
                    let cursor = tree.cursor();

                    while (cursor.next()) {
                        if (cursor.name === "Property") {
                            this.processProperty(view, cursor, builder);
                        }
                    }

                    const sortedDecorations = builder
                        .sort((a, b) => a.range[0] - b.range[0])
                        .map(({ range, decoration }) => decoration.range(range[0], range[1]));

                    return Decoration.set(sortedDecorations);
                }

                private processProperty(view: EditorView, cursor: any, builder: DecorationRange[]) {
                    // 获取路径
                    const path = JsonPath.fromNode(view, cursor.node);
                    
                    // 提取属性值
                    const content = view.state.doc.sliceString(cursor.from, cursor.to);
                    const extracted = JsonPath.extractPropertyValue(content);

                    if (!extracted) {
                        return;
                    }

                    const { key, value } = extracted;

                    // 找到键的位置
                    const keyMatch = content.match(new RegExp(`"${key}"`));
                    if (!keyMatch) {
                        return;
                    }
                    const keyStart = cursor.from + keyMatch.index;
                    const keyEnd = keyStart + key.length + 2; // +2 for quotes

                    // 找到值的位置
                    const colonMatch = content.slice(keyMatch.index).match(/:\s*/);
                    if (!colonMatch) {
                        return;
                    }
                    const valueStart = keyStart + colonMatch.index + colonMatch[0].length;
                    const valueEnd = cursor.to;
                    const cleanValue = JsonPath.getCleanValue(value, cursor.node, view);

                    // 处理 path 配置的装饰
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
                                builder.push({
                                    range: [valueEnd, valueEnd],
                                    decoration,
                                    source: 'path',
                                    priority: 100
                                });
                            } else {
                                const target = pathConfig.target || 'key';
                                const range: [number, number] = target === 'key' ? [keyStart, keyEnd] :
                                            target === 'both' ? [keyStart, valueEnd] :
                                            [valueStart, valueEnd];
                                builder.push({
                                    range,
                                    decoration,
                                    source: 'path',
                                    priority: 100
                                });
                            }
                        }
                    }

                    // 处理 matchers 配置的装饰
                    if (config.matchers?.length) {
                        for (const { matcher, decoration } of config.matchers) {
                            if (matcher(key, cleanValue)) {
                                const matcherDecorations = this.factory.createPathDecoration(
                                    decoration.style,
                                    cleanValue,
                                    decoration.onClick,
                                    decoration.icon
                                );

                                for (const decorationItem of matcherDecorations) {
                                    if ('widget' in decorationItem.spec) {
                                        builder.push({
                                            range: [valueEnd, valueEnd],
                                            decoration: decorationItem,
                                            source: 'matcher',
                                            priority: 50
                                        });
                                    } else {
                                        const target = decoration.target || 'key';
                                        const range: [number, number] = target === 'key' ? [keyStart, keyEnd] :
                                                    target === 'both' ? [keyStart, valueEnd] :
                                                    [valueStart, valueEnd];
                                        builder.push({
                                            range,
                                            decoration: decorationItem,
                                            source: 'matcher',
                                            priority: 50
                                        });
                                    }
                                }
                            }
                        }
                    }

                    // 处理 URL 装饰
                    if (utils.isValidUrl(cleanValue)) {
                        const urlDecoration = this.factory.createUrlDecoration(cleanValue);
                        builder.push({
                            range: [valueEnd, valueEnd],
                            decoration: urlDecoration,
                            source: 'url',
                            priority: 0
                        });
                    }
                }
            },
            {
                decorations: v => v.decorations
            }
        )
    ];
}
