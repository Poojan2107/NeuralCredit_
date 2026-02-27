import Navbar from '../components/Navbar';
import LoanForm from '../components/LoanForm';
import { Shield, Brain, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section - Geeky but polished */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-indigo-400 text-xs font-mono mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              sys.status === 'ONLINE'
            </div>
            <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl tracking-tight">
              <span className="text-white">Neural</span>
              <span className="gradient-text-header">Credit</span>
              <span className="text-indigo-500">_</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400 font-light">
              Advanced Random Forest architecture for real-time loan eligibility prediction.
            </p>

            {/* Stats chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <div className="bento-card flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono">
                <Brain className="h-4 w-4 text-indigo-400" />
                <span className="text-slate-300">engine="RandomForest"</span>
              </div>
              <div className="bento-card flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-slate-300">acc={95}</span>
              </div>
              <div className="bento-card flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono">
                <Shield className="h-4 w-4 text-amber-400" />
                <span className="text-slate-300">sec=true</span>
              </div>
            </div>
          </div>

          <LoanForm />
        </div>
      </main>

      <footer className="mt-16 py-8 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-mono">&copy; 2026 Loan Prediction Engine v2.0</p>
          <p className="text-slate-500 text-xs mt-2 font-mono">Model Accuracy: 95% (Random Forest) · Data encrypted at rest.</p>
        </div>
      </footer>
    </div>
  );
}
