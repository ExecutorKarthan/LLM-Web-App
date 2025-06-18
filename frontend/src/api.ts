const API_URL = import.meta.env.VITE_API_URL;

async function callLLMApi(query: string) {
  const response = await fetch(`${API_URL}/llm-endpoint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error('API error');
  return response.json();
}


export default callLLMApi;