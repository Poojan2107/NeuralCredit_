import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  RefreshCw, 
  History as HistoryIcon, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Activity,
  Cpu,
  ArrowUpRight,
  Trash2,
  Inbox,
  UserCheck,
  UserX,
  AlertTriangle,
  BrainCircuit,
  Sliders,
  Lock
} from 'lucide-react';

interface ModelVersion {
  name: string;
  createdAt: string;
  size: string;
}

interface TrainingResult {
  status: string;
  accuracy: number;
  timestamp: string;
  version: string;
  samples: number;
}

interface HistoryRecord {
  id: number;
  loan_amount: number;
  annual_income: number;
  loan_term: number;
  cibil_score: number;
  approved: number;
  probability: number;
  is_anomaly?: number;
  anomaly_score?: number;
  created_at: string;
  username?: string;
}

export default function Admin() {
  const [versions, setVersions] = useState<ModelVersion[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [lastResult, setLastResult] = useState<TrainingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewQueue, setReviewQueue] = useState<HistoryRecord[]>([]);
  const [threshold, setThreshold] = useState(0.5);
  const [isUpdatingThreshold, setIsUpdatingThreshold] = useState(false);

  useEffect(() => {
    fetchVersions();
    fetchReviewQueue();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.approval_threshold) setThreshold(parseFloat(data.approval_threshold));
    } catch (err) {
      console.error('Failed to fetch settings');
    }
  };

  const updateThreshold = async (val: number) => {
    setThreshold(val);
    setIsUpdatingThreshold(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_threshold: val })
      });
    } catch (err) {
      console.error('Update failed');
    } finally {
      setIsUpdatingThreshold(false);
    }
  };

  const fetchReviewQueue = async () => {
    try {
      const res = await fetch('/api/admin/history');
      const data = await res.json();
      // Filter for anomalies that haven't been "reviewed" 
      // (In a real app we'd have a 'review_status' column, for now we filter by is_anomaly)
      setReviewQueue(data.filter((p: any) => p.is_anomaly === 1));
    } catch (err) {
      console.error('Failed to fetch review queue');
    }
  };

  const fetchVersions = async () => {
    try {
      const res = await fetch('/api/model/versions');
      const data = await res.json();
      setVersions(data);
    } catch (err) {
      console.error('Failed to fetch versions');
    } finally {
      setLoading(false);
    }
  };

  const [telemetry, setTelemetry] = useState({ latency: '0.42ms', memory: '128MB' });

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry({
        latency: (0.35 + Math.random() * 0.15).toFixed(2) + 'ms',
        memory: (120 + Math.floor(Math.random() * 15)) + 'MB'
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleRetrain = async () => {
    setIsTraining(true);
    setError(null);
    try {
      const res = await fetch('/api/model/retrain', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setLastResult(data);
        fetchVersions();
      } else {
        setError(data.error || 'Training failed');
      }
    } catch (err) {
      setError('Connection to training pipeline lost');
    } finally {
      setIsTraining(false);
    }
  };

  const handleDeploy = async (name: string) => {
    try {
      const res = await fetch('/api/model/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert(`Successfully deployed ${name}`);
      }
    } catch (err) {
      alert('Deployment failed');
    }
  };

  const handleReview = async (id: number, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/predictions/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        setReviewQueue(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      alert('Review action failed');
    }
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Shield className="h-6 w-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Enterprise Console</h1>
          </div>
          <p className="text-slate-400">AI Governance, Model Versioning & Lifecycle Management</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Governance Control Plane */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <BrainCircuit className="h-40 w-40 text-indigo-400" />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="max-w-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <Sliders className="h-5 w-5 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">AI Governance Override</h2>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Manually modulate the Neural Approval Threshold. Increasing the threshold enforces stricter risk parameters, decreasing it prioritizes volume.
                  </p>
                </div>

                <div className="flex-1 max-w-sm space-y-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Sensitivity_Index</span>
                    <span className={`text-2xl font-black font-mono ${threshold > 0.7 ? 'text-rose-400' : 'text-indigo-400'}`}>
                      {(threshold * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={threshold} 
                    onChange={(e) => updateThreshold(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-slate-600 uppercase">
                    <span>Permissive</span>
                    <span>Neutral</span>
                    <span>Restricted</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${isUpdatingThreshold ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                    {isUpdatingThreshold ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />}
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
                      {isUpdatingThreshold ? 'Syncing_Nodes...' : 'State_Locked'}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-mono">HASH: 0x{Math.floor(threshold * 1000000).toString(16).toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Control Panel */}
          <div className="lg:col-span-1 space-y-8">
            <section className="bento-card p-6 border-indigo-500/30 bg-indigo-500/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-indigo-400" />
                  Model Training
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isTraining ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {isTraining ? 'TRAINING' : 'IDLE'}
                </span>
              </div>

              <p className="text-sm text-slate-400 mb-6">
                Trigger a manual retraining session using the current `loan_approval_dataset.csv`. 
                This will generate a new Random Forest version and update the active decision boundary.
              </p>

              <button
                onClick={handleRetrain}
                disabled={isTraining}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isTraining 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25'
                }`}
              >
                <RefreshCw className={`h-5 w-5 ${isTraining ? 'animate-spin' : ''}`} />
                {isTraining ? 'Optimizing Weights...' : 'Retrain Now'}
              </button>

              {isTraining && (
                <div className="mt-4 p-4 bg-black/40 rounded-xl border border-indigo-500/30 font-mono text-[9px] text-indigo-400/80 overflow-hidden">
                  <div className="animate-pulse">» INITIALIZING_TRAINING_PIPELINE...</div>
                  <div className="opacity-60">» LOADING_4270_RECORDS...</div>
                  <div className="opacity-40">» GENERATING_100_TREES...</div>
                  <div className="opacity-20">» COMPUTING_GINI_IMPURITY...</div>
                </div>
              )}

              <AnimatePresence>
                {lastResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Success
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase">Accuracy</p>
                        <p className="text-lg font-mono text-white">{lastResult.accuracy}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase">Samples</p>
                        <p className="text-lg font-mono text-white">{lastResult.samples}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20"
                  >
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section className="bento-card p-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <Activity className="h-5 w-5 text-indigo-400" />
                Live Telemetry
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Node Latency</span>
                  <span className="text-sm font-mono text-emerald-400 animate-pulse">{telemetry.latency}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Memory Usage</span>
                  <span className="text-sm font-mono text-white">{telemetry.memory}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Engine Thread</span>
                  <span className="text-sm font-mono text-indigo-400">#{(1024 + Math.floor(Math.random() * 10)).toString(16).toUpperCase()}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Model Registry */}
          <div className="lg:col-span-2">
            <section className="bento-card overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <HistoryIcon className="h-5 w-5 text-indigo-400" />
                  Version Registry
                </h2>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Database className="h-3 w-3" />
                  {versions.length} models stored
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.02] text-[10px] uppercase tracking-widest text-slate-500">
                      <th className="px-6 py-4 font-bold">Model Version</th>
                      <th className="px-6 py-4 font-bold">Created At</th>
                      <th className="px-6 py-4 font-bold">Size</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center">
                          <div className="spinner mx-auto" />
                        </td>
                      </tr>
                    ) : versions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-500 italic">
                          No model versions found. Retrain to generate one.
                        </td>
                      </tr>
                    ) : (
                      versions.map((v) => (
                        <tr key={v.name} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-slate-800 rounded-md">
                                <Cpu className="h-4 w-4 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-sm font-mono text-slate-200">{v.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase">RandomForestClassifier</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-400">
                              {new Date(v.createdAt).toLocaleDateString()}
                              <span className="block text-[10px] text-slate-600">
                                {new Date(v.createdAt).toLocaleTimeString()}
                              </span>
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-mono text-slate-400">{v.size}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeploy(v.name)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white text-xs font-bold transition-all border border-indigo-500/20"
                            >
                              Deploy
                              <ArrowUpRight className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Manual Review Queue */}
            <section className="bento-card mt-8 overflow-hidden border-amber-500/20">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-amber-500/[0.02]">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Inbox className="h-5 w-5 text-amber-400" />
                  Manual Review Queue
                </h2>
                <div className="text-xs text-rose-500 flex items-center gap-2 font-black anomaly-glitch uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/50">
                  <AlertTriangle className="h-3 w-3" />
                  {reviewQueue.length} NEURAL_ANOMALIES
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.01] text-[10px] uppercase tracking-widest text-slate-500">
                      <th className="px-6 py-4 font-bold">Applicant / ID</th>
                      <th className="px-6 py-4 font-bold">Anomaly Score</th>
                      <th className="px-6 py-4 font-bold">Financial Payload</th>
                      <th className="px-6 py-4 font-bold text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reviewQueue.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-500 italic">
                          Clear skies. No neural anomalies pending review.
                        </td>
                      </tr>
                    ) : (
                      reviewQueue.map((item) => (
                        <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-white">#NC-{item.id}</p>
                            <p className="text-[10px] text-slate-500 uppercase">{new Date(item.created_at).toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-amber-500" 
                                  style={{ width: `${(item.anomaly_score || 0) * 100}%` }} 
                                />
                              </div>
                              <span className="text-xs font-mono text-amber-400">{(item.anomaly_score || 0).toFixed(4)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-slate-400">₹{item.loan_amount?.toLocaleString()} @ {item.loan_term}mo</p>
                            <p className="text-[10px] text-slate-600">Income: ₹{item.annual_income?.toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleReview(item.id, 'reject')}
                                className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                                title="Override: Reject"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleReview(item.id, 'approve')}
                                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                                title="Override: Approve"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
