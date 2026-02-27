import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Database, Activity, Shield, Trash2, Calendar, DollarSign, BrainCircuit, BarChart2, PieChart as PieChartIcon, CheckCircle, XCircle, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface HistoryRecord {
    id: number;
    loan_amount: number;
    annual_income: number;
    cibil_score: number;
    approved: number;
    probability: number;
    created_at: string;
    source: string;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);

    useEffect(() => {
        // Fetch both history and analytics in parallel
        Promise.all([
            fetch('/api/predictions/history').then(res => res.json()),
            fetch('/api/analytics').then(res => res.json())
        ])
            .then(([historyData, analyticsData]) => {
                if (Array.isArray(historyData)) setHistory(historyData);
                if (analyticsData && !analyticsData.error) setAnalytics(analyticsData);
            })
            .catch(err => console.error("Could not load dashboard data", err))
            .finally(() => setLoading(false));
    }, []);

    const COLORS = ['#8b5cf6', '#10b981', '#f43f5e', '#f59e0b'];

    const exportToCSV = () => {
        if (!history || history.length === 0) return;

        // 1. Define headers
        const headers = ['ID', 'Date', 'Source', 'Loan Amount', 'Annual Income', 'CIBIL Score', 'Probability (%)', 'Approved'];

        // 2. Map data to rows
        const rows = history.map(row => [
            row.id,
            new Date(row.created_at).toISOString(),
            row.source,
            row.loan_amount,
            row.annual_income,
            row.cibil_score,
            row.probability.toFixed(2),
            row.approved === 1 ? 'Yes' : 'No'
        ]);

        // 3. Combine headers and rows into CSV string
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // 4. Create Blob and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `NeuralCredit_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="mb-10 text-center animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-indigo-400 text-xs font-mono mb-4">
                        <Database className="h-4 w-4 text-indigo-400" />
                        SELECT * FROM predictions
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        <span className="text-white">Neural</span>
                        <span className="gradient-text-header">Logs</span>
                        <span className="text-indigo-500">_</span>
                    </h1>
                    <p className="mt-2 text-slate-400 font-light">
                        Real-time querying of historic and active model inferences.
                    </p>
                </div>

                {/* --- Admin Analytics Dashboard (New Features) --- */}
                {analytics && (
                    <div className="mb-12 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {/* KPI 1 */}
                            <div className="bento-card p-6 border-t border-indigo-500/30">
                                <div className="text-slate-400 font-mono text-xs uppercase tracking-wider mb-2">Total Inferences</div>
                                <div className="text-3xl font-bold text-white flex items-center gap-2">
                                    <Database className="h-6 w-6 text-indigo-400" />
                                    {analytics.overview?.total || 0}
                                </div>
                            </div>
                            {/* KPI 2 */}
                            <div className="bento-card p-6 border-t border-emerald-500/30">
                                <div className="text-slate-400 font-mono text-xs uppercase tracking-wider mb-2">Global Approval Rate</div>
                                <div className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
                                    <Activity className="h-6 w-6" />
                                    {analytics.overview?.approvalRate || 0}%
                                </div>
                            </div>
                            {/* KPI 3 (System Health) */}
                            <div className="bento-card p-6 border-t border-amber-500/30">
                                <div className="text-slate-400 font-mono text-xs uppercase tracking-wider mb-2">Engine Status</div>
                                <div className="text-lg font-bold text-amber-400 flex items-center gap-2">
                                    <BrainCircuit className="h-6 w-6" />
                                    Online (Python WAL DB)
                                </div>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Bar Chart: Approval by CIBIL */}
                            <div className="bento-card p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <BarChart2 className="h-5 w-5 text-indigo-400" />
                                    <h3 className="text-lg font-semibold text-slate-200">Outcomes by CIBIL Tier</h3>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.cibilChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                            <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                            <Bar dataKey="Approved" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                                            <Bar dataKey="Rejected" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Pie Chart: Average Loan by Employment */}
                            <div className="bento-card p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <PieChartIcon className="h-5 w-5 text-indigo-400" />
                                    <h3 className="text-lg font-semibold text-slate-200">Average Loan (Employment Distribution)</h3>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analytics.employmentPieData}
                                                cx="50%" cy="50%"
                                                innerRadius={60} outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                nameKey="name"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {analytics.employmentPieData?.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => `₹${value.toLocaleString()}`}
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* Database Table */}
                <div className="bento-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="p-6 border-b border-white/5 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Approved
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Rejected
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={exportToCSV}
                                disabled={history.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium rounded-lg border border-slate-700 hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="h-4 w-4" />
                                Export CSV
                            </button>
                            <div className="text-xs font-mono text-slate-500">
                                LIMIT 100
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950/50">
                                    <th className="py-4 px-6 text-slate-400 font-mono text-xs font-semibold uppercase tracking-wider border-b border-white/5">Time</th>
                                    <th className="py-4 px-6 text-slate-400 font-mono text-xs font-semibold uppercase tracking-wider border-b border-white/5">Source</th>
                                    <th className="py-4 px-6 text-slate-400 font-mono text-xs font-semibold uppercase tracking-wider border-b border-white/5">Parameters</th>
                                    <th className="py-4 px-6 text-slate-400 font-mono text-xs font-semibold uppercase tracking-wider border-b border-white/5 text-center">Confidence</th>
                                    <th className="py-4 px-6 text-slate-400 font-mono text-xs font-semibold uppercase tracking-wider border-b border-white/5 text-right">Result</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <>
                                        {[...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="py-4 px-6"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                                                <td className="py-4 px-6"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                                                <td className="py-4 px-6">
                                                    <div className="flex gap-4">
                                                        <div className="h-4 bg-slate-800 rounded w-12"></div>
                                                        <div className="h-4 bg-slate-800 rounded w-12"></div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 flex justify-center"><div className="h-4 bg-slate-800 rounded w-10"></div></td>
                                                <td className="py-4 px-6"><div className="h-4 bg-slate-800 rounded w-12 ml-auto"></div></td>
                                            </tr>
                                        ))}
                                    </>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-500 font-mono">
                                            0 rows returned.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((record, index) => (
                                        <motion.tr
                                            key={record.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 + 0.2 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="py-4 px-6 text-slate-400 text-sm whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-slate-500" />
                                                    {new Date(record.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {record.source === 'You' ? (
                                                    <span className="inline-flex py-1 px-2 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
                                                        Active Session
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex py-1 px-2 rounded-md bg-slate-800 text-slate-400 text-xs font-medium border border-slate-700">
                                                        System Data
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-slate-300 text-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1" title="Loan Amount">
                                                        <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                                                        {(record.loan_amount / 1000).toFixed(0)}k
                                                    </div>
                                                    <div className="flex items-center gap-1" title="CIBIL Score">
                                                        <Activity className="h-3.5 w-3.5 text-slate-500" />
                                                        {record.cibil_score}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="font-mono text-sm text-slate-300 bg-white/5 px-2 py-1 rounded">
                                                    {record.probability.toFixed(0)}%
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right font-mono font-bold">
                                                {record.approved ? (
                                                    <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">Pass</span>
                                                ) : (
                                                    <span className="text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]">Fail</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <footer className="mt-auto py-8 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-slate-500 text-xs font-mono">NeuralCredit_ Log Server / Encrypted Connection</p>
                </div>
            </footer>
        </div>
    );
}
