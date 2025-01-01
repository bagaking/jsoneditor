import React from 'react';
import { EditorCore } from '@bagaking/jsoneditor';

interface DownloadButtonProps {
  editor: EditorCore | null;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ editor }) => {
  const handleDownload = () => {
    if (!editor) return;
    const content = editor.getValue();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/90 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md transition-colors border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
      onClick={handleDownload}
    >
      📥 Download
    </button>
  );
}; 