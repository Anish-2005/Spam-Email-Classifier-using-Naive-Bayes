import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '../context/ThemeContext'
import Head from 'next/head'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0b1120" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <title>SpamGuard — AI-Powered Spam Detection</title>
        <meta name="description" content="Classify emails and SMS as spam or legitimate using advanced Naive Bayes machine learning. Real-time, browser-local inference with 98.7% accuracy." />
        <meta name="author" content="Anish" />
        <meta property="og:title" content="SpamGuard — AI-Powered Spam Detection" />
        <meta property="og:description" content="Classify emails and SMS with ML-grade precision. Real-time, private, browser-local inference." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>" />
      </Head>

      {/* Skip to content — Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] btn-primary px-4 py-3 text-sm"
      >
        Skip to main content
      </a>

      <div className={`${inter.variable} font-sans min-h-screen flex flex-col antialiased`}>
        <main id="main-content" className="flex-1 w-full" role="main">
          <Component {...pageProps} />
        </main>
      </div>
    </ThemeProvider>
  )
}