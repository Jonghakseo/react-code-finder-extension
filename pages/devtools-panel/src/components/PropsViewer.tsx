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
    ? JSON.stringify(currentDebugSourceWithSourceCodeProps, null, 2)
    : '';

  useEffect(() => {
    (async () => {
      const { editor } = await import('monaco-editor');
      editorRef.current = editor.create(monacoEl.current!, {
        value: propsString,
        language: 'typescript',
        theme: 'vs-dark',
        automaticLayout: false,
        minimap: { enabled: true },
        readOnly: true,
      });
    })();

    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && propsString) {
      editorRef.current.setValue(propsString);
    }
  }, [propsString]);

  return (
    <div
      style={{
        borderRadius: '12px',
        height: '300px',
        overflow: 'hidden',
      }}
      ref={monacoEl}
    />
  );
}
