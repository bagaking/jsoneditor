import React from 'react';
import { EditorCore } from '@bagaking/jsoneditor';

export const DownloadButton: React.FC<{
  editor: EditorCore | null;
}> = ({ editor }) => {
  const handleDownload = () => {
    if (!editor) return;
    
    const content = editor.getValue();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'editor-content.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors"
    >
      下载 JSON
    </button>
  );
}; 