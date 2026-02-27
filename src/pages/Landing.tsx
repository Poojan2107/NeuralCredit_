import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../auth';
import { Brain, Shield, Zap, ChevronRight, Activity, LayoutDashboard } from 'lucide-react';

export default function Landing() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col justify-center">
                {/* Hero Section */}
                <div className="text-center mt-20 mb-20 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-indigo-400 text-xs font-mono mb-8">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        sys.status === 'ONLINE'
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                        <span className="text-white">Predict the Future with </span><br className="hidden md:block" />
                        <span className="gradient-text-header">Neural</span>
                        <span className="text-indigo-500">Credit_</span>
                    </h1>

                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-400 font-light mb-12">
                        A state-of-the-art predictive engine utilizing Random Forest machine learning to assess loan eligibility with unparalleled accuracy.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        {user ? (
                            <Link to="/dashboard" className="btn-cyber flex items-center justify-center gap-2 text-lg">
                                <LayoutDashboard className="h-5 w-5" /> Enter Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn-cyber flex items-center justify-center gap-2 text-lg">
                                    <Zap className="h-5 w-5" /> Initialize Engine
                                </Link>
                                <Link to="/login" className="px-8 py-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium flex items-center justify-center gap-2 text-lg">
                                    Access Terminal <ChevronRight className="h-5 w-5" />
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Feature Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="bento-card p-8 flex flex-col gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <Brain className="h-7 w-7 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Advanced ML</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">Powered by a robust Random Forest classifier. Trained on extensive demographic and financial datasets to detect micro-patterns invisible to traditional banking rules.</p>
                    </div>

                    <div className="bento-card p-8 flex flex-col gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <Activity className="h-7 w-7 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Real-Time Analysis</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">Our Node.js edge architecture processes complex algorithmic risk evaluations via Python microservices in milliseconds, providing instant feedback.</p>
                    </div>

                    <div className="bento-card p-8 flex flex-col gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                            <Shield className="h-7 w-7 text-amber-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Secure Pipeline</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">Enterprise-grade security featuring in-memory rate limiting, strictly validated Zod schemas, and bcrypt hashed credential storage.</p>
                    </div>
                </div>

                {/* New Feature: Interactive Tech Stack Bar */}
                <div className="mt-8 mb-24 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="bento-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-indigo-500/20 bg-indigo-500/5">
                        <div className="flex items-center gap-4 hidden sm:flex">
                            <div className="flex -space-x-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-blue-400">RC</div>
                                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-yellow-400">PY</div>
                                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-green-400">ND</div>
                            </div>
                            <div className="text-sm text-slate-400 font-mono">
                                Fully Integrated Stack
                            </div>
                        </div>
                        <div className="text-center md:text-right flex-1">
                            <h4 className="text-lg font-bold text-white mb-2">Ready to test the engine?</h4>
                            <p className="text-sm text-slate-400 mb-4">Jump straight into the dashboard and run a simulation with Open Banking data.</p>
                            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-colors text-sm">
                                Run Simulation <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-8 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-slate-400 text-sm font-mono">&copy; 2026 Loan Prediction Engine v2.0</p>
                    <p className="text-slate-500 text-xs mt-2 font-mono">Precision Engineered for Finance</p>
                </div>
            </footer>
        </div>
    );
}
