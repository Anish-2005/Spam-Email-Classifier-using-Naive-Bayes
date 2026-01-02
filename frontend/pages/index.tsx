import { useState, useRef, useEffect } from 'react'
import Header from '../components/Header'
import { ResultCard } from '../components/ResultCard'
import { Sparkles, Zap, RefreshCcw, BookOpen, BarChart3, Shield, AlertTriangle, CheckCircle, Clock, Upload, Download, Filter, HelpCircle } from 'lucide-react'

type PredictResult =
  | { label: string; probability: number }
  | { predictions: Array<{ text: string; label: string; probability: number }> }

export default function Home() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<PredictResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showInsights, setShowInsights] = useState(true)
  const [activeTab, setActiveTab] = useState<'analyze' | 'batch' | 'history'>('analyze')
  const [history, setHistory] = useState<Array<{text: string, result: any, timestamp: Date}>>([])
  const resultRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function predict() {
    if (!text.trim()) return
    
    setLoading(true)
    try {
      const endpoint = '/api/predict'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      setResult(data)
      
      // Add to history
      setHistory(prev => [{
        text: text.length > 100 ? text.substring(0, 100) + '...' : text,
        result: data,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]) // Keep last 10 items
    } catch {
      setResult({ predictions: [{ text, label: 'error', probability: 0 }] } as any)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.focus()
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [result])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      predict()
    }
  }

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      setText(clipboardText)
    } catch (error) {
      console.error('Failed to read clipboard:', error)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setText(event.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  const clearAll = () => {
    setText('')
    setResult(null)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const getStats = () => {
    if (!result) return null
    if ('label' in result) {
      return {
        spamCount: result.label.toLowerCase() === 'spam' ? 1 : 0,
        hamCount: result.label.toLowerCase() === 'ham' ? 1 : 0,
        avgConfidence: result.probability * 100
      }
    }
    return null
  }

  const stats = getStats()

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 text-white">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Spam Detection System
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Advanced AI-powered classification for emails and SMS messages
              </p>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content Area */}
          <section className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="glass-card rounded-2xl">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-2 px-4 pt-2" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('analyze')}
                    className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                      activeTab === 'analyze'
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-b-2 border-blue-500'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} />
                      Single Analysis
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('batch')}
                    className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                      activeTab === 'batch'
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-b-2 border-blue-500'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Upload size={16} />
                      Batch Processing
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                      activeTab === 'history'
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-b-2 border-blue-500'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      History
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-5">
                {activeTab === 'analyze' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Message Content
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handlePaste}
                            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                          >
                            Paste from Clipboard
                          </button>
                          <label className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer">
                            Upload File
                            <input
                              type="file"
                              accept=".txt,.csv,.json"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="relative">
                        <textarea
                          ref={textareaRef}
                          rows={8}
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder="Paste your email or SMS content here. For best results, include the full message without personal information. Press Ctrl+Enter to analyze."
                          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm transition-all"
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                          {text.length} characters
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button
                          onClick={predict}
                          disabled={loading || !text.trim()}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl px-6 py-3.5 font-semibold flex items-center justify-center gap-3 hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                          {loading ? (
                            <>
                              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Analyzing Message...
                            </>
                          ) : (
                            <>
                              <Zap size={18} />
                              Analyze Message
                              <span className="text-xs opacity-80 ml-auto">Ctrl+Enter</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={clearAll}
                          className="px-6 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2"
                        >
                          <RefreshCcw size={16} />
                          Clear All
                        </button>
                      </div>
                    </div>

                    {/* Results Section */}
                    {result && (
                      <div 
                        ref={resultRef}
                        className="animate-fade-in"
                        tabIndex={-1}
                        role="status"
                        aria-live="polite"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Analysis Results
                          </h3>
                          {stats && (
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`px-3 py-1 rounded-full ${stats.spamCount > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
                                {stats.spamCount > 0 ? 'Spam Detected' : 'Safe Message'}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                Confidence: {stats.avgConfidence.toFixed(1)}%
                              </span>
                            </div>
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
                                <div className="text-center py-8 text-gray-500">
                                  No predictions available.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'batch' && (
                  <div className="text-center py-12">
                    <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Batch Processing
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Upload a CSV or JSON file containing multiple messages for bulk analysis.
                    </p>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 max-w-md mx-auto">
                      <input
                        type="file"
                        accept=".csv,.json"
                        className="hidden"
                        id="batch-upload"
                      />
                      <label
                        htmlFor="batch-upload"
                        className="cursor-pointer block"
                      >
                        <div className="bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-xl px-6 py-3 font-semibold inline-flex items-center gap-2 hover:opacity-95 transition"
                        >
                          <Upload size={18} />
                          Choose Files
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                          or drag and drop files here
                        </p>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Analysis History
                      </h3>
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                        <Download size={14} />
                        Export History
                      </button>
                    </div>
                    {history.length > 0 ? (
                      <div className="space-y-3">
                        {history.map((item, index) => (
                          <div
                            key={index}
                            className="glass-card p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer"
                            onClick={() => {
                              setText(item.text)
                              setResult(item.result)
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium truncate">
                                {item.text}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                ('label' in item.result && item.result.label.toLowerCase() === 'spam')
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                              }`}>
                                {'label' in item.result ? item.result.label : 'Multiple'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>
                                  Confidence: {('label' in item.result ? `${(item.result.probability * 100).toFixed(1)}%` : 'N/A')}
                                </span>
                                <span>
                                  {item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Clock size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No analysis history yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Side Panel */}
          <aside className="space-y-6">
            {/* Mobile toggle */}
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="lg:hidden w-full flex items-center justify-between p-4 rounded-xl glass-card"
              aria-expanded={showInsights}
            >
              <span className="font-semibold">Analysis Details</span>
              <span>{showInsights ? '−' : '+'}</span>
            </button>

            <div className={`space-y-6 ${showInsights ? 'block' : 'hidden lg:block'}`}>
              {/* Model Info */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Sparkles className="text-blue-600 dark:text-blue-400" size={18} />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Model Information
                  </h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Algorithm</p>
                    <p className="font-medium">Naive Bayes with TF-IDF</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Training Data</p>
                    <p className="font-medium">50,000+ labeled messages</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Accuracy</p>
                    <p className="font-medium">98.7% on test set</p>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={18} />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Best Practices
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <span className="text-sm">Remove signatures and footers for better accuracy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <span className="text-sm">Include full message content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <span className="text-sm">Avoid personal information in shared results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <span className="text-sm">Use batch processing for large datasets</span>
                  </li>
                </ul>
              </div>

             
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Spam Detection System. All rights reserved.</p>
          <p className="mt-1">Powered by advanced machine learning algorithms</p>
        </div>
      </footer>
    </main>
  )
}