import React, { useEffect, memo } from 'react'
import { CheckCircle, AlertCircle, Zap } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

type Props = {
    message: string
    type: ToastType
    onClose: () => void
}

const colors: Record<ToastType, string> = {
    success: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-200',
    info: 'bg-brand-50 dark:bg-brand-900/30 border-brand-200 dark:border-brand-800/50 text-brand-800 dark:text-brand-200',
}

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={16} />,
    error: <AlertCircle size={16} />,
    info: <Zap size={16} />,
}

export const Toast = memo(function Toast({ message, type, onClose }: Props) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500)
        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div className={`fixed bottom-6 right-6 z-50 animate-slide-in px-4 py-3 rounded-xl border shadow-lg text-sm font-medium flex items-center gap-2 ${colors[type]}`}>
            {icons[type]}
            {message}
        </div>
    )
})
