import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { Brain, Shield, Zap, ChevronRight, Activity, LayoutDashboard } from 'lucide-react';

export default function Landing() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col justify-center">
                <div className="text-center mt-24 mb-24 animate-fade-in-up">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/80 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono mb-10 backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.15)] uppercase tracking-widest">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Neural Grid // Production Environment Active
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-10 leading-[0.9]">
                        <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">PREDICT</span><br />
                        <span className="gradient-text-header italic">RISK.</span>
                        <span className="text-white"> SCALE.</span>
                    </h1>

                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12 opacity-40 group hover:opacity-100 transition-opacity duration-700">
                        {[
                            { label: 'ENGINE_LOAD', value: '14.2%' },
                            { label: 'MODEL_ACCURACY', value: '98.4%' },
                            { label: 'Uptime', value: '99.99%' },
                            { label: 'Nodes', value: '482_ACTIVE' }
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-slate-300">
                                <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                                <span className="text-slate-500">{stat.label}:</span>
                                <span className="text-indigo-400">{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    <p className="mt-8 max-w-2xl mx-auto text-base sm:text-lg text-slate-400 font-medium leading-relaxed opacity-80 mb-12">
                        Harness the power of <span className="text-indigo-400">Aura Engine v2.1</span>. A high-fidelity predictive framework utilizing deep-learning micro-patterns for institutional credit governance.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        {user ? (
                            <Link to="/dashboard" className="btn-cyber flex items-center justify-center gap-3 text-lg px-10">
                                <LayoutDashboard className="h-5 w-5" /> NODE_DASHBOARD
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn-cyber flex items-center justify-center gap-3 text-lg px-10">
                                    <Zap className="h-5 w-5" /> INITIALIZE_NODE
                                </Link>
                                <Link to="/login" className="px-10 py-4 rounded-xl border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-all font-mono uppercase tracking-widest flex items-center justify-center gap-2 text-sm">
                                    ACCESS_TERMINAL <ChevronRight className="h-5 w-5 opacity-50" />
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
        </div>
    );
}
