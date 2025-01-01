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
    <div className="text-black dark:text-white">
      <button
        onClick={handleDownload}
        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/90 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md transition-colors border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
      >
        🤖 下载 JSON
      </button>
    </div>
  );
}; 