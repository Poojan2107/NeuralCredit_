import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Loader2, Shield, Activity, Globe } from 'lucide-react';

export default function SystemBoot({ onComplete }: { onComplete: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const startupSequence = [
    "INITIALIZING_AURA_CORE_V4.2...",
    "ESTABLISHING_ENCRYPTED_NEURAL_LINK...",
    "LOADING_RISK_TOPOLOGY_MODELS...",
    "MOUNTING_GOVERNANCE_PROTOCOL_8...",
    "VERIFYING_CREDIT_GRID_CONNECTIVITY...",
    "SYNCING_WITH_GLOBAL_CREDIT_GRID...",
    "AURA_ENGINE_READY_FOR_OPERATIONS."
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < startupSequence.length) {
        setLogs(prev => [...prev, startupSequence[currentStep]]);
        setProgress(prev => Math.min(prev + (100 / startupSequence.length), 100));
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 1000);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      exit={{ opacity: 0, scale: 1.1 }}
      className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-6"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20" style={{ 
        backgroundImage: 'linear-gradient(rgba(79, 70, 229, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 70, 229, 0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative w-full max-w-lg space-y-12 text-center">
        {/* Core Animation */}
        <div className="relative inline-block">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 -m-8 border border-indigo-500/20 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 -m-16 border border-indigo-400/10 rounded-full"
          />
          <div className="relative p-8 bg-indigo-500/10 rounded-full border border-indigo-500/30 backdrop-blur-xl">
            <BrainCircuit className="h-16 w-16 text-indigo-400 animate-pulse" />
          </div>
        </div>

        {/* Terminal Logs */}
        <div className="space-y-4 text-left">
          <div className="bg-black/50 border border-white/5 rounded-2xl p-6 font-mono text-[10px] leading-relaxed overflow-hidden h-40">
            <AnimatePresence mode="popLayout">
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 mb-1"
                >
                  <span className="text-indigo-500/50">[{new Date().toLocaleTimeString()}]</span>
                  <span className={i === logs.length - 1 ? "text-indigo-400 font-bold" : "text-slate-400"}>
                    {log}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
              <span>System_Synchronization</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              />
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="flex justify-center gap-8 text-[10px] font-mono text-slate-600 uppercase tracking-tighter">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            SECURED_BY_AURA
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3" />
            STOCHASTIC_SYNC: OK
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-3 w-3" />
            GLOBAL_LATENCY: 14MS
          </div>
        </div>
      </div>
    </motion.div>
  );
}
