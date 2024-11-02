import React, { useEffect, useRef } from 'react';
import { type editor } from 'monaco-editor';
import { DebugSourceWithSourceCode } from '@chrome-extension-boilerplate/shared';

type PropsViewerProps = {
  currentDebugSourceWithSourceCodeProps?: DebugSourceWithSourceCode['props'];
};

export default function PropsViewer({ currentDebugSourceWithSourceCodeProps }: PropsViewerProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoEl = useRef(null);
  const propsString = currentDebugSourceWithSourceCodeProps
    ? 'const props = ' + JSON.stringify(currentDebugSourceWithSourceCodeProps, null, 2)
    : '';

  useEffect(() => {
    (async () => {
      const { editor } = await import('monaco-editor');
      editorRef.current = editor.create(monacoEl.current!, {
        value: propsString,
        language: 'typescript',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: true },
        readOnly: true,
        showFoldingControls: 'always',
      });
    })();

    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && propsString) {
      editorRef.current.setValue(propsString);
      if (propsString.length > 400) {
        editorRef.current.getAction('editor.foldLevel2')?.run();
      }
    }
  }, [propsString]);

  return (
    <div
      style={{
        borderRadius: '12px',
        height: '250px',
        width: '100%',
        overflow: 'hidden',
      }}
      ref={monacoEl}
    />
  );
}
