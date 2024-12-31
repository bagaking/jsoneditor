import { Extension, StateField, StateEffect } from '@codemirror/state';
import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import type { SyntaxNode } from '@lezer/common';

/**
 * 路径提示配置
 */
export interface PathExtensionConfig {
    showInGutter?: boolean;
    showInTooltip?: boolean;
    highlightPath?: boolean;
}

/**
 * 路径更新效果
 */
const updatePath = StateEffect.define<string[]>();

/**
 * 路径状态字段
 */
const pathField = StateField.define<string[]>({
    create() {
        return [];
    },
    update(value, tr) {
        for (const effect of tr.effects) {
            if (effect.is(updatePath)) {
                return effect.value;
            }
        }
        return value;
    }
});

/**
 * 创建路径提示扩展
 */
export function createPathExtension(config: PathExtensionConfig = {}): Extension {
    // 创建装饰
    const pathMark = Decoration.mark({ class: 'cm-json-path' });
    const pathGutter = Decoration.line({ class: 'cm-json-path-gutter' });

    // 创建视图插件
    const pathPlugin = ViewPlugin.fromClass(class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = this.buildDecorations(view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
                this.decorations = this.buildDecorations(update.view);
            }
        }

        buildDecorations(view: EditorView) {
            const builder = new Array<any>();
            const path = view.state.field(pathField);

            if (config.highlightPath && path.length > 0) {
                // 遍历语法树查找匹配的节点
                syntaxTree(view.state).iterate({
                    enter(node) {
                        if (node.name === 'PropertyName') {
                            const text = view.state.doc.sliceString(node.from, node.to);
                            const key = text.replace(/['"]/g, '');
                            if (path.includes(key)) {
                                builder.push(pathMark.range(node.from, node.to));
                                if (config.showInGutter) {
                                    const line = view.state.doc.lineAt(node.from);
                                    builder.push(pathGutter.range(line.from));
                                }
                            }
                        }
                    }
                });
            }

            return Decoration.set(builder);
        }
    }, {
        decorations: v => v.decorations,
        eventHandlers: {
            mouseover(event: MouseEvent, view: EditorView) {
                if (!config.showInTooltip) return;

                const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
                if (pos === null) return;

                const node = syntaxTree(view.state).resolveInner(pos);
                if (node.name === 'PropertyName') {
                    const path = getPropertyPath(view, node.from);
                    if (path) {
                        view.dispatch({
                            effects: updatePath.of(path)
                        });
                    }
                }
            }
        }
    });

    return [
        pathField,
        pathPlugin,
        EditorView.baseTheme({
            '.cm-json-path': {
                backgroundColor: '#e6f7ff',
                borderRadius: '2px'
            },
            '.cm-json-path-gutter': {
                color: '#1890ff'
            }
        })
    ];
}

/**
 * 获取属性路径
 */
function getPropertyPath(view: EditorView, pos: number): string[] | null {
    const path: string[] = [];
    let currentNode: SyntaxNode | null = syntaxTree(view.state).resolveInner(pos);

    while (currentNode) {
        if (currentNode.name === 'PropertyName') {
            const text = view.state.doc.sliceString(currentNode.from, currentNode.to);
            path.unshift(text.replace(/['"]/g, ''));
        }
        currentNode = currentNode.parent;
    }

    return path.length > 0 ? path : null;
} 