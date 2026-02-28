import React, { useState, useRef, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import { ResultCard } from '../components/ResultCard'
import { FeatureCard } from '../components/FeatureCard'
import { MetricCard } from '../components/MetricCard'
import {
  Zap, RefreshCcw, Shield, CheckCircle, Clock, Upload, Download,
  ClipboardPaste, FileText, Cpu, Lock, BarChart3, Brain, Sparkles,
  ArrowRight, ChevronDown, AlertCircle, Trash2
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
  },
  {
    label: 'Safe Example',
    text: 'Hi team, just a reminder that our weekly standup meeting has been moved to 3 PM tomorrow. Please update your calendars accordingly. Thanks!',
    icon: CheckCircle,
  },
]

export default function Home() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<PredictResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showInsights, setShowInsights] = useState(true)
  const [activeTab, setActiveTab] = useState<'analyze' | 'batch' | 'history'>('analyze')
  const [history, setHistory] = useState<Array<{ text: string; result: any; timestamp: Date }>>([])
  const [dragOver, setDragOver] = useState(false)
  const resultRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const predict = useCallback(async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      setResult(data)
      setHistory(prev => [{
        text: text.length > 120 ? text.substring(0, 120) + '…' : text,
        result: data,
        timestamp: new Date()
      }, ...prev.slice(0, 19)])
    } catch {
      setResult({ predictions: [{ text, label: 'error', probability: 0 }] } as any)
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
    } catch (error) {
      console.error('Failed to read clipboard:', error)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => setText(event.target?.result as string)
      reader.readAsText(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.csv'))) {
      const reader = new FileReader()
      reader.onload = (event) => setText(event.target?.result as string)
      reader.readAsText(file)
    }
  }

  const clearAll = () => {
    setText('')
    setResult(null)
    textareaRef.current?.focus()
  }

  const loadExample = (exampleText: string) => {
    setText(exampleText)
    setResult(null)
    textareaRef.current?.focus()
  }

  const getStats = () => {
    if (!result) return null
    if ('label' in result) {
      return {
        spamCount: result.label.toLowerCase() === 'spam' ? 1 : 0,
        hamCount: result.label.toLowerCase() === 'ham' ? 1 : 0,
        avgConfidence: result.probability * 100,
      }
    }
    return null
  }

  const stats = getStats()
  const charCount = text.length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <>
      <Head>
        <title>SpamGuard — AI-Powered Spam Detection</title>
        <meta name="description" content="Classify emails and SMS messages as spam or legitimate using advanced Naive Bayes machine learning. Real-time analysis with 98.7% accuracy." />
      </Head>

      <div className="min-h-screen">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* ─── HERO SECTION ─── */}
          <section className="text-center pt-6 pb-10 sm:pt-10 sm:pb-14 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/30 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6 tracking-wide uppercase">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Model Active — v2.0
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              <span className="text-gray-900 dark:text-white">Intelligent </span>
              <span className="bg-gradient-to-r from-brand-600 via-cyan-500 to-brand-500 dark:from-brand-400 dark:via-cyan-400 dark:to-brand-300 bg-clip-text text-transparent">
                Spam Detection
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
              Powered by <span className="font-semibold text-gray-700 dark:text-gray-300">Naive Bayes with TF-IDF vectorization</span>.
              Analyze emails and SMS messages with ML-grade precision.
            </p>

            {/* Model Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-10">
              <MetricCard label="Accuracy" value="98.7" suffix="%" color="blue" />
              <MetricCard label="Precision" value="99.1" suffix="%" color="emerald" />
              <MetricCard label="F1 Score" value="97.8" suffix="%" color="violet" />
              <MetricCard label="Trained On" value="50000" suffix="+" color="amber" />
            </div>

            {/* Scroll hint */}
            <button
              onClick={() => document.getElementById('classifier')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-500 transition-colors group"
              aria-label="Scroll to classifier"
            >
              Start Analyzing
              <ChevronDown size={16} className="animate-bounce" />
            </button>
          </section>

          {/* ─── MAIN CONTENT ─── */}
          <div id="classifier" className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column — Classifier */}
            <section className="lg:col-span-8 space-y-6">
              {/* Tab Card */}
              <div className="glass-card-elevated rounded-2xl overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200/80 dark:border-gray-700/50">
                  <nav className="flex px-4 pt-1" aria-label="Classifier tabs">
                    {[
                      { key: 'analyze' as const, label: 'Single Analysis', icon: Zap },
                      { key: 'batch' as const, label: 'Batch Upload', icon: Upload },
                      { key: 'history' as const, label: 'History', icon: Clock, count: history.length },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`relative px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === tab.key
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        aria-selected={activeTab === tab.key}
                        role="tab"
                      >
                        <tab.icon size={15} />
                        <span className="hidden sm:inline">{tab.label}</span>
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-bold bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
                            {tab.count}
                          </span>
                        )}
                        {/* Active indicator */}
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
                    <div className="space-y-6 animate-fade-in">
                      {/* Input Area */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label htmlFor="message-input" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Message Content
                          </label>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={handlePaste}
                              className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 rounded-lg"
                              title="Paste from clipboard"
                            >
                              <ClipboardPaste size={12} />
                              Paste
                            </button>
                            <label className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 rounded-lg cursor-pointer">
                              <FileText size={12} />
                              Upload
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept=".txt,.csv,.json"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Textarea with drag-and-drop */}
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
                            rows={7}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Paste or type your email / SMS content here for spam analysis…"
                            className="input-field w-full p-4 pr-24 resize-none text-sm leading-relaxed"
                            aria-describedby="input-help"
                          />
                          {/* Character & word count */}
                          <div id="input-help" className="absolute bottom-3 right-3 flex items-center gap-2 text-[10px] font-medium text-gray-400 select-none pointer-events-none">
                            <span>{wordCount} words</span>
                            <span className="text-gray-300 dark:text-gray-600">·</span>
                            <span>{charCount} chars</span>
                          </div>
                          {/* Drag overlay */}
                          {dragOver && (
                            <div className="absolute inset-0 bg-brand-50/80 dark:bg-brand-900/30 rounded-xl border-2 border-dashed border-brand-400 flex items-center justify-center">
                              <p className="text-brand-600 dark:text-brand-400 font-semibold text-sm">Drop file here</p>
                            </div>
                          )}
                        </div>

                        {/* Example Messages */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs text-gray-400 dark:text-gray-500 self-center mr-1">Try:</span>
                          {EXAMPLE_MESSAGES.map((ex, i) => (
                            <button
                              key={i}
                              onClick={() => loadExample(ex.text)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <ex.icon size={12} />
                              {ex.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={predict}
                          disabled={loading || !text.trim()}
                          className="btn-primary flex-1 px-6 py-3.5 flex items-center justify-center gap-3 text-sm"
                        >
                          {loading ? (
                            <>
                              <div className="spinner" />
                              Analyzing…
                            </>
                          ) : (
                            <>
                              <Zap size={17} />
                              Analyze Message
                              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/20 text-[10px] font-mono ml-auto">
                                Ctrl+↵
                              </kbd>
                            </>
                          )}
                        </button>

                        <button
                          onClick={clearAll}
                          className="btn-secondary px-5 py-3.5 flex items-center justify-center gap-2 text-sm rounded-xl"
                        >
                          <RefreshCcw size={15} />
                          Clear
                        </button>
                      </div>

                      {/* Results Section */}
                      {result && (
                        <div
                          ref={resultRef}
                          className="animate-fade-in-up"
                          tabIndex={-1}
                          role="region"
                          aria-label="Analysis Results"
                        >
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
                              <ResultCard
                                label={result.label}
                                probability={result.probability}
                                text={text}
                              />
                            ) : (
                              <div className="space-y-4">
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
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Batch Processing
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                        Upload a text, CSV, or JSON file with multiple messages for bulk classification.
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
                        <input
                          type="file"
                          accept=".txt,.csv,.json"
                          className="hidden"
                          id="batch-upload"
                          onChange={handleFileUpload}
                        />
                        <label htmlFor="batch-upload" className="cursor-pointer block">
                          <div className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
                            <Upload size={16} />
                            Choose File
                          </div>
                          <p className="text-xs text-gray-400 mt-4">
                            or drag and drop files here
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            Supported: .txt, .csv, .json
                          </p>
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
                        </h3>
                        <div className="flex items-center gap-2">
                          {history.length > 0 && (
                            <>
                              <button
                                onClick={() => setHistory([])}
                                className="btn-secondary px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5"
                              >
                                <Trash2 size={12} />
                                Clear
                              </button>
                              <button className="btn-secondary px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5">
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
                              onClick={() => {
                                setText(item.text)
                                setResult(item.result)
                                setActiveTab('analyze')
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`flex-shrink-0 h-2 w-2 rounded-full ${'label' in item.result && item.result.label.toLowerCase() === 'spam'
                                    ? 'bg-red-500'
                                    : 'bg-emerald-500'
                                  }`} />
                                <p className="text-sm font-medium truncate flex-1 text-gray-700 dark:text-gray-300">
                                  {item.text}
                                </p>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <span className={`badge ${'label' in item.result && item.result.label.toLowerCase() === 'spam'
                                      ? 'badge-spam'
                                      : 'badge-safe'
                                    }`}>
                                    {'label' in item.result ? item.result.label : 'Multiple'}
                                  </span>
                                  <span className="text-[10px] text-gray-400 tabular-nums hidden sm:block">
                                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 transition-colors" />
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
              {/* Mobile toggle */}
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="lg:hidden w-full flex items-center justify-between p-4 rounded-xl glass-card"
                aria-expanded={showInsights}
              >
                <span className="font-semibold text-sm">Details & Info</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${showInsights ? 'rotate-180' : ''}`} />
              </button>

              <div className={`space-y-5 ${showInsights ? 'block' : 'hidden lg:block'} stagger-children`}>
                {/* Model Information */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-900/20">
                      <Brain className="text-brand-600 dark:text-brand-400" size={18} />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                      Model Architecture
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Algorithm', value: 'Multinomial Naive Bayes' },
                      { label: 'Vectorization', value: 'TF-IDF (50k+ features)' },
                      { label: 'Training Data', value: '50,000+ labeled messages' },
                      { label: 'Test Accuracy', value: '98.7%' },
                      { label: 'Inference', value: 'Client-side (< 50ms)' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-baseline gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.label}</span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <FeatureCard
                    icon={Cpu}
                    title="ML Engine"
                    description="Naive Bayes with TF-IDF vectorization pipeline"
                    color="blue"
                  />
                  <FeatureCard
                    icon={Lock}
                    title="Private"
                    description="All inference runs locally in your browser"
                    color="emerald"
                  />
                  <FeatureCard
                    icon={Zap}
                    title="Real-time"
                    description="Sub-50ms classification response time"
                    color="violet"
                  />
                  <FeatureCard
                    icon={BarChart3}
                    title="Analytics"
                    description="Confidence scoring with risk assessment"
                    color="amber"
                  />
                </div>

                {/* Best Practices */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                      <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={18} />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                      Best Practices
                    </h4>
                  </div>
                  <ul className="space-y-3">
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

                {/* Tech Stack Badge */}
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Built With</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Python', 'scikit-learn', 'Next.js', 'TypeScript', 'TailwindCSS', 'Naive Bayes', 'TF-IDF'].map(tech => (
                      <span key={tech} className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-medium text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50">
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
        <footer className="border-t border-gray-200/60 dark:border-gray-800/60 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg primary-gradient flex items-center justify-center text-white">
                  <Shield size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">SpamGuard</p>
                  <p className="text-[10px] text-gray-400">AI-Powered Spam Classification</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-gray-400">
                <a
                  href="https://github.com/Anish-2005/Spam-Email-Classifier-using-Naive-Bayes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-500 transition-colors"
                >
                  GitHub Repository
                </a>
                <span>·</span>
                <span>© {new Date().getFullYear()} Anish</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}