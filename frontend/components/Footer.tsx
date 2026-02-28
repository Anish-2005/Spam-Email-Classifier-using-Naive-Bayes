import React, { memo } from 'react'
import { Shield, Github, Heart } from 'lucide-react'

export const Footer = memo(function Footer() {
    return (
        <footer className="border-t border-gray-200/60 dark:border-gray-800/60 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl primary-gradient flex items-center justify-center text-white shadow-sm">
                            <Shield size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">SpamGuard</p>
                            <p className="text-[10px] text-gray-400">AI-Powered Spam Classification</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs text-gray-400">
                        <a
                            href="https://github.com/Anish-2005/Spam-Email-Classifier-using-Naive-Bayes"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-brand-500 transition-colors"
                        >
                            <Github size={13} />
                            GitHub Repository
                        </a>
                        <span className="hidden sm:inline">·</span>
                        <span className="flex items-center gap-1">
                            Made with <Heart size={11} className="text-red-400 fill-red-400" /> by Anish
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span>© {new Date().getFullYear()}</span>
                    </div>
                </div>
            </div>
        </footer>
    )
})
