# @bagaking/jsoneditor

A powerful **JSON editor component** with support for *JSON Schema validation*, *path highlighting*, *theme switching*, and *custom operations*.

📚 [Full Documentation](https://bagaking.github.io/jsoneditor) | [中文](./README.md)

## 🌟 Features

- 🎨 **Theme System**
  - Built-in light and dark themes
  - Customizable theme variables
  - Component-level style customization
  
- 🔍 **Smart Editing**
  - Path highlighting and hints
  - Support for path clicking and custom operations
  - Format and multi-level minification
  
- ✨ **Schema Support**
  - JSON5 syntax support
  - Smart auto-completion based on JSON Schema
  - Real-time validation and error diagnosis based on JSON Schema
  - Visual editing support for special types like enums, dates, colors
    
- 🎯 **Status Bar**
  - Cursor position display
  - Document size statistics
  - Error message display

- 💡 **Developer Friendly**
  - TypeScript support
  - Rich API
  - Flexible extension mechanism

## 🚀 Quick Start

### Installation

```bash
pnpm add @bagaking/jsoneditor
# or
npm install @bagaking/jsoneditor
# or
yarn add @bagaking/jsoneditor
```

### Basic Usage

```tsx
import { JsonEditor } from '@bagaking/jsoneditor';

function App() {
  return (
    <JsonEditor
      defaultValue={'{"hello": "world"}'}
      themeConfig={{ theme: 'light' }}

      onValueChange={setValue}
      onError={setError}

      // Editor settings
      codeSettings={{
        fontSize: 14,
        lineNumbers: true,
        bracketMatching: true
      }}

      // Theme configuration
      themeConfig={{
        theme: 'light'
      }}
    />
  );
}
```

## 🎮 Live Demo

- [CodeSandbox](https://codesandbox.io/s/bagaking-jsoneditor-demo)
- [StackBlitz](https://stackblitz.com/edit/bagaking-jsoneditor-demo)

Or clone the repository and run locally:

```bash
git clone https://github.com/bagaking/jsoneditor.git
cd jsoneditor
pnpm install
pnpm dev
```

## 📖 Advanced Usage

### Schema Validation

This component uses [JSON Schema](https://json-schema.org/) for data validation and auto-completion. It supports the [Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html) specification.

```tsx
import { JsonEditor } from '@bagaking/jsoneditor';

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Project name',
      minLength: 1
    },
    version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+$',
      description: 'Version number (Semver)'
    }
  },
  required: ['name', 'version']
};

function App() {
  return (
    <JsonEditor
      defaultValue={JSON.stringify({
        name: 'my-project',
        version: '1.0.0'
      }, null, 2)}
      schemaConfig={{
        schema,
        validateOnType: true
      }}
    />
  );
}
```

For more details, please refer to the [Schema Validation Guide](https://bagaking.github.io/jsoneditor/guide/schema-validation).

### Path Decoration

Support for adding custom styles and interactions to different JSON paths:

```tsx
import { JsonEditor } from '@bagaking/jsoneditor';

function App() {
  return (
    <JsonEditor
      defaultValue={value}
      decorationConfig={{
        paths: {
          // Special style for version
          '$["version"]': {
            style: "italic bg-blue-100/30 rounded px-1",
            onClick: (value) => console.log('Version:', value)
          },
          // Different color for status
          '$["status"]': {
            style: "text-green-600 font-medium"
          }
        }
      }}
    />
  );
}
```

For more details, please refer to the [Decoration System Documentation](https://bagaking.github.io/jsoneditor/api/decoration).

### Using Ref

```tsx
import { JsonEditor, EditorCore } from '@bagaking/jsoneditor';
import { useRef } from 'react';

function App() {
  const editorRef = useRef<EditorCore>(null);

  const handleFormat = () => {
    const value = editorRef.current?.getValue();
    if (value) {
      editorRef.current?.setValue(
        JSON.stringify(JSON.parse(value), null, 2)
      );
    }
  };

  return (
    <>
      <button onClick={handleFormat}>Format</button>
      <JsonEditor
        ref={editorRef}
        defaultValue={value}
        onValueChange={setValue}
      />
    </>
  );
}
```

## 🤝 Contributing

Contributions are welcome! Feel free to submit [Issues](https://github.com/bagaking/jsoneditor/issues) or [Pull Requests](https://github.com/bagaking/jsoneditor/pulls)!

## 📄 License

[MIT](./LICENSE) 