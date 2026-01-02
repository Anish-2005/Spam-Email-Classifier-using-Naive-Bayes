import { useState } from 'react'
import Header from '../components/Header'
import { ResultCard } from '../components/ResultCard'
import { Sparkles, Zap, RefreshCcw, BookOpen } from 'lucide-react'

type PredictResult =
  | { label: string; probability: number }
  | { predictions: Array<{ text: string; label: string; probability: number }> }

export default function Home() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<PredictResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function predict() {
    setLoading(true)
    setResult(null)
    try {
      // Use same-origin Next.js API route so the app can run without a Python backend
      const endpoint = '/api/predict'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const j = await res.json()
      setResult(j)
    } catch {
      setResult({ predictions: [{ text, label: 'error', probability: 0 }] } as any)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-sky-500/20 blur-[120px]" />
      </div>

      <Header />

      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Panel */}
          <section className="lg:col-span-2 glass rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-sky-500" size={20} />
              <h1 className="text-xl font-semibold">
                AI Message Classification
              </h1>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Paste an email or SMS to instantly detect spam or malicious intent using a trained ML model.
            </p>

            <label className="text-sm font-medium mb-2 block">
              Message Content
            </label>

            <textarea
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your email or SMS here…"
              className="w-full rounded-xl glass p-4 focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[180px]"
            />

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button
                onClick={predict}
                disabled={loading || text.trim() === ''}
                className="ai-gradient text-white rounded-xl px-5 py-2.5 font-medium flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
              >
                <Zap size={16} />
                {loading ? 'Analyzing…' : 'Run Prediction'}
              </button>

              <button
                onClick={() => {
                  setText('')
                  setResult(null)
                }}
                className="rounded-xl px-4 py-2 border dark:border-white/10 flex items-center gap-2"
              >
                <RefreshCcw size={16} />
                Reset
              </button>

              <a
                href="/docs"
                className="sm:ml-auto flex items-center gap-1 text-sm text-sky-600 hover:underline"
              >
                <BookOpen size={14} /> API Docs
              </a>
            </div>

            {/* Result */}
            {result && (
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-3">Prediction Result</h3>

                {'label' in result ? (
                  <ResultCard
                    label={result.label}
                    probability={result.probability}
                    text={text}
                  />
                ) : (
                  <div className="space-y-3">
                    {Array.isArray((result as any).predictions) && (result as any).predictions.length > 0 ? (
                      (result as any).predictions.map((p: any, i: number) => (
                        <ResultCard
                          key={i}
                          label={p.label}
                          probability={Number(p.probability)}
                          text={p.text}
                        />
                      ))
                    ) : (
                      <div className="text-sm text-slate-500">No predictions available.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Side Insights */}
          <aside className="space-y-6">
            <div className="glass rounded-2xl p-5">
              <h4 className="font-semibold mb-2">Model Overview</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Naive Bayes classifier using TF-IDF vectorization trained on
                curated email and SMS datasets.
              </p>
            </div>

            <div className="glass rounded-2xl p-5">
              <h4 className="font-semibold mb-2">Best Practices</h4>
              <ul className="text-sm list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                <li>Avoid signatures & footers</li>
                <li>Use original content</li>
                <li>Batch predict for datasets</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
