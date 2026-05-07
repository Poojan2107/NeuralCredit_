import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import LoanForm from '../components/LoanForm';
import { Shield, Brain, TrendingUp, Activity } from 'lucide-react';

interface Stats {
  total: number;
  approvalRate: string;
  avgConfidence: string;
  status: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/model/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Stats fetch error:', err));
  }, []);

  return (
    <div className="min-h-screen">
      <main className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section - Premium AI Interface */}
          <div className="relative mb-20">
            <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden opacity-20">
              <div className="w-[800px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
            </div>
            
            <div className="text-center animate-fade-in-up">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/80 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.15)] uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${stats?.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${stats?.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </span>
                Neural Engine v2.0 // Status: {stats?.status || 'INITIALIZING'}
              </div>

              <h1 className="text-5xl font-black sm:text-7xl lg:text-8xl tracking-tighter mb-6 leading-none">
                <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">AURA</span>
                <span className="gradient-text-header italic">Engine</span>
                <span className="text-indigo-500 animate-pulse">_</span>
              </h1>
              
              <p className="mt-6 max-w-xl mx-auto text-sm sm:text-base text-slate-400 font-medium leading-relaxed opacity-80 uppercase tracking-wide">
                Deep Random Forest Architecture for Deterministic Credit Evaluation & Risk Parity Analysis.
              </p>

              {/* Stats HUD */}
              <div className="flex flex-wrap justify-center gap-4 mt-12">
                {[
                  { icon: Brain, label: 'ARCH', value: 'RF_CLASSIFIER', color: 'text-indigo-400' },
                  { icon: TrendingUp, label: 'PRECISION', value: (stats?.avgConfidence || '95.0') + '%', color: 'text-emerald-400' },
                  { icon: Activity, label: 'THROUGHPUT', value: (stats?.total || 0) + ' NODES', color: 'text-cyan-400' },
                  { icon: Shield, label: 'SECURITY', value: 'AES_256', color: 'text-amber-400' }
                ].map((stat, i) => (
                  <div key={i} className="bento-card flex flex-col items-start gap-1 px-6 py-4 rounded-2xl min-w-[140px] group">
                    <stat.icon className={`h-4 w-4 ${stat.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-2">{stat.label}</span>
                    <span className="text-sm font-mono font-bold text-slate-200">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <LoanForm />
        </div>
      </main>

      <footer className="mt-16 py-8 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-mono">&copy; 2026 Loan Prediction Engine v2.0</p>
          <p className="text-slate-500 text-xs mt-2 font-mono">Model Confidence: {stats?.avgConfidence || '95.0'}% (Aggregated Probability) · Data encrypted at rest.</p>
        </div>
      </footer>
    </div>
  );
}
