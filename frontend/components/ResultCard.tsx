// Updated ResultCard component
import React from 'react'
import { ShieldCheck, AlertTriangle, Info } from 'lucide-react'

type Props = {
  label: string
  probability: number
  text?: string
}

export function ResultCard({ label, probability, text }: Props) {
  const isSpam = label.toLowerCase() === 'spam'
  const confidence = Math.min(Math.max(probability, 0), 1) * 100
  const riskLevel = confidence > 90 ? 'High' : confidence > 70 ? 'Medium' : 'Low'

  return (
    <div
      className={`
        rounded-2xl p-5 border transition-all duration-300
        ${isSpam
          ? 'bg-gradient-to-br from-red-50/50 to-rose-50/30 dark:from-red-900/10 dark:to-rose-900/5 border-red-200 dark:border-red-800/30'
          : 'bg-gradient-to-br from-emerald-50/50 to-green-50/30 dark:from-emerald-900/10 dark:to-green-900/5 border-emerald-200 dark:border-emerald-800/30'
        }
      `}
      role="status"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            p-2 rounded-xl ${isSpam 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
              : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isSpam ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <h3 className={`font-bold text-lg ${isSpam ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
              {isSpam ? 'Spam Detected' : 'Legitimate Message'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Risk Level: <span className={`font-semibold ${isSpam ? 'text-red-600' : 'text-emerald-600'}`}>{riskLevel}</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${isSpam ? 'text-red-600' : 'text-emerald-600'}`}>
            {confidence.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Confidence</div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Detection Confidence</span>
          <span className="font-medium">{confidence.toFixed(1)}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isSpam 
                ? 'bg-gradient-to-r from-red-500 to-rose-500' 
                : 'bg-gradient-to-r from-emerald-500 to-green-500'
            }`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Message Preview */}
      {text && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Info size={14} />
            Message Preview
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 max-h-32 overflow-y-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {text.length > 200 ? text.substring(0, 200) + '...' : text}
            </p>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {isSpam ? 'Recommended Action' : 'Status'}
        </p>
        <p className={`text-sm ${isSpam ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {isSpam 
            ? 'Consider blocking this sender and report as spam if appropriate.'
            : 'This message appears to be legitimate. No action required.'
          }
        </p>
      </div>
    </div>
  )
}