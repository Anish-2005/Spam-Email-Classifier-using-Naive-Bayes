import React from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import { Shield, ArrowLeft, Home, Search } from 'lucide-react'

export default function Custom404() {
    return (
        <>
            <Head>
                <title>404 — Page Not Found | SpamGuard</title>
                <meta name="robots" content="noindex" />
            </Head>

            <div className="min-h-screen flex flex-col">
                <Header />

                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center max-w-md mx-auto">
                        {/* Animated 404 icon */}
                        <div className="relative inline-flex mb-8">
                            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-brand-100 to-cyan-100 dark:from-brand-900/30 dark:to-cyan-900/30 flex items-center justify-center mx-auto">
                                <Shield size={40} className="text-brand-500" />
                            </div>
                            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <span className="text-red-500 font-bold text-xs">404</span>
                            </div>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                            Page Not Found
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                            The page you&apos;re looking for doesn&apos;t exist or has been moved.
                            Let&apos;s get you back to classifying spam.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <a
                                href="/"
                                className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2 w-full sm:w-auto justify-center"
                            >
                                <Home size={16} />
                                Back to SpamGuard
                            </a>
                            <button
                                onClick={() => window.history.back()}
                                className="btn-secondary px-6 py-3 text-sm rounded-xl inline-flex items-center gap-2 w-full sm:w-auto justify-center"
                            >
                                <ArrowLeft size={16} />
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>

                <footer className="border-t border-gray-200/60 dark:border-gray-800/60">
                    <div className="max-w-7xl mx-auto px-4 py-6 text-center">
                        <p className="text-xs text-gray-400">
                            SpamGuard — AI-Powered Spam Classification
                        </p>
                    </div>
                </footer>
            </div>
        </>
    )
}
