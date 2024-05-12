export async function setMonacoConfig() {
  const { languages } = await import('monaco-editor');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const editorWorker = await import('monaco-editor/esm/vs/editor/editor.worker?worker');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const cssWorker = await import('monaco-editor/esm/vs/language/css/css.worker?worker');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const htmlWorker = await import('monaco-editor/esm/vs/language/html/html.worker?worker');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const tsWorker = await import('monaco-editor/esm/vs/language/typescript/ts.worker?worker');

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  self.MonacoEnvironment = {
    getWorker(_: never, label: string) {
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker();
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker();
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker();
      }
      return new editorWorker();
    },
  };

  languages.typescript.typescriptDefaults.setCompilerOptions({
    target: languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
    module: languages.typescript.ModuleKind.CommonJS,
    lib: ['dom'],
    noEmit: true,
    esModuleInterop: true,
    strict: false,
    jsx: languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ['node_modules/@types'],
  });

  languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true,
    noSuggestionDiagnostics: true,
  });
}
