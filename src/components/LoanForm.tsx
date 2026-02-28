import React, { useState } from 'react';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle, XCircle, Calculator, DollarSign, Briefcase,
  GraduationCap, Users, Clock, Activity, Building2, Gem,
  Landmark, AlertTriangle, ChevronRight, Cpu, Brain,
  TrendingDown, TrendingUp, Lightbulb, Target, ShieldCheck, Link, Lock, Building, RefreshCw,
  Download, FileText, WifiOff, UserPlus, Terminal
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable, { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

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
  <div className="flex flex-col gap-1 w-full relative">
    <div className="flex items-center gap-2 mb-1 text-slate-300 text-sm font-medium">
      <Icon className="h-4 w-4 text-indigo-400" />
      {label}
    </div>
    <div className="floating-input-group">
      <input
        type={type}
        name={name}
        id={name}
        value={value}
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
      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-rose-400 text-xs mt-1 flex items-center gap-1 font-mono">
        <AlertTriangle className="h-3 w-3" /> {error}
      </motion.p>
    )}
  </div>
);

export default function LoanForm() {
  const [formData, setFormData] = useState<LoanInput>({
    age: 25,
    dependents: 0,
    education: 'Graduate',
    selfEmployed: 'No',
    annualIncome: 500000,
    loanAmount: 200000,
    loanTerm: 12,
    cibilScore: 750,
    residentialAssets: 0,
    commercialAssets: 0,
    luxuryAssets: 0,
    bankAssets: 0,
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  const handleBankSync = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSyncing(true);

    // Simulate complex API integration latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ARCHETYPE ENGINE: Choose a random financial profile for deeper testing
    const archetypes = ['Professional', 'Freelancer', 'Entrepreneur', 'Graduate'];
    const type = archetypes[Math.floor(Math.random() * archetypes.length)];

    let mockIncome = 500000;
    let mockCibil = 750;
    let resAssets = 0;
    let bnkAssets = 0;
    let luxAssets = 0;
    let isSelfEmployed = 'No';

    switch (type) {
      case 'Professional':
        mockIncome = Math.floor(Math.random() * (3000000 - 1500000) + 1500000);
        mockCibil = Math.floor(Math.random() * (850 - 780) + 780);
        resAssets = Math.floor(mockIncome * 2.5);
        bnkAssets = Math.floor(mockIncome * 0.8);
        break;
      case 'Freelancer':
        mockIncome = Math.floor(Math.random() * (1200000 - 600000) + 600000);
        mockCibil = Math.floor(Math.random() * (740 - 650) + 650);
        isSelfEmployed = 'Yes';
        bnkAssets = Math.floor(mockIncome * 0.3);
        break;
      case 'Entrepreneur':
        mockIncome = Math.floor(Math.random() * (5000000 - 2500000) + 2500000);
        mockCibil = Math.floor(Math.random() * (800 - 600) + 600);
        isSelfEmployed = 'Yes';
        resAssets = Math.floor(mockIncome * 1.5);
        bnkAssets = Math.floor(mockIncome * 1.2);
        luxAssets = Math.floor(mockIncome * 0.5);
        break;
      case 'Graduate':
        mockIncome = Math.floor(Math.random() * (800000 - 400000) + 400000);
        mockCibil = Math.floor(Math.random() * (750 - 700) + 700);
        bnkAssets = Math.floor(mockIncome * 0.1);
        break;
    }

    setFormData(prev => ({
      ...prev,
      annualIncome: mockIncome,
      residentialAssets: resAssets,
      bankAssets: bnkAssets,
      commercialAssets: 0,
      luxuryAssets: luxAssets,
      cibilScore: mockCibil,
      selfEmployed: isSelfEmployed as any
    }));

    // Mirror for Co-Applicant if active (Collaborative Growth Model)
    if (hasCoApplicant) {
      const coIncome = Math.floor(mockIncome * 0.7);
      setCoFormData(prev => ({
        ...prev,
        annualIncome: coIncome,
        residentialAssets: Math.floor(coIncome * 1.1),
        bankAssets: Math.floor(coIncome * 0.4),
        cibilScore: Math.floor(Math.random() * (850 - 700) + 700)
      }));
    }

    setFieldErrors({});
    setIsSyncing(false);
    setIsBankModalOpen(false);
  };

  const generateSanctionLetter = () => {
    if (!result || !result.approved) return;

    const doc = new jsPDF();

    // Add Watermark/Logo styling mock
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(60);
    doc.text("APPROVED", 105, 150, { angle: 45, align: "center", renderingMode: "fill" });

    // Header
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(22);
    doc.text("NEURALCREDIT_ SANCTION LETTER", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Reference No: NC-AI-${Math.floor(Math.random() * 9000000) + 1000000}`, 20, 30);
    doc.text(`Date of Sanction: ${new Date().toLocaleDateString()}`, 20, 35);

    // Body
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.text("Dear Applicant,", 20, 50);

    const introText = `We are pleased to inform you that following an algorithmic review by the NeuralCredit_ Intelligence Engine, your application for a personal loan has been provisionally APPROVED with a confidence score of ${result.probability.toFixed(0)}%.`;
    const splitIntro = doc.splitTextToSize(introText, 170);
    doc.text(splitIntro, 20, 60);

    // Financial Details Table
    const currentPayload = result.finalPayload || formData;
    const tableData = [
      ["Approved Loan Amount", `Rs. ${currentPayload.loanAmount.toLocaleString()}`],
      ["Approved Tenure", `${currentPayload.loanTerm} Months`],
      ["Risk-Based Interest Rate", `${result.insights.interestRate}% p.a.`],
      ["Equated Monthly Installment (EMI)", `Rs. ${Math.floor(result.insights.emi).toLocaleString()}/month`],
      ["Verified Applicant CIBIL Score", currentPayload.cibilScore.toString()],
      ["Verified Annual Income", `Rs. ${currentPayload.annualIncome.toLocaleString()}`]
    ];

    try {
      console.log('Generating PDF with autoTable...', { tableData });
      autoTable(doc, {
        startY: 85,
        head: [['Sanction Detail', 'Authorized Value']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 5 }
      });
    } catch (atError) {
      console.error('autoTable failed:', atError);
      // Fallback: draw a simple line if autoTable fails completely
      doc.text("Table generation failed. Manual check required.", 20, 90);
    }

    // Signatures
    let finalY = 200; // Default fallback
    try {
      finalY = (doc as any).lastAutoTable?.finalY || 200;
    } catch (e) {
      console.warn('Could not determine lastAutoTable.finalY', e);
    }

    doc.setFontSize(10);
    doc.text("System Authorized By:", 20, finalY + 20);
    doc.setFont("courier", "italic");
    doc.text("NeuralCredit_ AI Engine v2.1", 20, finalY + 30);
    doc.setFont("helvetica", "normal");

    doc.text("Applicant Signature:", 140, finalY + 20);
    doc.text("_________________________", 140, finalY + 30);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This is an electronically generated document for portfolio demonstration purposes only. It is not a legally binding contract.", 20, 280);

    doc.save(`NeuralCredit_Sanction_${formData.cibilScore}.pdf`);
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

    // Hardcap the amount of numbers that can be typed into the UI to prevent system overload
    const maxLengths: Record<string, number> = {
      age: 3,
      dependents: 2,
      annualIncome: 9,
      loanAmount: 9,
      loanTerm: 3,
      residentialAssets: 9,
      commercialAssets: 9,
      luxuryAssets: 9,
      bankAssets: 9
    };
    if (maxLengths[name] && value.length > maxLengths[name]) {
      value = value.slice(0, maxLengths[name]);
    }

    const parsedValue = name === 'education' || name === 'selfEmployed' ? value : (value === '' ? '' : Number(value));

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    // Perform live, real-time validation on the specific field being entered
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setResult(null);

    const validation = loanSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!errors[field]) errors[field] = issue.message;
      });
      return;
    }

    let finalPayload = { ...formData };

    // Core Business Logic: The Co-Applicant Pipeline Math Merging
    if (hasCoApplicant) {
      const coValidation = loanSchema.safeParse(coFormData);
      if (!coValidation.success) {
        setApiError("Co-Applicant data is incomplete or invalid. Please verify all Co-Applicant inputs.");
        return;
      }

      finalPayload.age = Math.max(formData.age, coFormData.age);
      finalPayload.dependents = Math.max(formData.dependents, coFormData.dependents);
      finalPayload.education = formData.education === 'Graduate' || coFormData.education === 'Graduate' ? 'Graduate' : 'Not Graduate';
      finalPayload.selfEmployed = formData.selfEmployed === 'No' && coFormData.selfEmployed === 'No' ? 'No' : 'Yes';
      finalPayload.annualIncome = formData.annualIncome + coFormData.annualIncome;
      finalPayload.cibilScore = Math.floor((formData.cibilScore + coFormData.cibilScore) / 2);
      finalPayload.residentialAssets = formData.residentialAssets + coFormData.residentialAssets;
      finalPayload.commercialAssets = formData.commercialAssets + coFormData.commercialAssets;
      finalPayload.luxuryAssets = formData.luxuryAssets + coFormData.luxuryAssets;
      finalPayload.bankAssets = formData.bankAssets + coFormData.bankAssets;
    }

    setFieldErrors({});

    // Network Disconnect Intercept
    if ((window as any).__APP_IS_ONLINE__ === false) {
      setShowOfflineModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setApiError(data.error || 'Prediction failed. Please try again.');
        return;
      }
      // --- AURA OPTIMIZER LOGIC (Python Powered) --- //
      const rate = data.interestRate || 12.0;
      const emi = data.emi || 0;

      // 3. Generate Generative AI Coaching Insights
      const messages: string[] = [];
      const monthlyIncome = finalPayload.annualIncome / 12;
      const dti = emi / monthlyIncome; // Debt-to-Income Ratio
      const r = (rate / 100) / 12; // Monthly Interest Rate
      const n = finalPayload.loanTerm;

      if (data.approved) {
        if (rate <= 9.5) {
          messages.push(`Your remarkable ${hasCoApplicant ? 'combined ' : ''}CIBIL score of ${finalPayload.cibilScore} unlocked our premium ${rate}% interest tier. Excellent financial health!`);
        } else {
          messages.push(`Your profile was approved, but market volatility and risk factors set your rate at ${rate}%.`);
        }
        if (dti < 0.3) {
          messages.push(`Your ${hasCoApplicant ? 'joint ' : ''}monthly income comfortably supports this estimated EMI. Extremely low default risk detected.`);
        }
      } else {
        if (dti > 0.4) {
          const recommendedMax = (monthlyIncome * 0.4) / (r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
          messages.push(`Your Debt-to-Income ratio exceeds 40%. Lowering your requested loan amount to under ₹${Math.floor(recommendedMax).toLocaleString()} or extending the term will drastically improve approval odds.`);
        }
        if (finalPayload.cibilScore < 650) {
          messages.push(`Your ${hasCoApplicant ? 'combined ' : ''}CIBIL score is below our safe lending threshold. Paying down existing credit cards to boost your score by 50-100 points is highly recommended before re-applying.`);
        }
        if (finalPayload.loanTerm < 24 && finalPayload.loanAmount > monthlyIncome * 4) {
          messages.push(`Your aggressive repayment term creates a high cash-flow risk. Extending your loan term beyond 36 months will stabilize your monthly obligations.`);
        }
        if (messages.length === 0) {
          messages.push(`Your application falls marginally outside our risk tolerance based on aggregated macroeconomic factors.`);
        }
      }

      setResult({
        approved: data.approved,
        probability: data.probability,
        insights: { interestRate: rate, emi: emi, messages: messages },
        feature_importance: data.feature_importance,
        finalPayload: finalPayload
      });
    } catch (err: any) {
      setApiError('Network error. Ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const getCibilColor = (score: number) => {
    if (score >= 750) return 'text-emerald-400';
    if (score >= 650) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto"
    >
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

      {/* Top Banner for Open Banking */}
      <div className="mb-8 animate-fade-in-up">
        <button
          onClick={(e) => { e.preventDefault(); setIsBankModalOpen(true); }}
          className="w-full relative overflow-hidden bento-card p-4 sm:p-6 group cursor-pointer hover:border-emerald-500/50 transition-all border border-emerald-500/20 bg-emerald-500/5 text-left"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500/20 transition-colors">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">Auto-Fill via Open Banking</h3>
                <p className="text-sm text-slate-400">Securely connect your bank to instantly verify income, assets, and credit score.</p>
              </div>
            </div>
            <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
              <span className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 px-6 py-2.5 rounded-full border border-emerald-500/20 transition-colors">
                <Link className="h-4 w-4" /> Connect Bank
              </span>
            </div>
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Bento Card 1: Personal Details */}
        <div className="bento-card p-6 md:col-span-1 flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-3">
            <Users className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-200">Demographics</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FieldInput label="Age" name="age" value={formData.age} icon={Users} error={fieldErrors.age} onChange={handleChange} placeholder="Years (e.g. 25)" min={18} max={65} />
            <FieldInput label="Dependents" name="dependents" value={formData.dependents} icon={Users} error={fieldErrors.dependents} onChange={handleChange} placeholder="Number of dependents" max={10} />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="flex items-center gap-2 mb-1 text-slate-300 text-sm font-medium">
              <GraduationCap className="h-4 w-4 text-indigo-400" /> Education
            </label>
            <select name="education" value={formData.education} onChange={handleChange} className="form-select font-mono text-sm">
              <option value="Graduate">Graduate</option>
              <option value="Not Graduate">Not Graduate</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="flex items-center gap-2 mb-1 text-slate-300 text-sm font-medium">
              <Briefcase className="h-4 w-4 text-indigo-400" /> Employment
            </label>
            <select name="selfEmployed" value={formData.selfEmployed} onChange={handleChange} className="form-select font-mono text-sm">
              <option value="No">Salaried</option>
              <option value="Yes">Self Employed</option>
            </select>
          </div>
        </div>

        {/* Bento Card 2: Financial Request */}
        <div className="bento-card p-6 md:col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-3">
            <Activity className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-slate-200">Financial Request</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FieldInput label="Annual Income (₹)" name="annualIncome" value={formData.annualIncome} icon={DollarSign} error={fieldErrors.annualIncome} onChange={handleChange} placeholder="e.g. 500000" />
            <FieldInput label="Loan Amount (₹)" name="loanAmount" value={formData.loanAmount} icon={Calculator} error={fieldErrors.loanAmount} onChange={handleChange} placeholder="e.g. 200000" />
            <div className="sm:col-span-2">
              <FieldInput label="Loan Term (Months)" name="loanTerm" value={formData.loanTerm} icon={Clock} error={fieldErrors.loanTerm} onChange={handleChange} placeholder="Duration (e.g. 12)" />
            </div>
          </div>
        </div>

        {/* Bento Card 3: Asset Portfolio */}
        <div className="bento-card p-6 lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-amber-500/20 pb-3">
            <Landmark className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-slate-200">Asset Portfolio</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FieldInput label="Residential Assets (₹)" name="residentialAssets" value={formData.residentialAssets} icon={Building2} error={fieldErrors.residentialAssets} onChange={handleChange} />
            <FieldInput label="Commercial Assets (₹)" name="commercialAssets" value={formData.commercialAssets} icon={Building2} error={fieldErrors.commercialAssets} onChange={handleChange} />
            <FieldInput label="Luxury Assets (₹)" name="luxuryAssets" value={formData.luxuryAssets} icon={Gem} error={fieldErrors.luxuryAssets} onChange={handleChange} />
            <FieldInput label="Bank Assets (₹)" name="bankAssets" value={formData.bankAssets} icon={Landmark} error={fieldErrors.bankAssets} onChange={handleChange} />
          </div>
        </div>

        {/* Co-Applicant Pipeline Hook */}
        <div className="md:col-span-2 lg:col-span-3 mt-4 mb-2">
          <button
            type="button"
            onClick={() => setHasCoApplicant(!hasCoApplicant)}
            className={`w-full bento-card p-5 hover:bg-white/5 transition-all border flex justify-between items-center group ${hasCoApplicant ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-indigo-500/20'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-full transition-colors ${hasCoApplicant ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
                <UserPlus className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-200 block">Joint Application (Co-Applicant)</span>
                <span className="text-sm text-slate-400 font-light">Boost your aggregate income and asset pool by applying together.</span>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${hasCoApplicant ? 'bg-indigo-500' : 'bg-slate-700'}`}>
              <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${hasCoApplicant ? 'translate-x-6' : ''}`}></div>
            </div>
          </button>
        </div>

        <AnimatePresence>
          {hasCoApplicant && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 overflow-hidden"
            >
              {/* Secondary Applicant Block */}
              <div className="bento-card p-6 flex flex-col gap-6 border-indigo-500/20 bg-indigo-500/[0.02]">
                <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-3">
                  <UserPlus className="h-5 w-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-slate-200">Secondary Demographics</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FieldInput label="Co-App Age" name="age" value={coFormData.age} icon={Users} onChange={handleCoChange} placeholder="Years" />
                  <FieldInput label="Co-App Dependents" name="dependents" value={coFormData.dependents} icon={Users} onChange={handleCoChange} placeholder="Dependents" />

                  <div className="flex flex-col gap-1 w-full relative">
                    <label className="flex items-center gap-2 mb-1 text-slate-300 text-sm font-medium">
                      <GraduationCap className="h-4 w-4 text-indigo-400" /> Education
                    </label>
                    <select name="education" value={coFormData.education} onChange={handleCoChange} className="form-select font-mono text-sm py-2.5">
                      <option value="Graduate">Graduate</option>
                      <option value="Not Graduate">Not Graduate</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 w-full relative">
                    <label className="flex items-center gap-2 mb-1 text-slate-300 text-sm font-medium">
                      <Briefcase className="h-4 w-4 text-indigo-400" /> Employment
                    </label>
                    <select name="selfEmployed" value={coFormData.selfEmployed} onChange={handleCoChange} className="form-select font-mono text-sm py-2.5">
                      <option value="No">Salaried</option>
                      <option value="Yes">Self Employed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Secondary Financials */}
              <div className="bento-card p-6 flex flex-col gap-6 border-emerald-500/20 bg-emerald-500/[0.02]">
                <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-3">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-slate-200">Secondary Financials</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FieldInput label="Aggregated Income (₹)" name="annualIncome" value={coFormData.annualIncome} icon={DollarSign} onChange={handleCoChange} />
                  <FieldInput label="CIBIL Score" name="cibilScore" value={coFormData.cibilScore} icon={Activity} onChange={handleCoChange} />
                  <FieldInput label="Res. Assets (₹)" name="residentialAssets" value={coFormData.residentialAssets} icon={Building2} onChange={handleCoChange} />
                  <FieldInput label="Bank Assets (₹)" name="bankAssets" value={coFormData.bankAssets} icon={Landmark} onChange={handleCoChange} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bento Card 4: Credit Score & Submit */}
        <div className="bento-card p-6 md:col-span-2 lg:col-span-1 flex flex-col justify-between gap-6 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                <Activity className="h-4 w-4 text-indigo-400" />
                CIBIL Score
              </label>
              <span className={`text-xl font-bold font-mono ${getCibilColor(formData.cibilScore)}`}>
                {formData.cibilScore}
              </span>
            </div>
            <input
              type="range" min="300" max="900" step="1" name="cibilScore"
              value={formData.cibilScore} onChange={handleChange}
              className="mt-4"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
              <span>300</span>
              <span>900</span>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <button
              type="submit" disabled={loading}
              className="btn-cyber w-full flex items-center justify-center gap-2 relative group"
            >
              {loading ? (
                <>
                  <div className="laser-scan"></div>
                  <Cpu className="h-5 w-5 animate-pulse" />
                  <span className="font-mono">Processing...</span>
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  Evaluate Profile
                  <ChevronRight className="h-4 w-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all font-bold" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bento Card 5: System Telemetry */}
        <div className="bento-card p-6 hidden lg:flex md:col-span-2 lg:col-span-2 flex-col justify-between relative overflow-hidden bg-slate-900/30 border-slate-700/30 shadow-inner">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-300 font-mono tracking-widest uppercase">System Telemetry Interface</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-emerald-500 font-mono">CONNECTION ESTABLISHED</span>
            </div>
          </div>

          <div className="flex-1 font-mono text-xs space-y-4 pt-1">
            <div className="flex justify-between items-center text-slate-400">
              <span><span className="text-indigo-500 mr-2">»</span>Payload Architecture</span>
              <span className="text-slate-300">Neural-Net RF-[v2.1.0]</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span><span className="text-indigo-500 mr-2">»</span>Data Encryption Engine</span>
              <span className="text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 tracking-wider">ACTIVE 256-BIT</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span><span className="text-indigo-500 mr-2">»</span>Dynamic Payload Size</span>
              <span className="text-slate-300">{hasCoApplicant ? '2.4 KB (Dual-Node)' : '1.2 KB (Single-Node)'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span><span className="text-indigo-500 mr-2">»</span>Real-Time Validation</span>
              <span className={Object.keys(fieldErrors).length > 0 ? "text-rose-400" : "text-emerald-400"}>
                {Object.keys(fieldErrors).length > 0 ? "ERRORS DETECTED" : "SYNTAX OKAY"}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span><span className="text-indigo-500 mr-2">»</span>Estimated Engine Core Time</span>
              <span className="text-amber-400 animate-pulse">~235ms</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between text-[10px] font-mono text-slate-500">
            <span className="animate-pulse">Awaiting standard execution...</span>
            <span>UTC :: NODE.JS EDGE NETWORK</span>
          </div>
        </div>
      </form>

      {/* Result Section */}
      <AnimatePresence>
        {result && !apiError && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-8 space-y-6"
          >
            {/* Main Result Header */}
            <div className={`bento-card p-6 md:p-8 border ${result.approved ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-rose-500/40 bg-rose-500/5'}`}>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="shrink-0 p-4 rounded-full bg-slate-900/50 backdrop-blur shadow-xl relative overflow-hidden">
                  <div className={`absolute inset-0 opacity-20 blur-xl ${result.approved ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  {result.approved ? (
                    <CheckCircle className="h-12 w-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] relative z-10" />
                  ) : (
                    <XCircle className="h-12 w-12 text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)] relative z-10" />
                  )}
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className={`text-3xl font-bold tracking-tight ${result.approved ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.approved ? 'Application Approved' : 'Application Rejected'}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-slate-400">Confidence:</span>
                      <span className="font-mono text-xl font-bold bg-white/10 px-2 py-0.5 rounded text-white shadow-inner">
                        {result.probability.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Download PDF Button - Only shows if approved */}
                {result.approved && (
                  <div className="shrink-0 mt-4 md:mt-0 flex justify-center w-full md:w-auto">
                    <button
                      onClick={generateSanctionLetter}
                      className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all hover:scale-105"
                    >
                      <Download className="h-5 w-5" />
                      Download Sanction PDF
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Aura Optimizer Financial Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* EMI Calculation Box */}
              <div className="bento-card p-6 col-span-1 md:col-span-1 border-t border-slate-700/50">
                <div className="flex items-center gap-2 mb-4 text-slate-300">
                  <Target className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-semibold text-sm uppercase tracking-wider">Financial Projection</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="text-xs text-slate-400 font-mono mb-1">Estimated EMI</div>
                    <div className="text-2xl font-bold text-white flex items-center gap-1">
                      <DollarSign className="h-5 w-5 text-indigo-400" />
                      {Math.floor(result.insights.emi).toLocaleString()} <span className="text-sm font-normal text-slate-500">/mo</span>
                    </div>
                  </div>
                  <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                    <div className="text-xs text-slate-400 font-mono">Dynamic Interest Rate</div>
                    <div className={`text-lg font-bold ${result.insights.interestRate <= 9.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {result.insights.interestRate}%
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insight Box */}
              <div className="bento-card p-6 col-span-1 md:col-span-2 border-t border-slate-700/50 relative overflow-hidden group">
                {/* Decorative gradient for AI box */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700 pointer-events-none"></div>

                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className={`h-5 w-5 animate-pulse ${result.approved ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-200">Aura Optimizer Insights</h3>
                </div>

                <div className="space-y-3 relative z-10">
                  {result.insights.messages.map((msg, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-slate-900/40 p-3 rounded-lg border border-white/5">
                      <div className="shrink-0 mt-0.5">
                        {result.approved ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed font-light">
                        {msg}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* AI Decision Breakdown (XAI radar chart) */}
            {result.feature_importance && (
              <div className="bento-card mt-6 p-6 border-t border-slate-700/50 relative overflow-hidden shadow-xl shadow-black/40">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-200">XAI Decision Weights</h3>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={result.feature_importance.slice(0, 6)}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="feature" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                      <Radar name="Impact" dataKey="importance" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
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
              className="relative w-full max-w-md bento-card p-0 overflow-hidden border border-slate-700 shadow-2xl"
            >
              <div className="p-6 border-b border-slate-700/50 bg-slate-800/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-semibold text-slate-200">Secure Bank Connection</h3>
                </div>
                {!isSyncing && (
                  <button onClick={() => setIsBankModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                    <XCircle className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="p-6">
                {!isSyncing ? (
                  <>
                    <p className="text-sm text-slate-400 mb-6 text-center">Select your primary financial institution to instantly verify your profile.</p>
                    <div className="grid grid-cols-2 gap-4">
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                        <button
                          key={bank} onClick={handleBankSync}
                          className="flex flex-col items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all group"
                        >
                          <Building className="h-8 w-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                          <span className="text-xs font-semibold text-slate-300 text-center">{bank}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <RefreshCw className="h-10 w-10 text-emerald-400 animate-spin" />
                    <h3 className="text-lg font-bold text-slate-200">Analyzing Financial History...</h3>
                    <p className="text-sm text-slate-400 font-mono text-center">Establishing secure tunnel.<br />Retrieving verified income and assets.</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4" /> 256-bit AES Encryption
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Offline Error Modal */}
      <AnimatePresence>
        {showOfflineModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowOfflineModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bento-card p-0 overflow-hidden border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.15)]"
            >
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20">
                  <WifiOff className="h-8 w-8 text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2 font-mono">CONNECTION LOST</h3>
                <p className="text-sm text-slate-400 mb-8">
                  The NeuralCredit_ API is currently unreachable. Please check your network connection or try again when the server is back online.
                </p>
                <button
                  onClick={() => setShowOfflineModal(false)}
                  className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-mono font-bold rounded-lg border border-rose-500/30 transition-colors"
                >
                  ACKNOWLEDGE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
