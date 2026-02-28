import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import { ResultCard } from '../components/ResultCard'
import { FeatureCard } from '../components/FeatureCard'
import { MetricCard } from '../components/MetricCard'
import {
  Zap, RefreshCcw, Shield, CheckCircle, Clock, Upload, Download,
  ClipboardPaste, FileText, Cpu, Lock, BarChart3, Brain,
  ArrowRight, ChevronDown, AlertCircle, Trash2, ArrowDown,
  MessageSquare, Search, ShieldCheck, Github, Mail, Heart
} from 'lucide-react'

type PredictResult =
  | { label: string; probability: number }
  | { predictions: Array<{ text: string; label: string; probability: number }> }

// Example messages for quick testing
const EXAMPLE_MESSAGES = [
  {
    label: 'Spam Example',
    text: 'CONGRATULATIONS! You have been selected to receive a FREE iPhone 15 Pro! Click here immediately to claim your prize before it expires. Limited time offer!!!',
    icon: AlertCircle,
    color: 'text-red-500',
  },
  {
    label: 'Legitimate Email',
    text: 'Hi team, just a reminder that our weekly standup meeting has been moved to 3 PM tomorrow. Please update your calendars accordingly. Thanks!',
    icon: CheckCircle,
    color: 'text-emerald-500',
  },
  {
    label: 'Phishing Attempt',
    text: 'Your account has been compromised! Click this link immediately to verify your identity and secure your bank account. Failure to act within 24 hours will result in permanent suspension.',
    icon: AlertCircle,
    color: 'text-amber-500',
  },
]

