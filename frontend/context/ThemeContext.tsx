import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  toggle: () => void
  toggleWithTransition: (x: number, y: number) => void
  setTheme: (t: Theme) => void
  isTransitioning: boolean
}

const STORAGE_KEY = 'spamguard-theme'
const TRANSITION_DURATION = 600 // ms

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeRaw] = useState<Theme>('light')
  const [hydrated, setHydrated] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // On mount: read persisted theme
  useEffect(() => {
    let initial: Theme = 'light'
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'dark' || stored === 'light') {
        initial = stored
      } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        initial = 'dark'
      }
    } catch { }
    document.documentElement.classList.toggle('dark', initial === 'dark')
    setThemeRaw(initial)
    setHydrated(true)
  }, [])

  // Sync theme to DOM + localStorage
  useEffect(() => {
    if (!hydrated) return
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { }
  }, [theme, hydrated])

  const setTheme = useCallback((t: Theme) => setThemeRaw(t), [])
  const toggle = useCallback(() => setThemeRaw(s => (s === 'dark' ? 'light' : 'dark')), [])

  /**
   * Toggle theme with a circular reveal animation.
   * `x`, `y` = click coordinates (origin of the expanding circle).
   */
  const toggleWithTransition = useCallback((x: number, y: number) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'

    // Calculate the max radius needed to cover the entire viewport
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // Add the smooth-transition class to all elements
    document.documentElement.classList.add('theme-transitioning')

    // If View Transition API is available (Chrome 111+), use native circular reveal
    if (doc.startViewTransition) {
      document.documentElement.style.setProperty('--theme-transition-x', `${x}px`)
      document.documentElement.style.setProperty('--theme-transition-y', `${y}px`)
      document.documentElement.style.setProperty('--theme-transition-r', `${maxRadius}px`)

      setIsTransitioning(true)

      const transition = doc.startViewTransition(() => {
        setThemeRaw(nextTheme)
      })

      transition.finished.then(() => {
        setIsTransitioning(false)
        document.documentElement.classList.remove('theme-transitioning')
      })
      return
    }

    // Fallback: manual circular reveal overlay
    const overlay = document.createElement('div')
    overlay.className = 'theme-transition-overlay'
    overlay.style.setProperty('--tx', `${x}px`)
    overlay.style.setProperty('--ty', `${y}px`)
    overlay.style.setProperty('--tr', `${maxRadius}px`)
    overlay.style.background = nextTheme === 'dark' ? '#0b1120' : '#f8fafc'

    document.body.appendChild(overlay)

    // Force reflow then animate
    void overlay.offsetHeight
    overlay.classList.add('active')

    setIsTransitioning(true)

    // Switch theme partway through animation
    setTimeout(() => {
      setThemeRaw(nextTheme)
    }, TRANSITION_DURATION * 0.35)

    // Clean up overlay after animation
    setTimeout(() => {
      overlay.classList.add('fade-out')
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
        setIsTransitioning(false)
        document.documentElement.classList.remove('theme-transitioning')
      }, 200)
    }, TRANSITION_DURATION)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggle, toggleWithTransition, setTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  )
}
