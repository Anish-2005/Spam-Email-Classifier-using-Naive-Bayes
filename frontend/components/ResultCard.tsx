import React, { useEffect, useRef, useState } from 'react'
import { ShieldCheck, ShieldAlert, Info, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

type Props = {
  label: string
  probability: number
  text?: string
}

export function ResultCard({ label, probability, text }: Props) {
  const isSpam = label.toLowerCase() === 'spam'
  const confidence = Math.min(Math.max(probability, 0), 1) * 100
  const riskLevel = confidence > 90 ? 'Critical' : confidence > 70 ? 'High' : confidence > 50 ? 'Moderate' : 'Low'
  const barRef = useRef<HTMLDivElement>(null)
  const [animatedWidth, setAnimatedWidth] = useState(0)

  useEffect(() => {
    // Animate the progress bar on mount
    const timeout = setTimeout(() => setAnimatedWidth(confidence), 100)
    return () => clearTimeout(timeout)
  }, [confidence])

  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden transition-all duration-500 animate-scale-in
        ${isSpam
          ? 'bg-gradient-to-br from-red-50 via-rose-50/50 to-orange-50/30 dark:from-red-950/30 dark:via-rose-950/20 dark:to-orange-950/10'
          : 'bg-gradient-to-br from-emerald-50 via-green-50/50 to-cyan-50/30 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-cyan-950/10'
        }
      `}
      role="status"
      aria-live="polite"
      aria-label={`Classification result: ${isSpam ? 'Spam detected' : 'Safe message'} with ${confidence.toFixed(1)}% confidence`}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${isSpam ? 'danger-gradient' : 'success-gradient'}`} />

      <div className="p-6">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Icon with glow effect */}
            <div className={`
              relative p-3 rounded-2xl
              ${isSpam
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-glow-red'
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-glow-emerald'
              }
            `}>
              {isSpam ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
              {/* Pulse ring */}
              <div className={`absolute inset-0 rounded-2xl animate-ping opacity-20 ${isSpam ? 'bg-red-400' : 'bg-emerald-400'
                }`} style={{ animationDuration: '2s' }} />
            </div>

            <div>
              <h3 className={`text-xl font-bold tracking-tight ${isSpam ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'
                }`}>
                {isSpam ? 'Spam Detected' : 'Legitimate Message'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${isSpam ? 'badge-spam' : 'badge-safe'}`}>
                  {isSpam ? (
                    <><AlertTriangle size={10} className="mr-1" /> {riskLevel} Risk</>
                  ) : (
                    <><CheckCircle size={10} className="mr-1" /> Verified Safe</>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Confidence score — large display */}
          <div className="text-right flex-shrink-0">
            <div className={`text-3xl font-extrabold tabular-nums tracking-tight ${isSpam ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
              {confidence.toFixed(1)}
              <span className="text-lg font-bold opacity-60">%</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5 justify-end">
              <TrendingUp size={11} />
              Model Confidence
            </div>
          </div>
        </div>

        {/* Confidence Bar — Animated */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-medium mb-2">
            <span className="text-gray-600 dark:text-gray-400 uppercase tracking-wider">Detection Score</span>
            <span className={`font-bold ${isSpam ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
              {confidence.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-2.5 w-full rounded-full bg-gray-200/70 dark:bg-gray-700/50 overflow-hidden">
            <div
              ref={barRef}
              className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isSpam
                  ? 'bg-gradient-to-r from-red-500 via-rose-500 to-orange-500'
                  : 'bg-gradient-to-r from-emerald-500 via-green-500 to-cyan-500'
                }`}
              style={{ width: `${animatedWidth}%` }}
            >
              {/* Shimmer on progress bar */}
              <div className="absolute inset-0 shimmer" />
            </div>
          </div>
          {/* Scale markers */}
          <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-medium tabular-nums">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Message Preview */}
        {text && (
          <div className="mb-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wider">
              <Info size={12} />
              Analyzed Content
            </div>
            <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/30 max-h-28 overflow-y-auto">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-mono">
                {text.length > 250 ? text.substring(0, 250) + '…' : text}
              </p>
            </div>
          </div>
        )}

        {/* Recommendation */}
        <div className={`rounded-xl p-4 border ${isSpam
            ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/30'
            : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30'
          }`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isSpam ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'
            }`}>
            {isSpam ? '⚠ Recommended Action' : '✓ Status'}
          </p>
          <p className={`text-sm font-medium ${isSpam ? 'text-red-600/90 dark:text-red-300/90' : 'text-emerald-600/90 dark:text-emerald-300/90'
            }`}>
            {isSpam
              ? 'This message exhibits high spam characteristics. Consider blocking this sender and reporting it.'
              : 'This message appears legitimate and safe. No protective action is required.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}