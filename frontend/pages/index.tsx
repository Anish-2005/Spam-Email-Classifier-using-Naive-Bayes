import React, { useState, useRef, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import { HeroSection } from '../components/HeroSection'
import { ClassifierPanel } from '../components/ClassifierPanel'
import { Sidebar } from '../components/Sidebar'
import { Footer } from '../components/Footer'
import { Toast } from '../components/Toast'

type PredictResult =
  | { label: string; probability: number }
  | { predictions: Array<{ text: string; label: string; probability: number }> }

type HistoryItem = { text: string; result: any; timestamp: Date }

export default function Home() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<PredictResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showInsights, setShowInsights] = useState(true)
  const [activeTab, setActiveTab] = useState<'analyze' | 'batch' | 'history'>('analyze')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [analyzeCount, setAnalyzeCount] = useState(0)
  const resultRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  /* ─── Persistence ─── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('spamguard-history')
      if (saved) {
        const parsed = JSON.parse(saved)
        setHistory(parsed.map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) })))
      }
      const count = localStorage.getItem('spamguard-analyze-count')
      if (count) setAnalyzeCount(parseInt(count, 10) || 0)
    } catch { }
  }, [])

  useEffect(() => {
    try { localStorage.setItem('spamguard-history', JSON.stringify(history.slice(0, 50))) } catch { }
  }, [history])

  useEffect(() => {
    try { localStorage.setItem('spamguard-analyze-count', String(analyzeCount)) } catch { }
  }, [analyzeCount])

  /* ─── Global keyboard shortcuts ─── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        textareaRef.current?.focus()
        setActiveTab('analyze')
      }
      if (e.key === 'Escape' && document.activeElement === textareaRef.current) {
        textareaRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  /* ─── Auto-resize textarea ─── */
  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${Math.max(168, Math.min(ta.scrollHeight, 400))}px`
    }
  }, [text])

  /* ─── Predict ─── */
  const predict = useCallback(async () => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    const startTime = performance.now()
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.detail || data.error)
      setResult(data)
      setAnalyzeCount(c => c + 1)

      const elapsed = Math.round(performance.now() - startTime)
      const isSpam = 'label' in data && data.label.toLowerCase() === 'spam'
      setToast({
        message: `${isSpam ? '⚠️ Spam detected' : '✅ Message is safe'} (${elapsed}ms)`,
        type: isSpam ? 'error' : 'success',
      })

      setHistory(prev => [{
        text: text.length > 120 ? text.substring(0, 120) + '…' : text,
        result: data,
        timestamp: new Date()
      }, ...prev.slice(0, 49)])
    } catch (err: any) {
      setError(err.message || 'Classification failed. Please try again.')
      setToast({ message: 'Classification failed', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [text])

  /* ─── Scroll to result ─── */
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [result])

  const clearAll = useCallback(() => {
    setText('')
    setResult(null)
    setError(null)
    textareaRef.current?.focus()
  }, [])

  return (
    <>
      <Head>
        <title>SpamGuard — AI-Powered Spam Detection</title>
        <meta name="description" content="Classify emails and SMS messages as spam or legitimate using advanced Naive Bayes machine learning. Real-time analysis with 98.7% accuracy." />
        <meta name="keywords" content="spam detection, email classifier, naive bayes, machine learning, NLP, TF-IDF" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex-1 w-full">
          <HeroSection analyzeCount={analyzeCount} />

          <div id="classifier" className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <ClassifierPanel
              text={text}
              setText={setText}
              result={result}
              setResult={setResult}
              loading={loading}
              error={error}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              history={history}
              setHistory={setHistory}
              onPredict={predict}
              onClearAll={clearAll}
              onToast={setToast}
              resultRef={resultRef}
              textareaRef={textareaRef}
            />
            <Sidebar
              showInsights={showInsights}
              onToggle={() => setShowInsights(s => !s)}
            />
          </div>
        </div>

        <Footer />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}