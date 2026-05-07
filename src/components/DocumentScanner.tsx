import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { Camera, FileText, Loader2, Scan, CheckCircle, AlertCircle, RefreshCw, Terminal as TerminalIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentScannerProps {
  onScanComplete: (data: Partial<{ fullName: string; annualIncome: string; cibilScore: string }>) => void;
}

export default function DocumentScanner({ onScanComplete }: DocumentScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-5), `[${new Date().toLocaleTimeString([], { hour12: false })}] ${msg}`]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResult(null);
        setLogs([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const runOCR = async () => {
    if (!image) return;
    setIsScanning(true);
    setProgress(0);
    addLog('INITIALIZING_TESSERACT_ENGINE...');
    
    try {
      const { data: { text } } = await Tesseract.recognize(
        image,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.floor(m.progress * 100));
              if (Math.floor(m.progress * 10) % 3 === 0) {
                addLog(`RECOGNIZING_GLYPHS: ${Math.floor(m.progress * 100)}%`);
              }
            }
          }
        }
      );

      addLog('SCAN_COMPLETE. PARSING_ENTITIES...');
      setResult(text);
      
      // Simple Regex parsing for demo purposes
      // In a real app, this would be more robust or use an LLM
      const incomeMatch = text.match(/(Income|Salary|Earned)[:\s]*₹?([\d,]+)/i);
      const nameMatch = text.match(/(Name|Applicant)[:\s]*([A-Z\s]{3,20})/i);
      
      const parsedData = {
        fullName: nameMatch ? nameMatch[2].trim() : undefined,
        annualIncome: incomeMatch ? incomeMatch[2].replace(/,/g, '') : undefined,
      };

      if (parsedData.fullName || parsedData.annualIncome) {
        addLog('ENTITIES_FOUND. SYNC_READY.');
      } else {
        addLog('WARNING: LOW_CONFIDENCE_ENTITIES.');
      }
      
      onScanComplete(parsedData);
    } catch (err) {
      addLog('ERROR: OCR_PIPELINE_CRASHED');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bento-card p-6 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Scan className="h-5 w-5 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">NeuralScan™ OCR</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-white/5">v4.2_PRO</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Upload/Preview Zone */}
        <div 
          className={`relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-4 ${
            image ? 'border-indigo-500/40 bg-slate-950/50' : 'border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-indigo-500/30'
          }`}
          onClick={() => !isScanning && fileInputRef.current?.click()}
        >
          {image ? (
            <>
              <img src={image} alt="Preview" className="w-full h-full object-contain opacity-60" />
              <AnimatePresence>
                {isScanning && (
                  <motion.div 
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-[2px] bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)] z-10"
                  />
                )}
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
            </>
          ) : (
            <>
              <div className="p-4 rounded-full bg-slate-900 border border-white/5 text-slate-500 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                <Camera className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-300">UPLOAD_SOURCE_DOCUMENT</p>
                <p className="text-[10px] text-slate-500 font-mono">PNG, JPG, PDF (MAX_5MB)</p>
              </div>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>

        {/* Controls & Logs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <button
              onClick={runOCR}
              disabled={!image || isScanning}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                !image || isScanning 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  ANALYZING... {progress}%
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  EXECUTE_NEURAL_SCAN
                </>
              )}
            </button>
            <p className="text-[9px] text-slate-500 font-mono uppercase text-center tracking-widest">
              Powered by AURA_RECOGNITION_NODE
            </p>
          </div>

          <div className="bg-black/40 rounded-xl border border-white/5 p-3 h-[90px] font-mono text-[9px] flex flex-col">
            <div className="flex items-center gap-1 text-indigo-400/50 mb-1 border-b border-white/5 pb-1 uppercase tracking-tighter">
              <TerminalIcon className="h-2.5 w-2.5" /> Terminal_Output
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {logs.length === 0 ? (
                <span className="text-slate-600">Awaiting input stream...</span>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-emerald-500/50 shrink-0">&gt;</span>
                    <span className="text-slate-400 break-all">{log}</span>
                  </div>
                ))
              )}
              {isScanning && <div className="w-1.5 h-3 bg-indigo-500 animate-pulse inline-block align-middle ml-1" />}
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Decorative Grid */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full" />
    </div>
  );
}
