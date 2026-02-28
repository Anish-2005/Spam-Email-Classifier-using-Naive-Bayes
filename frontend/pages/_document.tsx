import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="en" dir="ltr" className="scroll-smooth">
            <Head>
                {/* Prevent dark mode flash — reads localStorage before paint */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                try {
                  var t = localStorage.getItem('spamguard-theme');
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
                    }}
                />

                {/* PWA Manifest */}
                <link rel="manifest" href="/manifest.json" />
                <meta name="application-name" content="SpamGuard" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="SpamGuard" />

                {/* Preconnect for performance */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                {/* Structured Data for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebApplication',
                            name: 'SpamGuard',
                            description: 'AI-powered spam detection using Naive Bayes with TF-IDF. Classify emails and SMS with 98.7% accuracy.',
                            applicationCategory: 'SecurityApplication',
                            operatingSystem: 'Web',
                            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                            author: { '@type': 'Person', name: 'Anish' },
                        }),
                    }}
                />
            </Head>
            <body className="bg-[var(--surface-1)] text-[var(--text-primary)] transition-colors">
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
