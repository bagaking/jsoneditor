import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { Extension } from '@codemirror/state';

// 定义语法高亮颜色
const darkColors = {
    chalky: "#e5c07b",
    coral: "#e06c75",
    cyan: "#56b6c2",
    invalid: "#ffffff",
    ivory: "#abb2bf",
    stone: "#7d8799",
    malibu: "#61afef",
    sage: "#98c379",
    whiskey: "#d19a66",
    violet: "#c678dd"
};

const lightColors = {
    chalky: "#e5c07b",
    coral: "#e06c75",
    cyan: "#56b6c2",
    invalid: "#ffffff",
    ivory: "#24292e",
    stone: "#7d8799",
    malibu: "#0366d6",
    sage: "#98c379",
    whiskey: "#d19a66",
    violet: "#6f42c1"
};

// 暗色主题高亮规则
const darkHighlightStyle = HighlightStyle.define([
    // JSON 特定语法
    { tag: t.propertyName, color: darkColors.malibu, fontWeight: "500" },
    { tag: t.string, color: darkColors.sage },
    { tag: t.number, color: darkColors.whiskey },
    { tag: t.bool, color: darkColors.violet, fontWeight: "500" },
    { tag: t.null, color: darkColors.violet, fontWeight: "500" },
    { tag: t.keyword, color: darkColors.coral },
    { tag: t.operator, color: darkColors.ivory },
    { tag: t.bracket, color: darkColors.ivory },
    { tag: t.punctuation, color: darkColors.ivory },
    { tag: t.invalid, color: darkColors.invalid, backgroundColor: darkColors.coral },

    // 其他语法
    { tag: t.comment, color: darkColors.stone, fontStyle: "italic" },
    { tag: t.variableName, color: darkColors.ivory },
    { tag: t.definition(t.variableName), color: darkColors.ivory },
    { tag: t.className, color: darkColors.chalky },
    { tag: t.typeName, color: darkColors.chalky },
    { tag: t.tagName, color: darkColors.coral },
    { tag: t.attributeName, color: darkColors.chalky }
]);

// 亮色主题高亮规则
const lightHighlightStyle = HighlightStyle.define([
    // JSON 特定语法
    { tag: t.propertyName, color: lightColors.malibu, fontWeight: "500" },
    { tag: t.string, color: lightColors.sage },
    { tag: t.number, color: lightColors.whiskey },
    { tag: t.bool, color: lightColors.violet, fontWeight: "500" },
    { tag: t.null, color: lightColors.violet, fontWeight: "500" },
    { tag: t.keyword, color: lightColors.coral },
    { tag: t.operator, color: lightColors.ivory },
    { tag: t.bracket, color: lightColors.ivory },
    { tag: t.punctuation, color: lightColors.ivory },
    { tag: t.invalid, color: lightColors.invalid, backgroundColor: lightColors.coral },

    // 其他语法
    { tag: t.comment, color: lightColors.stone, fontStyle: "italic" },
    { tag: t.variableName, color: lightColors.ivory },
    { tag: t.definition(t.variableName), color: lightColors.ivory },
    { tag: t.className, color: lightColors.chalky },
    { tag: t.typeName, color: lightColors.chalky },
    { tag: t.tagName, color: lightColors.coral },
    { tag: t.attributeName, color: lightColors.chalky }
]);

// 暗色主题
const darkTheme = EditorView.theme({
    "&": {
        backgroundColor: "#282c34",
        color: darkColors.ivory
    },
    ".cm-content": {
        caretColor: darkColors.ivory,
        fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
        fontSize: "14px"
    },
    "&.cm-focused .cm-cursor": {
        borderLeftColor: darkColors.ivory
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
        backgroundColor: "#3E4451"
    },
    ".cm-activeLine": { 
        backgroundColor: "#2c313a" 
    },
    ".cm-selectionMatch": { 
        backgroundColor: "#3E4451" 
    },
    ".cm-matchingBracket, .cm-nonmatchingBracket": {
        backgroundColor: "#515a6b",
        outline: "1px solid #515a6b"
    },
    ".cm-gutters": {
        backgroundColor: "#282c34",
        color: darkColors.stone,
        border: "none",
        borderRight: "1px solid #3E4451"
    },
    ".cm-activeLineGutter": {
        backgroundColor: "#2c313a"
    },
    ".cm-foldPlaceholder": {
        backgroundColor: "transparent",
        border: "none",
        color: "#ddd"
    },
    ".cm-tooltip": {
        border: "1px solid #181a1f",
        backgroundColor: "#282c34",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)"
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
        borderTopColor: "#181a1f"
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
        borderTopColor: "#282c34"
    },
    ".cm-tooltip-autocomplete": {
        "& > ul > li[aria-selected]": {
            background: "#2c313a",
            color: darkColors.ivory
        }
    },
    ".cm-json-underline": {
        textDecoration: "underline"
    },
    ".cm-json-bold": {
        fontWeight: "bold"
    },
    ".cm-json-italic": {
        fontStyle: "italic"
    }
}, { dark: true });

// 亮色主题
const lightTheme = EditorView.theme({
    "&": {
        backgroundColor: "#ffffff",
        color: lightColors.ivory
    },
    ".cm-content": {
        caretColor: lightColors.ivory,
        fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
        fontSize: "14px"
    },
    "&.cm-focused .cm-cursor": {
        borderLeftColor: lightColors.ivory
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
        color: lightColors.stone,
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
            color: lightColors.ivory
        }
    },
    ".cm-json-underline": {
        textDecoration: "underline"
    },
    ".cm-json-bold": {
        fontWeight: "bold"
    },
    ".cm-json-italic": {
        fontStyle: "italic"
    }
}, { dark: false });

// 导出主题
export const dark: Extension[] = [
    darkTheme,
    syntaxHighlighting(darkHighlightStyle)
];

export const light: Extension[] = [
    lightTheme,
    syntaxHighlighting(lightHighlightStyle)
]; 