import React, { memo } from 'react'
import { FeatureCard } from './FeatureCard'
import {
    Search, MessageSquare, Cpu, Brain, ShieldCheck,
    CheckCircle, Lock, Zap, BarChart3, ChevronDown
} from 'lucide-react'

/* ─── Pipeline Step ─── */
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

/* ─── Model Specs ─── */
const MODEL_SPECS = [
    { label: 'Algorithm', value: 'Multinomial Naive Bayes' },
    { label: 'Vectorization', value: 'TF-IDF (50k+ features)' },
    { label: 'Training Data', value: '50,000+ labeled messages' },
    { label: 'Test Accuracy', value: '98.7%' },
    { label: 'Inference', value: 'Client-side (< 50ms)' },
]

const BEST_PRACTICES = [
    'Include the complete message body for best accuracy',
    'Remove email signatures and automated footers',
    'Avoid including personal information in shared results',
    'Use batch processing for large-scale analysis',
]

const TECH_STACK = ['Python', 'scikit-learn', 'Next.js', 'TypeScript', 'TailwindCSS', 'Naive Bayes', 'TF-IDF']

/* ─── Sidebar Component ─── */
type Props = {
    showInsights: boolean
    onToggle: () => void
}

export const Sidebar = memo(function Sidebar({ showInsights, onToggle }: Props) {
    return (
        <aside className="lg:col-span-4 space-y-6">
            {/* Mobile toggle */}
            <button
                onClick={onToggle}
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

                {/* Model Architecture */}
                <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-900/20">
                            <Brain className="text-brand-600 dark:text-brand-400" size={18} />
                        </div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">Model Architecture</h4>
                    </div>
                    <div className="space-y-2.5">
                        {MODEL_SPECS.map((item, i) => (
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
                        {BEST_PRACTICES.map((tip, i) => (
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
                        {TECH_STACK.map(tech => (
                            <span key={tech} className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-medium text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    )
})
