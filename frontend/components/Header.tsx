import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun, Sparkles, Menu, X, Link } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <header className="mb-6">
      <div className="glass rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl primary-gradient flex items-center justify-center text-white shadow-md flex-shrink-0">
              <Sparkles size={18} />
            </div>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold leading-tight truncate">
                Spam Classifier
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block truncate">
                Intelligent email & SMS detection
              </p>
            </div>
          </div>

          {/* Desktop nav + actions */}
          <div className="hidden sm:flex items-center gap-3">
            <nav aria-label="Main navigation">
              <ul className="flex items-center gap-4 text-sm">
                <Link className="text-slate-700 hover:text-sky-600" href="/">Home</Link>
                <Link className="text-slate-700 hover:text-sky-600" href="/docs">API Docs</Link>
              </ul>
            </nav>

            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="h-9 w-9 rounded-lg border dark:border-white/10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              {theme === 'dark' ? (
                <Sun size={16} className="text-yellow-400" />
              ) : (
                <Moon size={16} className="text-slate-700" />
              )}
            </button>
          </div>

          {/* Mobile actions */}
          <div className="sm:hidden flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="h-9 w-9 rounded-lg border dark:border-white/10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              {theme === 'dark' ? (
                <Sun size={16} className="text-yellow-400" />
              ) : (
                <Moon size={16} className="text-slate-700" />
              )}
            </button>

            <button
              aria-controls="mobile-menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="h-9 w-9 rounded-lg border dark:border-white/10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div id="mobile-menu" className={`sm:hidden mt-3 ${open ? 'block' : 'hidden'}`}>
          <nav aria-label="Mobile navigation" className="flex flex-col gap-2">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-100">Home</Link>
            <Link href="/docs" className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-100">API Docs</Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
