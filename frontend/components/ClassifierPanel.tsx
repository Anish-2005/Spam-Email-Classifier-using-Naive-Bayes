import React, { useRef, useState, useCallback } from 'react'
import { ResultCard } from './ResultCard'
import {
    Zap, RefreshCcw, Upload, Download, Clock,
    ClipboardPaste, FileText, BarChart3,
    ArrowRight, AlertCircle, Trash2, Mail
} from 'lucide-react'

/* ─── Types ─── */
type PredictResult =
    | { label: string; probability: number }
    | { predictions: Array<{ text: string; label: string; probability: number }> }

type HistoryItem = {
    text: string
    result: any
    timestamp: Date
}

type ToastPayload = {
    message: string
    type: 'success' | 'error' | 'info'
}

/* ─── Constants ─── */
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
        icon: ({ size, className }: { size: number; className?: string }) => (
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        ),
        color: 'text-emerald-500',
    },
    {
        label: 'Phishing Attempt',
        text: 'Your account has been compromised! Click this link immediately to verify your identity and secure your bank account. Failure to act within 24 hours will result in permanent suspension.',
        icon: AlertCircle,
        color: 'text-amber-500',
    },
]

/* ─── Props ─── */
type Props = {
    text: string
    setText: (t: string) => void
    result: PredictResult | null
    setResult: (r: any) => void
    loading: boolean
    error: string | null
    activeTab: 'analyze' | 'batch' | 'history'
    setActiveTab: (t: 'analyze' | 'batch' | 'history') => void
    history: HistoryItem[]
    setHistory: (h: HistoryItem[] | ((prev: HistoryItem[]) => HistoryItem[])) => void
    onPredict: () => void
    onClearAll: () => void
    onToast: (t: ToastPayload) => void
    resultRef: React.RefObject<HTMLDivElement | null>
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

export function ClassifierPanel({
    text, setText, result, setResult,
    loading, error, activeTab, setActiveTab,
    history, setHistory, onPredict, onClearAll, onToast,
    resultRef, textareaRef,
}: Props) {
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const charCount = text.length
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

    const stats = result && 'label' in result ? {
        spamCount: result.label.toLowerCase() === 'spam' ? 1 : 0,
    } : null

    const handlePaste = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText()
            setText(clipboardText)
                ; (textareaRef as any).current?.focus()
            onToast({ message: 'Pasted from clipboard', type: 'info' })
        } catch {
            onToast({ message: 'Clipboard access denied', type: 'error' })
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                onToast({ message: 'File too large (max 5MB)', type: 'error' })
                return
            }
            const reader = new FileReader()
            reader.onload = (event) => {
                setText(event.target?.result as string)
                onToast({ message: `Loaded: ${file.name}`, type: 'info' })
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
                onToast({ message: `Loaded: ${file.name}`, type: 'info' })
            }
            reader.readAsText(file)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            onPredict()
        }
    }

    const loadExample = (exampleText: string) => {
        setText(exampleText)
        setResult(null)
            ; (textareaRef as any).current?.focus()
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
        onToast({ message: 'History exported', type: 'success' })
    }

    return (
        <section className="lg:col-span-8 space-y-6">
            <div className="glass-card-elevated rounded-2xl overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200/80 dark:border-gray-700/50">
                    <nav className="flex px-4 pt-1" aria-label="Classifier tabs" role="tablist">
                        {([
                            { key: 'analyze' as const, label: 'Single Analysis', mobileLabel: 'Analyze', icon: Zap },
                            { key: 'batch' as const, label: 'Batch Upload', mobileLabel: 'Batch', icon: Upload },
                            { key: 'history' as const, label: 'History', mobileLabel: 'History', icon: Clock, count: history.length },
                        ]).map(tab => (
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
                                        <button onClick={handlePaste} className="btn-secondary px-2.5 py-1.5 text-xs flex items-center gap-1.5 rounded-lg" title="Paste from clipboard (Ctrl+V)">
                                            <ClipboardPaste size={12} />
                                            <span className="hidden sm:inline">Paste</span>
                                        </button>
                                        <label className="btn-secondary px-2.5 py-1.5 text-xs flex items-center gap-1.5 rounded-lg cursor-pointer" title="Upload file">
                                            <FileText size={12} />
                                            <span className="hidden sm:inline">Upload</span>
                                            <input ref={fileInputRef} type="file" accept=".txt,.csv,.json,.eml" onChange={handleFileUpload} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                {/* Textarea */}
                                <div
                                    className={`relative rounded-xl transition-all duration-200 ${dragOver ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                >
                                    <textarea
                                        ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
                                        id="message-input"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder={"Paste or type your email / SMS content here for spam analysis…\n\nPress Ctrl+Enter to analyze instantly."}
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
                                <button onClick={onPredict} disabled={loading || !text.trim()} className="btn-primary flex-1 px-6 py-3.5 flex items-center justify-center gap-3 text-sm group">
                                    {loading ? (
                                        <>
                                            <div className="spinner" />
                                            <span>Analyzing<span className="loading-dots">...</span></span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={17} className="group-hover:rotate-12 transition-transform" />
                                            Analyze Message
                                            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/20 text-[10px] font-mono ml-auto">⌘↵</kbd>
                                        </>
                                    )}
                                </button>
                                <button onClick={onClearAll} disabled={!text && !result} className="btn-secondary px-5 py-3.5 flex items-center justify-center gap-2 text-sm rounded-xl disabled:opacity-40 disabled:cursor-not-allowed">
                                    <RefreshCcw size={15} />
                                    Clear
                                </button>
                            </div>

                            {/* Error */}
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
                                className={`border-2 border-dashed rounded-2xl p-10 max-w-md mx-auto transition-all ${dragOver ? 'border-brand-400 bg-brand-50/50 dark:bg-brand-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700'
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
                                    {history.length > 0 && <span className="text-sm font-normal text-gray-400 ml-2">({history.length})</span>}
                                </h3>
                                <div className="flex items-center gap-2">
                                    {history.length > 0 && (
                                        <>
                                            <button
                                                onClick={() => { setHistory([]); try { localStorage.removeItem('spamguard-history') } catch { }; onToast({ message: 'History cleared', type: 'info' }) }}
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
                                                <div className={`flex-shrink-0 h-2 w-2 rounded-full ${'label' in item.result && item.result.label.toLowerCase() === 'spam' ? 'bg-red-500' : 'bg-emerald-500'}`} />
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
    )
}
