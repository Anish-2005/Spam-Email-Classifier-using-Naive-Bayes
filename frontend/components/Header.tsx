import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun, Sparkles } from 'lucide-react'

export default function Header() {
  const { theme, toggle } = useTheme()

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between glass rounded-2xl px-6 py-4 shadow-lg">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl ai-gradient flex items-center justify-center text-white shadow-md">
            <Sparkles size={18} />
          </div>

          <div>
            <h1 className="text-lg font-semibold leading-tight">
              Spam Classifier AI
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Intelligent email & SMS detection
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="h-10 w-10 rounded-xl border dark:border-white/10 flex items-center justify-center
                       hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-yellow-400" />
            ) : (
              <Moon size={18} className="text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
