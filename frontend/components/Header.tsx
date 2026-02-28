import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'
import { Shield, Menu, X, Github, ExternalLink } from 'lucide-react'

/* ─── Animated Sun/Moon Toggle Icon ─── */
function ThemeIcon({ theme }: { theme: string }) {
  const isDark = theme === 'dark'

  return (
    <div className="relative h-5 w-5">
      {/* Sun */}
      <svg
        className={`absolute inset-0 transition-all duration-500 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: '#fbbf24' }}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M6.34 17.66l-1.41 1.41" />
        <path d="M19.07 4.93l-1.41 1.41" />
      </svg>

      {/* Moon */}
      <svg
        className={`absolute inset-0 transition-all duration-500 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: '#64748b' }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </div>
  )
}

export default function Header() {
  const { theme, toggleWithTransition } = useTheme()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const desktopToggleRef = useRef<HTMLButtonElement>(null)
  const mobileToggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleToggle = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    toggleWithTransition(x, y)
  }, [toggleWithTransition])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-3'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`glass-card rounded-2xl px-4 sm:px-6 py-3 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''
            }`}
        >
          <div className="flex items-center justify-between">
            {/* Brand Mark */}
            <a href="/" className="flex items-center gap-3 group" aria-label="Home">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl primary-gradient flex items-center justify-center text-white shadow-md group-hover:shadow-glow-blue transition-shadow duration-300">
                  <Shield size={20} strokeWidth={2.5} />
                </div>
                <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white dark:border-gray-900 dot-pulse" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-brand-600 to-cyan-500 dark:from-brand-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    SpamGuard
                  </span>
                </h1>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 hidden sm:block tracking-wide uppercase">
                  AI-Powered Classification
                </p>
              </div>
            </a>

            {/* Desktop Navigation + Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <nav aria-label="Main navigation" className="mr-2">
                <ul className="flex items-center gap-1">
                  <li>
                    <a
                      href="/"
                      className="px-3 py-2 rounded-lg text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 transition-colors duration-300"
                    >
                      Classifier
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/Anish-2005/Spam-Email-Classifier-using-Naive-Bayes"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-300 flex items-center gap-1.5"
                    >
                      <Github size={14} />
                      Source
                      <ExternalLink size={10} className="opacity-50" />
                    </a>
                  </li>
                </ul>
              </nav>

              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 transition-colors duration-500" />

              {/* Theme Toggle — Desktop */}
              <button
                ref={desktopToggleRef}
                onClick={handleToggle}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="theme-toggle-btn focus-ring h-10 w-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
              >
                <ThemeIcon theme={theme} />
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="sm:hidden flex items-center gap-1.5">
              {/* Theme Toggle — Mobile */}
              <button
                ref={mobileToggleRef}
                onClick={handleToggle}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="theme-toggle-btn focus-ring h-10 w-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
              >
                <ThemeIcon theme={theme} />
              </button>

              <button
                aria-controls="mobile-menu"
                aria-expanded={open}
                onClick={() => setOpen(v => !v)}
                className="focus-ring h-9 w-9 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition"
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            id="mobile-menu"
            className={`sm:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-48 mt-3 opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1 pb-2">
              <a
                href="/"
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20"
                onClick={() => setOpen(false)}
              >
                Classifier
              </a>
              <a
                href="https://github.com/Anish-2005/Spam-Email-Classifier-using-Naive-Bayes"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <Github size={14} />
                Source Code
                <ExternalLink size={10} className="opacity-50" />
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
