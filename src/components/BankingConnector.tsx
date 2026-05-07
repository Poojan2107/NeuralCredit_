import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  ArrowRight, 
  Lock, 
  Building2,
  FileText,
  CheckCircle2
} from 'lucide-react';

interface BankingConnectorProps {
  onSuccess: (data: any) => void;
  onClose: () => void;
}

export default function BankingConnector({ onSuccess, onClose }: BankingConnectorProps) {
  const [step, setStep] = useState(0);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const steps = [
    "Secure Connection Establishing...",
    "Retrieving KYC Metadata...",
    "Analyzing 12-Month Transaction History...",
    "Calculating Average Monthly Liquidity...",
    "Finalizing Asset Valuation..."
  ];

  useEffect(() => {
    if (selectedBank) {
      const interval = setInterval(() => {
        setStep(prev => {
          if (prev < steps.length - 1) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [selectedBank]);

  useEffect(() => {
    if (step === steps.length - 1) {
      setTimeout(() => {
        onSuccess({
          annualIncome: 1250000 + Math.floor(Math.random() * 500000),
          residentialAssets: 2500000,
          bankAssets: 450000,
          cibilScore: 780
        });
      }, 1500);
    }
  }, [step]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bento-card p-8 border-indigo-500/30 bg-slate-900 shadow-2xl"
      >
        {!selectedBank ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Building2 className="h-6 w-6 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Select Your Institution</h2>
            </div>
            
            <div className="space-y-3 mb-8">
              {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map(bank => (
                <button
                  key={bank}
                  onClick={() => setSelectedBank(bank)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 flex items-center justify-between group transition-all"
                >
                  <span className="text-slate-200 font-medium">{bank}</span>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex gap-3">
              <Lock className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">
                Connection is secured via 256-bit AES encryption. We only retrieve metadata; your password is never stored.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {step === steps.length - 1 ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                ) : (
                  <ShieldCheck className="h-8 w-8 text-indigo-400" />
                )}
              </div>
            </div>

            <h2 className="text-lg font-bold text-white mb-2">
              {step === steps.length - 1 ? 'Data Synchronized' : 'Connecting to ' + selectedBank}
            </h2>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full bg-indigo-500"
                initial={{ width: '0%' }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
            <p className="text-sm text-slate-400 font-mono italic">
              {steps[step]}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-8 w-full py-2 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
        >
          Cancel Connection
        </button>
      </motion.div>
    </motion.div>
  );
}
