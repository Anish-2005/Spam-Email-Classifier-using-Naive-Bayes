import { useState } from 'react'

export default function Home() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  async function predict() {
    const res = await fetch(`${apiUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    const j = await res.json()
    setResult(j)
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'Inter, Arial' }}>
      <h1>Spam Classifier</h1>
      <p>Enter a message and click Predict.</p>
      <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} style={{ width: '100%' }} />
      <div style={{ marginTop: 12 }}>
        <button onClick={predict} style={{ padding: '8px 16px' }}>Predict</button>
      </div>
      {result && (
        <div style={{ marginTop: 16 }}>
          <h3>Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
