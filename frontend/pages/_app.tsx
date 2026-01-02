import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '../context/ThemeContext'
import Head from 'next/head'
import { Inter } from 'next/font/google'

// Load Inter font for better typography
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <title>Spam Detection System - Advanced Classification</title>
        <meta name="description" content="Advanced spam detection for emails and SMS messages with real-time analysis and batch processing." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>

      <style jsx global>{`
        :root {
          --safe-area-inset-bottom: env(safe-area-inset-bottom);
        }
        
        /* Prevent body scroll when modals are open */
        body.no-scroll {
          overflow: hidden;
        }
      `}</style>

      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-gradient-to-r from-blue-600 to-sky-600 text-white px-4 py-3 rounded-lg font-medium shadow-lg transition-transform hover:scale-105"
      >
        Skip to main content
      </a>

      <div className={`${inter.variable} font-sans min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 antialiased`}>
        <main
          id="main-content"
          className="flex-1 w-full"
          role="main"
        >
          <Component {...pageProps} />
        </main>

        {/* Global notification area (optional) */}
        <div id="global-notification" className="fixed bottom-4 right-4 z-40 max-w-sm" />
        
        {/* Loader indicator for page transitions */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-sky-500 opacity-0 pointer-events-none transition-opacity duration-300 z-50" id="global-loader" />
      </div>

      {/* Global scripts for enhanced functionality */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Handle safe areas for mobile devices
            document.documentElement.style.setProperty(
              '--safe-area-inset-bottom', 
              'env(safe-area-inset-bottom, 0px)'
            );
            
            // Global loader for page transitions
            let loader = document.getElementById('global-loader');
            if (loader) {
              window.addEventListener('beforeunload', () => {
                loader.style.opacity = '1';
              });
            }
            
            // Handle scroll lock for modals
            window.lockScroll = function(lock) {
              document.body.classList.toggle('no-scroll', lock);
            };
            
            // Handle focus trap for accessibility
            window.trapFocus = function(element) {
              const focusableElements = element.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
              );
              const firstElement = focusableElements[0];
              const lastElement = focusableElements[focusableElements.length - 1];
              
              element.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                  if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                      lastElement.focus();
                      e.preventDefault();
                    }
                  } else {
                    if (document.activeElement === lastElement) {
                      firstElement.focus();
                      e.preventDefault();
                    }
                  }
                }
              });
            };
          `
        }}
      />
    </ThemeProvider>
  )
}