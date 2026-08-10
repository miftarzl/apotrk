export async function sendToChatbot(message: string) {
  const url = (process.env.NEXT_PUBLIC_API_URL || '') + '/chatbot'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  })
  return res.json()
}
