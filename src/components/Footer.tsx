import React from 'react';

export default function Footer() {
  return (
    <footer className="py-8 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl mt-auto relative z-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-slate-400 text-sm font-mono mb-4">&copy; 2026 NeuralCredit FinTech Solutions v2.1</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[9px] font-mono text-slate-500 tracking-[0.3em] uppercase mb-4">
          <span>ZARVIN</span>
          <span>MANIT</span>
          <span>POOJAN</span>
          <span>VANSH</span>
          <span>KARTIK</span>
          <span>ABHISHEK</span>
        </div>
        <p className="text-slate-600 text-[10px] font-mono uppercase tracking-[0.1em]">Precision Engineered for Institutional Governance // Core Engineering Team</p>
      </div>
    </footer>
  );
}
