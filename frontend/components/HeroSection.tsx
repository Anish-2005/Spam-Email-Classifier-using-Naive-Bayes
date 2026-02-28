import React, { memo } from 'react'
import { MetricCard } from './MetricCard'
import { ArrowDown } from 'lucide-react'

type Props = {
    analyzeCount: number
}

export const HeroSection = memo(function HeroSection({ analyzeCount }: Props) {
    return (
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
    )
})
