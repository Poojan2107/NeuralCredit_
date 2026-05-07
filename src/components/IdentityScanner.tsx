import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Camera, Loader2, Lock, UserCheck, AlertTriangle } from 'lucide-react';

interface IdentityScannerProps {
  onVerified: () => void;
  onCancel: () => void;
}

export default function IdentityScanner({ onVerified, onCancel }: IdentityScannerProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'AWAITING_SIGNAL' | 'SCANNING_LANDMARKS' | 'MATCHING_ID_NODES' | 'VERIFIED'>('AWAITING_SIGNAL');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("Camera access denied");
      }
    }
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleVerify = () => {
    setIsVerifying(true);
    setStatus('SCANNING_LANDMARKS');
    
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      
      if (p === 40) setStatus('MATCHING_ID_NODES');
      if (p === 100) {
        clearInterval(interval);
        setStatus('VERIFIED');
        setTimeout(() => {
          onVerified();
        }, 1500);
      }
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        onClick={onCancel}
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)]"
      >
        {/* HUD Header */}
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Identity Node</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Biometric_Verification_v2</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
            <Lock className="h-4 w-4" />
          </button>
        </div>

        {/* Camera/Visualizer Zone */}
        <div className="relative aspect-square bg-black overflow-hidden group">
          {stream ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-all duration-1000 ${isVerifying ? 'grayscale brightness-50' : ''}`}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-600">
              <Camera className="h-12 w-12 opacity-20" />
              <p className="text-xs font-mono">SIGNAL_LOST: CAMERA_REQUIRED</p>
            </div>
          )}

          {/* Holographic Overlays */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-12 border border-indigo-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-24 border border-indigo-400/10 rounded-full" />
            
            {/* Scanning Laser */}
            <AnimatePresence>
              {isVerifying && (
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-[2px] bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)] z-10"
                />
              )}
            </AnimatePresence>

            {/* Tracking Squares */}
            <div className="absolute top-1/4 left-1/4 w-4 h-4 border-t-2 border-l-2 border-indigo-500/50" />
            <div className="absolute top-1/4 right-1/4 w-4 h-4 border-t-2 border-r-2 border-indigo-500/50" />
            <div className="absolute bottom-1/4 left-1/4 w-4 h-4 border-b-2 border-l-2 border-indigo-500/50" />
            <div className="absolute bottom-1/4 right-1/4 w-4 h-4 border-b-2 border-r-2 border-indigo-500/50" />
          </div>

          {/* Status Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-12 z-20">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full py-2 px-4 flex items-center justify-center gap-3">
              {status === 'VERIFIED' ? (
                <UserCheck className="h-4 w-4 text-emerald-400" />
              ) : (
                <Loader2 className={`h-4 w-4 text-indigo-400 ${isVerifying ? 'animate-spin' : ''}`} />
              )}
              <span className={`text-[10px] font-mono font-bold tracking-widest ${status === 'VERIFIED' ? 'text-emerald-400' : 'text-slate-300'}`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white/[0.02]">
          {!isVerifying ? (
            <button
              onClick={handleVerify}
              disabled={!stream}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
            >
              Verify Identity
            </button>
          ) : (
            <div className="space-y-4">
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-indigo-500"
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-tighter">
                <span>Processing_Nodes</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Disclaimer */}
        <div className="px-6 pb-6 text-center">
          <p className="text-[9px] text-slate-600 font-mono leading-relaxed">
            BY PROCEEDING, YOU CONSENT TO TEMPORARY BIOMETRIC VECTOR EXTRACTION FOR FRAUD PREVENTION NODE #812.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
