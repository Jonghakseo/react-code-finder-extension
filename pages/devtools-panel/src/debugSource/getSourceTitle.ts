import { DebugSource } from '@chrome-extension-boilerplate/shared';

export default function getSourceTitle(debugSource: DebugSource | null) {
  if (!debugSource) {
    return '';
  }
  const fileName = String(debugSource.fileName.split('/').at(-1));
  const parentFolder = debugSource.fileName.split('/').at(-2);
  const lineNumber = debugSource.lineNumber;
  if (fileName.length < 30) {
    return `${parentFolder ? parentFolder + '/' : ''}${fileName} L:${lineNumber}`;
  }
  return `${fileName} L:${lineNumber}`;
}
