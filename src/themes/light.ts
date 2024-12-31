import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// 定义语法高亮颜色
const chalky = "#e5c07b",
    coral = "#e06c75",
    cyan = "#56b6c2",
    invalid = "#ffffff",
    ivory = "#24292e",
    stone = "#7d8799", // Brightened
    malibu = "#0366d6",
    sage = "#98c379",
    whiskey = "#d19a66",
    violet = "#6f42c1";

// 语法高亮规则
const lightHighlightStyle = HighlightStyle.define([
    // JSON 特定语法
    { tag: t.propertyName, color: malibu, fontWeight: "500" },
    { tag: t.string, color: sage },
    { tag: t.number, color: whiskey },
    { tag: t.bool, color: violet, fontWeight: "500" },
    { tag: t.null, color: violet, fontWeight: "500" },
    { tag: t.keyword, color: coral },
    { tag: t.operator, color: ivory },
    { tag: t.bracket, color: ivory },
    { tag: t.punctuation, color: ivory },
    { tag: t.invalid, color: invalid, backgroundColor: coral },

    // 其他语法
    { tag: t.comment, color: stone, fontStyle: "italic" },
    { tag: t.variableName, color: ivory },
    { tag: t.definition(t.variableName), color: ivory },
    { tag: t.className, color: chalky },
    { tag: t.typeName, color: chalky },
    { tag: t.tagName, color: coral },
    { tag: t.attributeName, color: chalky }
]);

// 编辑器主题
const lightTheme = EditorView.theme({
    "&": {
        backgroundColor: "#ffffff",
        color: ivory
    },
    ".cm-content": {
        caretColor: ivory,
        fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
        fontSize: "14px"
    },
    "&.cm-focused .cm-cursor": {
        borderLeftColor: ivory
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
        backgroundColor: "#0366d625"
    },
    ".cm-activeLine": { 
        backgroundColor: "#f6f8fa" 
    },
    ".cm-selectionMatch": { 
        backgroundColor: "#0366d625" 
    },
    ".cm-matchingBracket, .cm-nonmatchingBracket": {
        backgroundColor: "#34d05840",
        outline: "1px solid #34d05840"
    },
    ".cm-gutters": {
        backgroundColor: "#ffffff",
        color: stone,
        border: "none",
        borderRight: "1px solid #e1e4e8"
    },
    ".cm-activeLineGutter": {
        backgroundColor: "#f6f8fa"
    },
    ".cm-foldPlaceholder": {
        backgroundColor: "transparent",
        border: "none",
        color: "#ddd"
    },
    ".cm-tooltip": {
        border: "1px solid #e1e4e8",
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
        borderTopColor: "#e1e4e8"
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
        borderTopColor: "#ffffff"
    },
    ".cm-tooltip-autocomplete": {
        "& > ul > li[aria-selected]": {
            background: "#0366d625",
            color: ivory
        }
    }
}, { dark: false });

// 导出主题
export const light = [
    lightTheme,
    syntaxHighlighting(lightHighlightStyle)
]; 