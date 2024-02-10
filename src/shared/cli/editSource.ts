export async function editSource(port: number, filePath: string, sourceCode: string) {
  const url = `http://localhost:${port}`;
  const params = new URLSearchParams();
  params.append('file', filePath);
  params.append('source', sourceCode);
  const debugUrl = `${url}/editSource?${params.toString()}`;
  return await fetch(debugUrl);
}
