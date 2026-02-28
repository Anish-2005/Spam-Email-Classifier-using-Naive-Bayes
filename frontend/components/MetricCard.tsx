import React, { useEffect, useState } from 'react'

type Props = {
    label: string
    value: string
    suffix?: string
    color: 'blue' | 'emerald' | 'violet' | 'amber'
}

const colorClasses = {
    blue: 'text-brand-600 dark:text-brand-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    violet: 'text-violet-600 dark:text-violet-400',
    amber: 'text-amber-600 dark:text-amber-400',
}

const bgClasses = {
    blue: 'from-brand-500/5 to-cyan-500/5 dark:from-brand-500/10 dark:to-cyan-500/10',
    emerald: 'from-emerald-500/5 to-green-500/5 dark:from-emerald-500/10 dark:to-green-500/10',
    violet: 'from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10',
    amber: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
}

export function MetricCard({ label, value, suffix = '', color }: Props) {
    const [displayed, setDisplayed] = useState('0')
    const numericValue = parseFloat(value)

    useEffect(() => {
        if (isNaN(numericValue)) {
            setDisplayed(value)
            return
        }

        // Count-up animation
        const duration = 1200
        const start = Date.now()
        const step = () => {
            const elapsed = Date.now() - start
            const progress = Math.min(elapsed / duration, 1)
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = numericValue * eased

            if (numericValue % 1 === 0) {
                setDisplayed(Math.round(current).toString())
            } else {
                setDisplayed(current.toFixed(1))
            }

            if (progress < 1) {
                requestAnimationFrame(step)
            }
        }
        requestAnimationFrame(step)
    }, [value, numericValue])

    return (
        <div className={`rounded-xl p-4 bg-gradient-to-br ${bgClasses[color]} border border-gray-100 dark:border-gray-800/50`}>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                {label}
            </p>
            <p className={`text-2xl font-extrabold tabular-nums tracking-tight ${colorClasses[color]}`}>
                {displayed}
                {suffix && <span className="text-sm font-bold opacity-60 ml-0.5">{suffix}</span>}
            </p>
        </div>
    )
}
