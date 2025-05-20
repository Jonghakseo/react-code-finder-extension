import { injectionConfigStorage } from '../storages';
import { DebugSource } from '../types';

export async function openIDE(port: number, debugSource: DebugSource) {
  const url = `http://localhost:${port}`;
  const params = new URLSearchParams();
  params.append('file', debugSource.fileName);
  params.append('lineNumber', String(debugSource.lineNumber));
  params.append('column', String(debugSource.columnNumber));
  const debugUrl = `${url}/openEditor?${params.toString()}`;
  await fetch(debugUrl);
}

export const getSourcePath = (debugSource: DebugSource) => {
  const config = injectionConfigStorage.getSnapshot();
  const ide = config?.preferredIDE ?? 'vscode';
  const { fileName, lineNumber, columnNumber } = debugSource;
  const projectPath = fileName.split('/').slice(0, -1).join('/');
  const filePath = fileName.split('/').slice(-1)[0];
  const line = lineNumber;
  const column = columnNumber;
  switch (ide) {
    case 'vscode':
    case 'vscode-insiders':
    case 'windsurf':
    case 'cursor':
      return `${ide}://file/${projectPath}/${filePath}:${line}:${column}`;
    case 'webstorm':
      return `webstorm://open?file=${projectPath}/${filePath}&line=${line}&column=${column}`;
  }
};
