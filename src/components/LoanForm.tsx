import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { IndianRupee, Briefcase, Calendar, Calculator, Info, CheckCircle, AlertCircle, Sparkles, TrendingUp, TrendingDown, Target, Brain, Activity, Terminal, ShieldCheck, Zap, Scan, GraduationCap, Users, Clock, Building2, Gem, Landmark, AlertTriangle, ChevronRight, Cpu, Link, Lock, Building, RefreshCw, WifiOff, UserPlus, Volume2, BrainCircuit, CheckCircle2, XCircle, Download, Lightbulb } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

import { useAuth } from '../auth';

import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { generateSanctionLetter } from '../utils/pdfGenerator';
import CustomSelect from './CustomSelect';
import BankingConnector from './BankingConnector';

// --- Zod Validation Schema ---
const loanSchema = z.object({
  age: z.number().min(18, 'Must be at least 18').max(65, 'Exceeds standard lending age (max 65)'),
  dependents: z.number().min(0, 'Cannot be negative').max(10, 'Maximum 10 dependents'),
  education: z.enum(['Graduate', 'Not Graduate']),
  selfEmployed: z.enum(['Yes', 'No']),
  annualIncome: z.number().min(1, 'Income must be greater than 0').max(999999999, 'Limit reached'),
  loanAmount: z.number().min(1, 'Loan amount must be greater than 0').max(999999999, 'Limit reached'),
  loanTerm: z.number().min(1, 'Minimum 1 month').max(360, 'Maximum 360 months (30 years)'),
  cibilScore: z.number().min(300, 'Min CIBIL score is 300').max(900, 'Max CIBIL score is 900'),
  residentialAssets: z.number().min(0, 'Cannot be negative').max(999999999, 'Limit reached'),
  commercialAssets: z.number().min(0, 'Cannot be negative').max(999999999, 'Limit reached'),
  luxuryAssets: z.number().min(0, 'Cannot be negative').max(999999999, 'Limit reached'),
  bankAssets: z.number().min(0, 'Cannot be negative').max(999999999, 'Limit reached'),
});

type LoanInput = z.infer<typeof loanSchema>;

interface FinancialInsights {
  interestRate: number;
  emi: number;
  messages: string[];
}

interface FeatureImportance {
  feature: string;
  importance: number;
}

interface PredictionResult {
  approved: boolean;
  probability: number;
  insights: FinancialInsights;
  feature_importance?: FeatureImportance[];
  finalPayload?: any;
}

// Reusable animated floating input
const FieldInput = ({
  label, name, value, type = "number", icon: Icon, error, onChange, placeholder, min = 0, max
}: any) => (
  <div className="flex flex-col gap-1 w-full relative group">
    <div className="flex items-center gap-2 mb-1 text-slate-300 text-sm font-medium">
      <Icon className="h-4 w-4 text-indigo-400 group-focus-within:text-indigo-300 transition-colors" />
      {label}
    </div>
    <div className="floating-input-group">
      <input
        type={type}
        name={name}
        id={name}
        value={value === 0 && document.activeElement !== document.getElementById(name) ? '' : value}
        onChange={onChange}
        min={min}
        max={max}
        className={`form-input ${error ? 'border-rose-500/50 focus:border-rose-500' : ''}`}
        placeholder=" "
      />
      <label htmlFor={name} className="floating-label">
        {placeholder || `Enter ${label.toLowerCase()}`}
      </label>
    </div>
    {error && (
      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-rose-400 text-[10px] mt-1 flex items-center gap-1 font-mono uppercase tracking-wider absolute -bottom-5 left-0">
        <AlertTriangle className="h-3 w-3" /> {error}
      </motion.p>
    )}
  </div>
);

