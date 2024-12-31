// Core
export { EditorCore } from './core/editor-core';
export type { 
    EditorConfig,
    EditorState,
    ValidationError,
    Selection,
    Operation,
    OperationType,
    ThemeConfig,
    Plugin
} from './core/types';

// Data
export { JSONParser } from './data/json-parser';
export type { ParseResult } from './data/json-parser';
export { SchemaValidator } from './data/schema-validator';
export type { ValidationResult } from './data/schema-validator';

// Version
export const VERSION = '0.1.0'; 