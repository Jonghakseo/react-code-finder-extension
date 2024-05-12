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
