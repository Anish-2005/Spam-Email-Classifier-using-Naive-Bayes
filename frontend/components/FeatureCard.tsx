import React, { memo } from 'react'
import { LucideIcon } from 'lucide-react'

type Props = {
    icon: LucideIcon
    title: string
    description: string
    color: 'blue' | 'emerald' | 'violet' | 'amber'
}

const colorMap = {
    blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        icon: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-100 dark:border-blue-800/30',
        glow: 'group-hover:shadow-glow-blue',
    },
    emerald: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        icon: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-100 dark:border-emerald-800/30',
        glow: 'group-hover:shadow-glow-emerald',
    },
    violet: {
        bg: 'bg-violet-50 dark:bg-violet-900/20',
        icon: 'text-violet-600 dark:text-violet-400',
        border: 'border-violet-100 dark:border-violet-800/30',
        glow: 'group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    },
    amber: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        icon: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-100 dark:border-amber-800/30',
        glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
}

export const FeatureCard = memo(function FeatureCard({ icon: Icon, title, description, color }: Props) {
    const c = colorMap[color]

    return (
        <div className={`group glass-card rounded-2xl p-5 border ${c.border} ${c.glow} transition-all duration-300 hover:-translate-y-0.5 cursor-default`}>
            <div className={`inline-flex p-2.5 rounded-xl ${c.bg} mb-3 transition-transform duration-300 group-hover:scale-110`}>
                <Icon size={20} className={c.icon} />
            </div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1.5">{title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
        </div>
    )
})
