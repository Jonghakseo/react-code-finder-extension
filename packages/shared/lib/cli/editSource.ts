export async function editSource(port: number, filePath: string, sourceCode: string) {
  const url = `http://localhost:${port}`;
  const params = new URLSearchParams();
  params.append('file', filePath);
  const debugUrl = `${url}/editSource?${params.toString()}`;
  const body = JSON.stringify({ source: sourceCode });
  return fetch(debugUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });
}
