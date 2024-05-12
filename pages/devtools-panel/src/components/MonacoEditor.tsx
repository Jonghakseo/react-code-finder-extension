import React, { useEffect, useRef } from 'react';
import { type editor } from 'monaco-editor';
import { DebugSourceWithSourceCode } from '@chrome-extension-boilerplate/shared';
import useKeyDownEffect, { withMeta } from '@src/hooks/useKeyDownEffect';

type MonacoEditorProps = {
  initialValue?: string;
  currentDebugSourceWithSourceCode: DebugSourceWithSourceCode | null;
  saveSourceCode: (fileName: string, sourceCode: string) => Promise<void>;
};

export default function MonacoEditor({
  initialValue,
  currentDebugSourceWithSourceCode,
  saveSourceCode,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoEl = useRef(null);

  useKeyDownEffect(
    withMeta('s'),
    async () => {
      if (!currentDebugSourceWithSourceCode) {
        throw Error('No current debug source');
      }
      const source = editorRef.current?.getValue();
      if (!source) {
        throw Error('Source code is empty');
      }
      await saveSourceCode(currentDebugSourceWithSourceCode.fileName, source);
    },
    [],
  );

  useEffect(() => {
    (async () => {
      const { editor } = await import('monaco-editor');
      editorRef.current = editor.create(monacoEl.current!, {
        value: initialValue,
        language: 'typescript',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: true },
      });
    })();

    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && currentDebugSourceWithSourceCode) {
      editorRef.current.setValue(currentDebugSourceWithSourceCode.sourceCode);
      editorRef.current.setSelection({
        startLineNumber: currentDebugSourceWithSourceCode.lineNumber,
        endLineNumber: currentDebugSourceWithSourceCode.lineNumber,
        startColumn: 0,
        endColumn: 999,
      });
      editorRef.current.revealPositionInCenter({
        lineNumber: currentDebugSourceWithSourceCode.lineNumber,
        column: currentDebugSourceWithSourceCode.columnNumber,
      });
    }
  }, [currentDebugSourceWithSourceCode]);

  return (
    <div
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
      }}
      ref={monacoEl}
    />
  );
}
