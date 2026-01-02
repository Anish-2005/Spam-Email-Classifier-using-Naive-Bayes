import { useState } from 'react'

type PredictResult = { label: string; probability: number } | { predictions: Array<{ text: string; label: string; probability: number }> }

const DEFAULT_API = 'https://spam-email-classifier-using-naive-bayes-1.onrender.com'

export default function Home() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<PredictResult | null>(null)
  const [loading, setLoading] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API

  async function predict() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const j = await res.json()
      setResult(j)
    } catch (e) {
      setResult({ predictions: [{ text, label: 'error', probability: 0 }] } as any)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Spam Classifier</h1>
        <a href="/docs" className="text-sm text-sky-600">API Docs</a>
      </header>

      <section className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-md border-slate-200 shadow-sm focus:ring-sky-500 focus:border-sky-500"
        />

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={predict}
            disabled={loading || text.trim() === ''}
            className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-60"
          >
            {loading ? 'Predicting…' : 'Predict'}
          </button>
          <button
            onClick={() => { setText(''); setResult(null) }}
            className="px-3 py-2 border rounded text-sm"
          >
            Clear
          </button>
        </div>

        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-medium">Result</h3>
            {'label' in result ? (
              <div className="mt-2">
                <div><span className="font-semibold">Label:</span> {result.label}</div>
                <div><span className="font-semibold">Probability:</span> {result.probability.toFixed(4)}</div>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                {Array.isArray((result as any).predictions) && (result as any).predictions.length > 0 ? (
                  (result as any).predictions.map((p: any, i: number) => (
                    <div key={i} className="p-3 border rounded bg-slate-50">
                      <div className="text-sm text-slate-700">{p.text}</div>
                      <div className="text-sm"><strong>{p.label}</strong> — {Number(p.probability).toFixed(4)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">No predictions available.</div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="mt-8 text-xs text-slate-500">
        <div>Backend: <span className="font-mono">{apiUrl}</span></div>
      </footer>
    </main>
  )
}