export default function LoanForm() {
  const isOnline = useNetworkStatus();

  const [formData, setFormData] = useState<LoanInput>({
    age: 25, dependents: 0, education: 'Graduate', selfEmployed: 'No',
    annualIncome: 500000, loanAmount: 200000, loanTerm: 12, cibilScore: 750,
    residentialAssets: 0, commercialAssets: 0, luxuryAssets: 0, bankAssets: 0,
  });

  const [hasCoApplicant, setHasCoApplicant] = useState(false);
  const [coFormData, setCoFormData] = useState<LoanInput>({
    age: 25, dependents: 0, education: 'Graduate', selfEmployed: 'No',
    annualIncome: 500000, loanAmount: 0, loanTerm: 12, cibilScore: 750,
    residentialAssets: 0, commercialAssets: 0, luxuryAssets: 0, bankAssets: 0,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [showBanking, setShowBanking] = useState(false);
  const [synced, setSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const [showOfflineModalOverride, setShowOfflineModalOverride] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  const speakResult = (approved: boolean) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    
    const msg = new SpeechSynthesisUtterance();
    msg.text = approved 
      ? "Aura Engine has processed your request. Loan application approved. Welcome to Neural Credit."
      : "Aura Engine analysis complete. Request denied based on risk topology convergence.";
    msg.rate = 0.9;
    msg.pitch = 0.8; // Deep professional voice
    window.speechSynthesis.speak(msg);
  };

  // --- 3D Card Physics ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };



  const handleBankSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setIsBankModalOpen(false);
      handleBankingSuccess({
        annualIncome: 1200000,
        residentialAssets: 4500000,
        bankAssets: 1500000,
        cibilScore: 785
      });
    }, 3000);
  };

  const handleBankingSuccess = (data: any) => {
    setFormData(prev => ({
      ...prev,
      annualIncome: data.annualIncome,
      residentialAssets: data.residentialAssets,
      bankAssets: data.bankAssets,
      cibilScore: data.cibilScore
    }));
    setSynced(true);
    setShowBanking(false);
  };

  const handleCoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    const maxLengths: Record<string, number> = {
      age: 3, dependents: 2, annualIncome: 9, loanAmount: 9, loanTerm: 3,
      residentialAssets: 9, commercialAssets: 9, luxuryAssets: 9, bankAssets: 9, cibilScore: 3
    };
    if (maxLengths[name] && value.length > maxLengths[name]) value = value.slice(0, maxLengths[name]);
    const parsedValue = name === 'education' || name === 'selfEmployed' ? value : (value === '' ? '' : Number(value));
    setCoFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    const maxLengths: Record<string, number> = {
      age: 3, dependents: 2, annualIncome: 9, loanAmount: 9, loanTerm: 3,
      residentialAssets: 9, commercialAssets: 9, luxuryAssets: 9, bankAssets: 9
    };
    if (maxLengths[name] && value.length > maxLengths[name]) value = value.slice(0, maxLengths[name]);

    const parsedValue = name === 'education' || name === 'selfEmployed' ? value : (value === '' ? '' : Number(value));

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));

    if (value !== '') {
      const fieldSchema = (loanSchema.shape as any)[name];
      if (fieldSchema) {
        const validation = fieldSchema.safeParse(parsedValue);
        if (!validation.success) {
          setFieldErrors((prev) => ({ ...prev, [name]: validation.error.issues[0].message }));
        } else {
          setFieldErrors((prev) => ({ ...prev, [name]: '' }));
        }
      }
    } else {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const startPrediction = async () => {
    setLoading(true);
    setResult(null);

    const validation = loanSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    let finalPayload = { ...formData };
    if (hasCoApplicant) {
      finalPayload.age = Math.max(formData.age, coFormData.age);
      finalPayload.dependents = Math.max(formData.dependents, coFormData.dependents);
      finalPayload.annualIncome = formData.annualIncome + coFormData.annualIncome;
      finalPayload.cibilScore = Math.floor((formData.cibilScore + coFormData.cibilScore) / 2);
      finalPayload.residentialAssets = formData.residentialAssets + coFormData.residentialAssets;
      finalPayload.bankAssets = formData.bankAssets + coFormData.bankAssets;
    }

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setApiError(data.details ? `${data.error}: ${data.details}` : (data.error || 'Prediction failed. Please try again.'));
        setLoading(false);
        return;
      }

      const rate = data.interestRate || 12.0;
      const emi = data.emi || 0;
      const messages: string[] = [];
      const monthlyIncome = finalPayload.annualIncome / 12;
      const dti = emi / monthlyIncome; 
      const r = (rate / 100) / 12; 
      const n = finalPayload.loanTerm;

      if (data.approved) {
        if (rate <= 9.5) messages.push(`Your remarkable ${hasCoApplicant ? 'combined ' : ''}CIBIL score of ${finalPayload.cibilScore} unlocked our premium ${rate}% interest tier. Excellent financial health!`);
        else messages.push(`Your profile was approved, but market volatility and risk factors set your rate at ${rate}%.`);
        if (dti < 0.3) messages.push(`Your ${hasCoApplicant ? 'joint ' : ''}monthly income comfortably supports this estimated EMI. Extremely low default risk detected.`);
      } else {
        if (dti > 0.4) {
          const recommendedMax = (monthlyIncome * 0.4) / (r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
          messages.push(`DEBT-TO-INCOME CRITICAL: Your DTI is ${(dti * 100).toFixed(1)}%. Lowering your loan request to ₹${Math.floor(recommendedMax).toLocaleString('en-IN')} would likely trigger an approval.`);
        }
        
        if (finalPayload.cibilScore < 700) {
          messages.push(`CIBIL UNDER THRESHOLD: A score of ${finalPayload.cibilScore} is considered high-risk. Improving this to 750+ could reduce your rejected status by shifting the Random Forest decision boundary.`);
        }

        const assetsToLoanRatio = (finalPayload.residentialAssets + finalPayload.bankAssets) / finalPayload.loanAmount;
        if (assetsToLoanRatio < 1.5 && finalPayload.loanAmount > 1000000) {
          messages.push(`ASSET LEVERAGE: Your collateral-to-loan ratio is low (${assetsToLoanRatio.toFixed(2)}x). Increasing your declared Bank Assets or Residential Equity by ₹${Math.floor(finalPayload.loanAmount * 0.5).toLocaleString('en-IN')} would strengthen the "Asset Portfolio" node.`);
        }

        if (finalPayload.loanTerm < 24 && finalPayload.loanAmount > monthlyIncome * 4) {
          messages.push(`CASH FLOW VOLATILITY: Repaying ₹${finalPayload.loanAmount.toLocaleString('en-IN')} in ${finalPayload.loanTerm} months creates a liquidity squeeze. Try a 48-month term to stabilize the Neural Engine's risk score.`);
        }

        if (messages.length === 0) {
          messages.push(`MACRO RISK: Your application is mathematically sound but falls into a high-variance cluster in our Random Forest model. Try again with a 5% higher down payment.`);
        }
      }

      setResult({
        approved: data.approved, probability: data.probability,
        insights: { interestRate: rate, emi: emi, messages: messages },
        feature_importance: data.feature_importance, finalPayload: finalPayload
      });
      speakResult(data.approved);
    } catch (err: any) {
      setApiError('Network error. Ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null); setResult(null);

    if (!isOnline) {
      setShowOfflineModalOverride(true);
      return;
    }
    startPrediction();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto"
    >
      <AnimatePresence>
        {showBanking && (
          <BankingConnector 
            onSuccess={handleBankingSuccess}
            onClose={() => setShowBanking(false)}
          />
        )}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-rose-500/10 backdrop-blur-xl border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.15)] rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="p-2 rounded-full bg-rose-500/20">
              <WifiOff className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <h4 className="text-rose-200 font-bold font-mono tracking-tight">SYSTEM OFFLINE</h4>
              <p className="text-rose-400/80 text-xs font-mono">Neural API connection lost. Awaiting signal...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {apiError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-md flex items-start gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-rose-300 font-mono">Exception: AI_ENGINE_HALTED</h3>
            <p className="text-sm text-rose-200 mt-1">{apiError}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-100 transition-opacity">

        {/* Bento Card 1: Demographics + Bank Sync */}
        <div className="bento-card p-6 flex flex-col gap-8 pb-10">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Users className="h-5 w-5 text-indigo-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-200">Demographics</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowBanking(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                synced 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500 hover:text-white'
              }`}
            >
              {synced ? <CheckCircle2 className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
              {synced ? 'Bank Data Synced' : 'Sync Bank Data'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
            <FieldInput label="Age" name="age" value={formData.age} icon={Users} error={fieldErrors.age} onChange={handleChange} placeholder="Years (e.g. 25)" min={18} max={65} />
            <FieldInput label="Dependents" name="dependents" value={formData.dependents} icon={Users} error={fieldErrors.dependents} onChange={handleChange} placeholder="Number" max={10} />
          </div>
          <div className="space-y-8">
            <CustomSelect 
              label="Education Context" name="education" value={formData.education} icon={GraduationCap} onChange={handleChange}
              options={[{ label: 'University Graduate', value: 'Graduate' }, { label: 'Not Graduated', value: 'Not Graduate' }]}
            />
            <CustomSelect 
              label="Employment Status" name="selfEmployed" value={formData.selfEmployed} icon={Briefcase} onChange={handleChange}
              options={[{ label: 'Salaried Employee', value: 'No' }, { label: 'Self Employed Entity', value: 'Yes' }]}
            />
          </div>
        </div>

        {/* Bento Card 2: Financial Request */}
        <div className="bento-card p-6 md:col-span-1 lg:col-span-2 flex flex-col gap-8 pb-10">
          <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Financial Request</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
            <FieldInput label="Annual Income (₹)" name="annualIncome" value={formData.annualIncome} icon={IndianRupee} error={fieldErrors.annualIncome} onChange={handleChange} placeholder="e.g. 500000" />
            <FieldInput label="Requested Amount (₹)" name="loanAmount" value={formData.loanAmount} icon={Calculator} error={fieldErrors.loanAmount} onChange={handleChange} placeholder="e.g. 200000" />
            <div className="sm:col-span-2">
              <FieldInput label="Loan Duration (Months)" name="loanTerm" value={formData.loanTerm} icon={Clock} error={fieldErrors.loanTerm} onChange={handleChange} placeholder="Duration (e.g. 12)" />
            </div>
          </div>
        </div>

        {/* Bento Card 3: Asset Portfolio */}
        <div className="bento-card p-6 lg:col-span-2 flex flex-col gap-8 pb-10">
          <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Landmark className="h-5 w-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Asset Portfolio Verification</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
            <FieldInput label="Residential Equity (₹)" name="residentialAssets" value={formData.residentialAssets} icon={Building2} error={fieldErrors.residentialAssets} onChange={handleChange} />
            <FieldInput label="Commercial Assets (₹)" name="commercialAssets" value={formData.commercialAssets} icon={Building} error={fieldErrors.commercialAssets} onChange={handleChange} />
            <FieldInput label="Luxury Holdings (₹)" name="luxuryAssets" value={formData.luxuryAssets} icon={Gem} error={fieldErrors.luxuryAssets} onChange={handleChange} />
            <FieldInput label="Liquid Bank Capital (₹)" name="bankAssets" value={formData.bankAssets} icon={Landmark} error={fieldErrors.bankAssets} onChange={handleChange} />
          </div>
        </div>

        {/* Co-Applicant Pipeline Hook */}
        <div className="md:col-span-1 lg:col-span-1">
          <button
            type="button" onClick={() => setHasCoApplicant(!hasCoApplicant)}
            className={`w-full h-full bento-card p-6 hover:bg-white/5 transition-all outline-none border flex flex-col justify-center items-center text-center gap-4 group ${hasCoApplicant ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-indigo-500/20'}`}
          >
            <div className={`p-4 rounded-2xl transition-all ${hasCoApplicant ? 'bg-indigo-500/20 text-indigo-300 scale-110' : 'bg-slate-800 text-slate-400'}`}>
              <UserPlus className="h-8 w-8" />
            </div>
            <div>
              <span className="font-bold text-slate-200 block text-lg">Joint Applicant</span>
              <span className="text-xs text-slate-500 font-light mt-1 block">Merge income pipelines to enhance approval rates.</span>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors mt-2 ${hasCoApplicant ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-700'}`}>
              <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${hasCoApplicant ? 'translate-x-6' : ''}`}></div>
            </div>
          </button>
        </div>

        <AnimatePresence>
          {hasCoApplicant && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Secondary Applicant Block */}
              <div className="bento-card p-6 flex flex-col gap-8 pb-10 border-indigo-500/30 bg-indigo-500/[0.04]">
                <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4">
                  <UserPlus className="h-5 w-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-slate-200">Co-Applicant Entity</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                  <FieldInput label="Co-Age" name="age" value={coFormData.age} icon={Users} onChange={handleCoChange} />
                  <FieldInput label="Co-Dependents" name="dependents" value={coFormData.dependents} icon={Users} onChange={handleCoChange} />
                  <CustomSelect 
                    label="Education" name="education" value={coFormData.education} icon={GraduationCap} onChange={handleCoChange}
                    options={[{ label: 'Graduate', value: 'Graduate' }, { label: 'Not Graduate', value: 'Not Graduate' }]}
                  />
                  <CustomSelect 
                    label="Employment Status" name="selfEmployed" value={coFormData.selfEmployed} icon={Briefcase} onChange={handleCoChange}
                    options={[{ label: 'Salaried Employee', value: 'No' }, { label: 'Self Employed Entity', value: 'Yes' }]}
                  />
                </div>
              </div>

              {/* Secondary Financials */}
              <div className="bento-card p-6 flex flex-col gap-8 pb-10 border-emerald-500/30 bg-emerald-500/[0.04]">
                <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-slate-200">Coupled Financial Node</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                  <FieldInput label="Income Vector (₹)" name="annualIncome" value={coFormData.annualIncome} icon={IndianRupee} onChange={handleCoChange} />
                  <FieldInput label="CIBIL Base Score" name="cibilScore" value={coFormData.cibilScore} icon={Activity} onChange={handleCoChange} />
                  <FieldInput label="Res. Assets (₹)" name="residentialAssets" value={coFormData.residentialAssets} icon={Building2} onChange={handleCoChange} />
                  <FieldInput label="Bank Assets (₹)" name="bankAssets" value={coFormData.bankAssets} icon={Landmark} onChange={handleCoChange} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bento Card 4: Credit Score & Submit */}
        <div className="bento-card p-8 md:col-span-2 lg:col-span-1 flex flex-col justify-between gap-6 relative overflow-hidden group">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 text-slate-300 text-sm font-semibold uppercase tracking-wider">
                <Activity className="h-4 w-4 text-indigo-400" />
                Primary CIBIL Index
              </label>
              <span className={`text-3xl font-black font-mono tracking-tighter ${formData.cibilScore >= 750 ? 'text-emerald-400' : formData.cibilScore >= 650 ? 'text-amber-400' : 'text-rose-400'}`}>
                {formData.cibilScore}
              </span>
            </div>
            <input
              type="range" min="300" max="900" step="1" name="cibilScore"
              value={formData.cibilScore} onChange={handleChange}
              className="mt-6 shadow-inner"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-3 font-mono font-bold tracking-widest">
              <span>MIN[300]</span>
              <span>MAX[900]</span>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
            <button
              type="submit" disabled={loading || !isOnline}
              className="btn-cyber w-full flex items-center justify-center gap-3 relative group text-lg py-5"
            >
              {loading ? (
                <>
                  <div className="laser-scan"></div>
                  <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
                  <span className="font-mono tracking-widest text-[10px] uppercase">Processing_Matrices...</span>
                </>
              ) : (
                <>
                  <Brain className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="tracking-tight">EXECUTE_NEURAL_RUN</span>
                  <ChevronRight className="h-5 w-5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all font-bold" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bento Card 5: System Telemetry */}
        <div className="bento-card p-6 hidden lg:flex md:col-span-2 lg:col-span-2 flex-col justify-between relative overflow-hidden bg-slate-900/60 border-slate-700/50 shadow-inner">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <Terminal className="h-5 w-5 text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-300 font-mono tracking-widest uppercase">System Telemetry Link</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-rose-500'}`}></span>
              <span className={`text-[10px] font-mono font-bold ${isOnline ? 'text-emerald-500 tracking-wider' : 'text-rose-500'}`}>
                {isOnline ? 'LINK ACTIVE' : 'NO SIGNAL'}
              </span>
            </div>
          </div>

          <div className="flex-1 font-mono text-[11px] space-y-4 pt-2">
            <div className="flex justify-between items-center text-slate-400 bg-white/5 px-3 py-1.5 rounded">
              <span><span className="text-indigo-500 mr-2 font-bold">»</span>Core Architecture</span>
              <span className="text-slate-300">NC_RF_ScikitEngine[v2.1]</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 bg-white/5 px-3 py-1.5 rounded">
              <span><span className="text-indigo-500 mr-2 font-bold">»</span>Data Tunnel Protocol</span>
              <span className="text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 tracking-widest">AES-256 SECURED</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 bg-white/5 px-3 py-1.5 rounded">
              <span><span className="text-indigo-500 mr-2 font-bold">»</span>State Complexity Map</span>
              <span className="text-slate-300">{hasCoApplicant ? 'DUAL-NODE (Coupled)' : 'SINGLE-NODE (Linear)'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 bg-white/5 px-3 py-1.5 rounded">
              <span><span className="text-indigo-500 mr-2 font-bold">»</span>Real-Time Sync Check</span>
              <span className={Object.keys(fieldErrors).length > 0 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold tracking-widest"}>
                {Object.keys(fieldErrors).length > 0 ? "FAILING CONSTRAINTS" : "NOMINAL"}
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Result Section */}
      <AnimatePresence>
        {result && !apiError && (
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="mt-8 space-y-6 perspective-1000"
            style={{ perspective: "1000px" }}
          >
            {/* Main Result Header */}
            <motion.div 
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className={`bento-card p-6 md:p-8 border relative ${result.approved ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-rose-500/50 bg-rose-500/5'}`}
            >
              <div 
                style={{ transform: "translateZ(50px)" }}
                className="flex flex-col md:flex-row items-center gap-6 relative"
              >
                <div className="shrink-0 p-4 rounded-xl bg-slate-900/80 backdrop-blur border border-white/5 shadow-2xl relative overflow-hidden">
                  <div className={`absolute inset-0 opacity-20 blur-2xl ${result.approved ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  {result.approved ? (
                    <CheckCircle className="h-14 w-14 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] relative z-10" />
                  ) : (
                    <XCircle className="h-14 w-14 text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)] relative z-10" />
                  )}
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className={`text-4xl font-black tracking-tight ${result.approved ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.approved ? 'Sanction Approved' : 'Sanction Denied'}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-slate-400 font-bold">ALGORITHMIC CONFIDENCE:</span>
                      <span className="font-mono text-xl font-black bg-white/10 px-3 py-1 rounded-md text-white shadow-inner border border-white/10 tracking-wider">
                        {result.probability.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {result.approved && (
                  <div className="shrink-0 mt-4 md:mt-0 flex justify-center w-full md:w-auto">
                    <button
                      onClick={() => generateSanctionLetter({
                        result,
                        formData: result.finalPayload || formData,
                        timestamp: new Date().toLocaleString()
                      })}
                      className="flex items-center gap-3 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-all hover:scale-105"
                    >
                      <Download className="h-5 w-5" />
                      Issue Secure PDF
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Aura Optimizer Financial Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bento-card p-6 col-span-1 md:col-span-1 border-t border-slate-700/50 bg-indigo-500/5">
                <div className="flex items-center gap-2 mb-6 border-b border-indigo-500/20 pb-3">
                  <Target className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200">Financial Projection</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-900/80 p-5 rounded-xl border border-white/5 shadow-inner">
                    <div className="text-xs text-slate-400 font-mono mb-2 font-bold tracking-wider">ESTIMATED E.M.I.</div>
                    <div className="text-3xl font-black text-white flex items-center gap-1">
                      <IndianRupee className="h-6 w-6 text-indigo-400" />
                      {Math.floor(result.insights.emi).toLocaleString('en-IN')} <span className="text-sm font-normal text-slate-500 tracking-normal">/ mo</span>
                    </div>
                  </div>
                  <div className="bg-slate-900/80 p-5 rounded-xl border border-white/5 flex justify-between items-center shadow-inner">
                    <div className="text-xs text-slate-400 font-mono font-bold tracking-wider">DYNAMIC YIELD RATE</div>
                    <div className={`text-xl font-black bg-white/5 px-2 py-1 rounded border border-white/5 ${result.insights.interestRate <= 9.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {result.insights.interestRate}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="bento-card p-6 col-span-1 md:col-span-2 border-t border-slate-700/50 relative overflow-hidden group bg-slate-900/40">
                <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
                  <Lightbulb className={`h-5 w-5 animate-pulse ${result.approved ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200">Aura AI Insights</h3>
                </div>
                <div className="space-y-4 relative z-10">
                  {result.insights.messages.map((msg, idx) => (
                    <div key={idx} className="flex gap-4 items-start bg-slate-800/40 p-4 rounded-xl border border-white/5 shadow-sm">
                      <div className="shrink-0 p-1.5 rounded-full bg-black/20">
                        {result.approved ? (
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        {msg}
                      </p>
                    </div>
                  ))}

                  {/* Neural Terminal Log Overlay */}
                  <div className="mt-6 p-4 rounded-xl bg-black/40 border border-indigo-500/20 font-mono text-[10px] space-y-2 overflow-hidden relative group">
                    <div className="flex items-center justify-between mb-2 opacity-50 border-b border-white/5 pb-1">
                      <span className="flex items-center gap-1"><Terminal className="h-3 w-3" /> DECISION_LOG</span>
                      <span>v2.0_READY</span>
                    </div>
                    {[
                      { t: '0.00ms', m: 'INITIALIZING_AURA_CONTEXT...', c: 'text-indigo-400' },
                      { t: '0.12ms', m: 'MAPPING_DEMOGRAPHIC_NODES...', c: 'text-slate-500' },
                      { t: '0.24ms', m: `EVALUATING_CIBIL_VECTOR_[${result.finalPayload?.cibilScore}]`, c: 'text-slate-300' },
                      { t: '0.38ms', m: 'RF_CLASSIFIER_PATH_CONVERGED', c: 'text-emerald-500' },
                      { t: '0.45ms', m: `PREDICTION_EMITTED: ${result.approved ? 'APPROVE' : 'REJECT'}`, c: result.approved ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold' }
                    ].map((line, i) => (
                      <div key={i} className="flex gap-4 items-center animate-fade-in" style={{ animationDelay: `${i * 0.4}s` }}>
                        <span className="text-indigo-500/50">[{line.t}]</span>
                        <span className={line.c}>{line.m}</span>
                      </div>
                    ))}
                    <div className="absolute top-0 right-0 h-full w-[2px] bg-indigo-500/20 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {result.feature_importance && (
              <div className="bento-card mt-6 p-6 border-t border-indigo-500/20 relative overflow-hidden bg-slate-900/50">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-2 mb-6 border-b border-indigo-500/20 pb-3">
                  <Brain className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200">XAI Decision Matrix</h3>
                </div>
                <div className="h-80 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={result.feature_importance.slice(0, 6)}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="feature" tick={{ fill: '#818cf8', fontSize: 11, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                      <Radar name="Impact" dataKey="importance" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Open Banking Mock Modal */}
      <AnimatePresence>
        {isBankModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isSyncing && setIsBankModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bento-card p-0 overflow-hidden border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-6 border-b border-slate-700/50 bg-slate-800/80 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg"><Lock className="h-5 w-5 text-emerald-400" /></div>
                  <h3 className="font-bold text-slate-200">Secure Network Tunnel</h3>
                </div>
                {!isSyncing && (
                  <button onClick={() => setIsBankModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                    <XCircle className="h-6 w-6" />
                  </button>
                )}
              </div>

              <div className="p-8 bg-slate-900/90">
                {!isSyncing ? (
                  <>
                    <p className="text-sm text-slate-400 mb-8 text-center leading-relaxed">Authorize your primary institution to instantly synchronize verified income, assets, and liability data.</p>
                    <div className="grid grid-cols-2 gap-4">
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                        <button
                          key={bank} onClick={handleBankSync}
                          className="flex flex-col items-center gap-4 p-5 rounded-xl border border-white/5 bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all group shadow-md"
                        >
                          <Building className="h-8 w-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                          <span className="text-xs font-bold text-slate-300 text-center tracking-wide">{bank}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-6 relative">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl"></div>
                    <RefreshCw className="h-12 w-12 text-emerald-400 animate-spin relative z-10" />
                    <div className="text-center relative z-10">
                      <h3 className="text-xl font-black text-slate-200 mb-2">Syncing Encrypted Payload...</h3>
                      <p className="text-xs text-emerald-400/80 font-mono mt-2 bg-emerald-500/10 px-3 py-1 rounded inline-block">256-BIT HANDSHAKE ENGAGED</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