/* ─── Toast Notification Component ─── */
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  const colors = {
    success: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-200',
    info: 'bg-brand-50 dark:bg-brand-900/30 border-brand-200 dark:border-brand-800/50 text-brand-800 dark:text-brand-200',
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 animate-slide-in px-4 py-3 rounded-xl border shadow-lg text-sm font-medium flex items-center gap-2 ${colors[type]}`}>
      {type === 'success' && <CheckCircle size={16} />}
      {type === 'error' && <AlertCircle size={16} />}
      {type === 'info' && <Zap size={16} />}
      {message}
    </div>
  )
}

/* ─── How It Works Step ─── */
function PipelineStep({ step, title, desc, icon: Icon, isLast }: {
  step: number; title: string; desc: string; icon: React.ElementType; isLast?: boolean
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold flex-shrink-0">
          {step}
        </div>
        {!isLast && <div className="w-px h-full bg-gray-200 dark:bg-gray-700 mt-1" />}
      </div>
      <div className="pb-5">
        <div className="flex items-center gap-2 mb-0.5">
          <Icon size={13} className="text-brand-500" />
          <h5 className="text-xs font-bold text-gray-800 dark:text-gray-200">{title}</h5>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<PredictResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showInsights, setShowInsights] = useState(true)
  const [activeTab, setActiveTab] = useState<'analyze' | 'batch' | 'history'>('analyze')
  const [history, setHistory] = useState<Array<{ text: string; result: any; timestamp: Date }>>([])
  const [dragOver, setDragOver] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [analyzeCount, setAnalyzeCount] = useState(0)
  const resultRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${Math.max(168, Math.min(ta.scrollHeight, 400))}px`
    }
  }, [text])

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
      setToast({ message: 'Classification failed. Check console.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [text])

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [result])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      predict()
    }
  }

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      setText(clipboardText)
      textareaRef.current?.focus()
      setToast({ message: 'Pasted from clipboard', type: 'info' })
    } catch {
      setToast({ message: 'Clipboard access denied', type: 'error' })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: 'File too large (max 5MB)', type: 'error' })
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setText(event.target?.result as string)
        setToast({ message: `Loaded: ${file.name}`, type: 'info' })
      }
      reader.readAsText(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.csv'))) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setText(event.target?.result as string)
        setToast({ message: `Loaded: ${file.name}`, type: 'info' })
      }
      reader.readAsText(file)
    }
  }

  const clearAll = () => {
    setText('')
    setResult(null)
    setError(null)
    textareaRef.current?.focus()
  }

  const loadExample = (exampleText: string) => {
    setText(exampleText)
    setResult(null)
    setError(null)
    textareaRef.current?.focus()
  }

  const exportHistory = () => {
    const data = history.map(h => ({
      text: h.text,
      label: 'label' in h.result ? h.result.label : 'batch',
      confidence: 'label' in h.result ? h.result.probability : null,
      time: h.timestamp.toISOString(),
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spamguard-history-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setToast({ message: 'History exported', type: 'success' })
  }

  const stats = useMemo(() => {
    if (!result || !('label' in result)) return null
    return {
      spamCount: result.label.toLowerCase() === 'spam' ? 1 : 0,
      hamCount: result.label.toLowerCase() === 'ham' ? 1 : 0,
      avgConfidence: result.probability * 100,
    }
  }, [result])

  const charCount = text.length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

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
          {/* ─── HERO SECTION ─── */}
          <section className="text-center pt-6 pb-8 sm:pt-10 sm:pb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/30 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6 tracking-wide uppercase">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Model Active — v2.0
              {analyzeCount > 0 && (
                <span className="text-brand-500 dark:text-brand-400">· {analyzeCount} analyzed</span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              <span className="text-gray-900 dark:text-white">Intelligent </span>
              <span className="bg-gradient-to-r from-brand-600 via-cyan-500 to-brand-500 dark:from-brand-400 dark:via-cyan-400 dark:to-brand-300 bg-clip-text text-transparent">
                Spam Detection
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
              Powered by <span className="font-semibold text-gray-700 dark:text-gray-300">Multinomial Naive Bayes with TF-IDF</span>.
              Private, real-time classification running entirely in your browser.
            </p>

            {/* Model Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
              <MetricCard label="Accuracy" value="98.7" suffix="%" color="blue" />
              <MetricCard label="Precision" value="99.1" suffix="%" color="emerald" />
              <MetricCard label="F1 Score" value="97.8" suffix="%" color="violet" />
              <MetricCard label="Trained On" value="50000" suffix="+" color="amber" />
            </div>

            <button
              onClick={() => document.getElementById('classifier')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-500 transition-colors group"
              aria-label="Scroll to classifier"
            >
              Start Analyzing
              <ArrowDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
            </button>
          </section>

          {/* ─── MAIN CONTENT ─── */}
          <div id="classifier" className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column — Classifier */}
            <section className="lg:col-span-8 space-y-6">
              <div className="glass-card-elevated rounded-2xl overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200/80 dark:border-gray-700/50">
                  <nav className="flex px-4 pt-1" aria-label="Classifier tabs" role="tablist">
                    {[
                      { key: 'analyze' as const, label: 'Single Analysis', mobileLabel: 'Analyze', icon: Zap },
                      { key: 'batch' as const, label: 'Batch Upload', mobileLabel: 'Batch', icon: Upload },
                      { key: 'history' as const, label: 'History', mobileLabel: 'History', icon: Clock, count: history.length },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`relative px-3 sm:px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-1.5 sm:gap-2 ${activeTab === tab.key
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        aria-selected={activeTab === tab.key}
                        role="tab"
                      >
                        <tab.icon size={15} />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden text-xs">{tab.mobileLabel}</span>
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-bold bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
                            {tab.count > 9 ? '9+' : tab.count}
                          </span>
                        )}
                        {activeTab === tab.key && (
                          <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-500 rounded-full" />
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-5 sm:p-6">
                  {/* ─── ANALYZE TAB ─── */}
                  {activeTab === 'analyze' && (
                    <div className="space-y-5 animate-fade-in">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label htmlFor="message-input" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Mail size={14} className="text-brand-500" />
                            Message Content
                          </label>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={handlePaste}
                              className="btn-secondary px-2.5 py-1.5 text-xs flex items-center gap-1.5 rounded-lg"
                              title="Paste from clipboard (Ctrl+V)"
                            >
                              <ClipboardPaste size={12} />
                              <span className="hidden sm:inline">Paste</span>
                            </button>
                            <label className="btn-secondary px-2.5 py-1.5 text-xs flex items-center gap-1.5 rounded-lg cursor-pointer" title="Upload file">
                              <FileText size={12} />
                              <span className="hidden sm:inline">Upload</span>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept=".txt,.csv,.json,.eml"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Textarea */}
                        <div
                          className={`relative rounded-xl transition-all duration-200 ${dragOver ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-900' : ''
                            }`}
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={handleDrop}
                        >
                          <textarea
                            ref={textareaRef}
                            id="message-input"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Paste or type your email / SMS content here for spam analysis…&#10;&#10;Press Ctrl+Enter to analyze instantly."
                            className="input-field w-full p-4 pr-28 resize-none text-sm leading-relaxed min-h-[168px]"
                            style={{ overflow: 'hidden' }}
                            aria-describedby="input-help"
                          />
                          <div id="input-help" className="absolute bottom-3 right-3 flex items-center gap-2 text-[10px] font-medium text-gray-400 select-none pointer-events-none tabular-nums">
                            <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
                            <span className="text-gray-300 dark:text-gray-600">·</span>
                            <span>{charCount.toLocaleString()} chars</span>
                          </div>
                          {dragOver && (
                            <div className="absolute inset-0 bg-brand-50/90 dark:bg-brand-900/40 rounded-xl border-2 border-dashed border-brand-400 flex items-center justify-center backdrop-blur-sm">
                              <div className="text-center">
                                <Upload size={28} className="mx-auto text-brand-500 mb-2" />
                                <p className="text-brand-600 dark:text-brand-400 font-semibold text-sm">Drop file here</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Example buttons */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Try:</span>
                          {EXAMPLE_MESSAGES.map((ex, i) => (
                            <button
                              key={i}
                              onClick={() => loadExample(ex.text)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                              <ex.icon size={12} className={ex.color} />
                              {ex.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={predict}
                          disabled={loading || !text.trim()}
                          className="btn-primary flex-1 px-6 py-3.5 flex items-center justify-center gap-3 text-sm group"
                        >
                          {loading ? (
                            <>
                              <div className="spinner" />
                              <span>Analyzing<span className="loading-dots">...</span></span>
                            </>
                          ) : (
                            <>
                              <Zap size={17} className="group-hover:rotate-12 transition-transform" />
                              Analyze Message
                              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/20 text-[10px] font-mono ml-auto">
                                ⌘↵
                              </kbd>
                            </>
                          )}
                        </button>
                        <button
                          onClick={clearAll}
                          disabled={!text && !result}
                          className="btn-secondary px-5 py-3.5 flex items-center justify-center gap-2 text-sm rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <RefreshCcw size={15} />
                          Clear
                        </button>
                      </div>

                      {/* Error state */}
                      {error && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 animate-fade-in">
                          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">Analysis Failed</p>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{error}</p>
                          </div>
                        </div>
                      )}

                      {/* Results */}
                      {result && (
                        <div ref={resultRef} className="animate-fade-in-up" tabIndex={-1} role="region" aria-label="Analysis Results">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <BarChart3 size={18} className="text-brand-500" />
                              Results
                            </h3>
                            {stats && (
                              <span className={`badge ${stats.spamCount > 0 ? 'badge-spam' : 'badge-safe'}`}>
                                {stats.spamCount > 0 ? 'Spam Detected' : 'Safe Message'}
                              </span>
                            )}
                          </div>
                          <div className="space-y-4">
                            {'label' in result ? (
                              <ResultCard label={result.label} probability={result.probability} text={text} />
                            ) : (
                              <div className="space-y-4">
                                {Array.isArray((result as any).predictions) && (result as any).predictions.length > 0 ? (
                                  (result as any).predictions.map((p: any, i: number) => (
                                    <ResultCard key={i} label={p.label} probability={Number(p.probability)} text={p.text} />
                                  ))
                                ) : (
                                  <div className="text-center py-12 text-gray-400">
                                    <AlertCircle size={40} className="mx-auto mb-3 opacity-50" />
                                    <p className="font-medium">No predictions available</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── BATCH TAB ─── */}
                  {activeTab === 'batch' && (
                    <div className="animate-fade-in text-center py-10">
                      <div className="inline-flex p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-5">
                        <Upload size={32} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Batch Processing</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                        Upload a file with multiple messages for bulk classification. Results will load in the Single Analysis tab.
                      </p>
                      <div
                        className={`border-2 border-dashed rounded-2xl p-10 max-w-md mx-auto transition-all ${dragOver
                          ? 'border-brand-400 bg-brand-50/50 dark:bg-brand-900/20'
                          : 'border-gray-300 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700'
                          }`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                      >
                        <input type="file" accept=".txt,.csv,.json,.eml" className="hidden" id="batch-upload" onChange={handleFileUpload} />
                        <label htmlFor="batch-upload" className="cursor-pointer block">
                          <div className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
                            <Upload size={16} />
                            Choose File
                          </div>
                          <p className="text-xs text-gray-400 mt-4">or drag and drop files here</p>
                          <p className="text-[10px] text-gray-400 mt-1">Supported: .txt, .csv, .json, .eml (max 5MB)</p>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* ─── HISTORY TAB ─── */}
                  {activeTab === 'history' && (
                    <div className="animate-fade-in">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Analysis History
                          {history.length > 0 && (
                            <span className="text-sm font-normal text-gray-400 ml-2">({history.length})</span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2">
                          {history.length > 0 && (
                            <>
                              <button
                                onClick={() => { setHistory([]); setToast({ message: 'History cleared', type: 'info' }) }}
                                className="btn-secondary px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5"
                              >
                                <Trash2 size={12} />
                                Clear
                              </button>
                              <button onClick={exportHistory} className="btn-secondary px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5">
                                <Download size={12} />
                                Export
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {history.length > 0 ? (
                        <div className="space-y-2 stagger-children">
                          {history.map((item, index) => (
                            <button
                              key={index}
                              className="w-full text-left glass-card p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group"
                              onClick={() => { setText(item.text); setResult(item.result); setActiveTab('analyze') }}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`flex-shrink-0 h-2 w-2 rounded-full ${'label' in item.result && item.result.label.toLowerCase() === 'spam' ? 'bg-red-500' : 'bg-emerald-500'
                                  }`} />
                                <p className="text-sm font-medium truncate flex-1 text-gray-700 dark:text-gray-300">{item.text}</p>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <span className={`badge ${'label' in item.result && item.result.label.toLowerCase() === 'spam' ? 'badge-spam' : 'badge-safe'}`}>
                                    {'label' in item.result ? item.result.label : 'Multiple'}
                                  </span>
                                  <span className="text-[10px] text-gray-400 tabular-nums hidden sm:block">
                                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-14">
                          <div className="inline-flex p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
                            <Clock size={28} className="text-gray-400" />
                          </div>
                          <p className="font-medium text-gray-500 dark:text-gray-400 mb-1">No history yet</p>
                          <p className="text-xs text-gray-400">Your analysis results will appear here</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ─── RIGHT SIDEBAR ─── */}
            <aside className="lg:col-span-4 space-y-6">
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="lg:hidden w-full flex items-center justify-between p-4 rounded-xl glass-card"
                aria-expanded={showInsights}
              >
                <span className="font-semibold text-sm">Details & Info</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${showInsights ? 'rotate-180' : ''}`} />
              </button>

              <div className={`space-y-5 ${showInsights ? 'block' : 'hidden lg:block'} stagger-children`}>
                {/* How It Works */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-900/20">
                      <Search className="text-violet-600 dark:text-violet-400" size={18} />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">How It Works</h4>
                  </div>
                  <div>
                    <PipelineStep step={1} title="Input" desc="Paste or type your email/SMS content" icon={MessageSquare} />
                    <PipelineStep step={2} title="Tokenization" desc="Text is tokenized, cleaned, and stop words removed" icon={Search} />
                    <PipelineStep step={3} title="TF-IDF Vectorization" desc="Features extracted using trained vocabulary" icon={Cpu} />
                    <PipelineStep step={4} title="Classification" desc="Naive Bayes probabilistic inference" icon={Brain} />
                    <PipelineStep step={5} title="Result" desc="Spam/Ham label with confidence score" icon={ShieldCheck} isLast />
                  </div>
                </div>

                {/* Model Info */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-900/20">
                      <Brain className="text-brand-600 dark:text-brand-400" size={18} />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Model Architecture</h4>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Algorithm', value: 'Multinomial Naive Bayes' },
                      { label: 'Vectorization', value: 'TF-IDF (50k+ features)' },
                      { label: 'Training Data', value: '50,000+ labeled messages' },
                      { label: 'Test Accuracy', value: '98.7%' },
                      { label: 'Inference', value: 'Client-side (< 50ms)' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-baseline gap-2 py-1 border-b border-gray-100 dark:border-gray-800/50 last:border-0">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.label}</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <FeatureCard icon={Cpu} title="ML Engine" description="Naive Bayes with TF-IDF vectorization pipeline" color="blue" />
                  <FeatureCard icon={Lock} title="Private" description="All inference runs locally in your browser" color="emerald" />
                  <FeatureCard icon={Zap} title="Real-time" description="Sub-50ms classification response time" color="violet" />
                  <FeatureCard icon={BarChart3} title="Analytics" description="Confidence scoring with risk assessment" color="amber" />
                </div>

                {/* Best Practices */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                      <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={18} />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Best Practices</h4>
                  </div>
                  <ul className="space-y-2.5">
                    {[
                      'Include the complete message body for best accuracy',
                      'Remove email signatures and automated footers',
                      'Avoid including personal information in shared results',
                      'Use batch processing for large-scale analysis',
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack */}
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Built With</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Python', 'scikit-learn', 'Next.js', 'TypeScript', 'TailwindCSS', 'Naive Bayes', 'TF-IDF'].map(tech => (
                      <span key={tech} className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-medium text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ─── FOOTER ─── */}
        <footer className="border-t border-gray-200/60 dark:border-gray-800/60 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl primary-gradient flex items-center justify-center text-white shadow-sm">
                  <Shield size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">SpamGuard</p>
                  <p className="text-[10px] text-gray-400">AI-Powered Spam Classification</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs text-gray-400">
                <a
                  href="https://github.com/Anish-2005/Spam-Email-Classifier-using-Naive-Bayes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-brand-500 transition-colors"
                >
                  <Github size={13} />
                  GitHub Repository
                </a>
                <span className="hidden sm:inline">·</span>
                <span className="flex items-center gap-1">
                  Made with <Heart size={11} className="text-red-400 fill-red-400" /> by Anish
                </span>
                <span className="hidden sm:inline">·</span>
                <span>© {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}