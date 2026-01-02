import React from 'react'
import { ShieldCheck, AlertTriangle } from 'lucide-react'

type Props = {
  label: string
  probability: number
  text?: string
}

export function ResultCard({ label, probability, text }: Props) {
  const isSpam = label.toLowerCase() === 'spam'
  const confidence = Math.min(Math.max(probability, 0), 1) * 100

  return (
    <div
      className={`
        glass rounded-2xl p-5 border shadow-sm
        ${isSpam
          ? 'border-rose-300/40 dark:border-rose-500/30'
          : 'border-emerald-300/40 dark:border-emerald-500/30'}
      `}
    >
      {/* Message Preview */}
      {text && (
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 line-clamp-3">
          {text}
        </p>
      )}

      {/* Result Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isSpam ? (
            <AlertTriangle className="text-rose-500" size={18} />
          ) : (
            <ShieldCheck className="text-emerald-500" size={18} />
          )}

          <span
            className={`font-semibold tracking-wide ${
              isSpam ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {isSpam ? 'SPAM DETECTED' : 'SAFE MESSAGE'}
          </span>
        </div>

        <span className="text-sm text-slate-500 dark:text-slate-400">
          {confidence.toFixed(2)}%
        </span>
      </div>

      {/* Confidence Bar */}
      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isSpam ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${confidence}%` }}
        />
      </div>

      {/* Footer Hint */}
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Model confidence based on learned patterns
      </p>
    </div>
  )
}
