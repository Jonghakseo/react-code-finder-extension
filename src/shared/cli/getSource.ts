export async function getSource(port: number, filePath: string) {
  const url = `http://localhost:${port}`;
  const params = new URLSearchParams();
  params.append('file', filePath);
  const debugUrl = `${url}/getSource?${params.toString()}`;
  return await fetch(debugUrl);
}
