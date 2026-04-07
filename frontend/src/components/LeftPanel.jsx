import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AgentLogs from './AgentLogs';

export default function LeftPanel({ mode, setMode, repoUrl, setRepoUrl, file, setFile, onAnalyze, loading, analysisComplete, history = [], onHistorySelect, onClearHistory }) {
    const [urlError, setUrlError] = useState('');
    const [historyOpen, setHistoryOpen] = useState(false);
    const debounceRef = useRef(false);

    const handleAnalyze = () => {
        if (debounceRef.current) return;
        if (mode === 'github') {
            if (!repoUrl.trim()) { setUrlError('Please enter a GitHub repository URL.'); return; }
            if (!repoUrl.includes('github.com')) { setUrlError('Please enter a valid GitHub URL.'); return; }
        } else if (!file) {
            setUrlError('Please select a .zip file to upload.'); return;
        }
        setUrlError('');
        debounceRef.current = true;
        setTimeout(() => { debounceRef.current = false; }, 3000);
        onAnalyze();
    };

    const formatTimeAgo = (ts) => {
        const diff = Date.now() - ts;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <div className="w-80 h-full rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col gap-6 bg-white shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 tracking-tight">
                        AGCIA
                    </h1>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Autonomous Goal-Driven Codebase Intelligence Agent</p>
                </div>
                {/* History Toggle */}
                <button
                    onClick={() => setHistoryOpen(!historyOpen)}
                    className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border ${historyOpen
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    title="Analysis History"
                >
                    <span className="text-sm">🕘</span>
                    {history.length > 0 && !historyOpen && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-[8px] text-white font-bold flex items-center justify-center">{history.length}</span>
                    )}
                </button>
            </div>

            {/* History Panel */}
            <AnimatePresence>
                {historyOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-3 space-y-2">
                            <div className="flex items-center justify-between mb-1 px-1">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Analyses</h4>
                                {history.length > 0 && (
                                    <button onClick={onClearHistory} className="text-[9px] text-slate-500 hover:text-red-500 transition-colors font-bold uppercase">Clear</button>
                                )}
                            </div>
                            {history.length === 0 ? (
                                <p className="text-[10px] text-slate-400 text-center py-2 italic flex items-center justify-center h-12">No history yet</p>
                            ) : (
                                <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar">
                                    {history.map((entry, i) => (
                                        <motion.button
                                            key={entry.url + i}
                                            onClick={() => { onHistorySelect(entry); setHistoryOpen(false); }}
                                            whileHover={{ x: 2 }}
                                            className="w-full text-left bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 rounded-xl p-2.5 transition-all duration-200 group"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[11px] text-slate-700 font-semibold truncate max-w-[170px] group-hover:text-blue-600 transition-colors">
                                                    {entry.name}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-mono shrink-0 ml-2">{formatTimeAgo(entry.timestamp)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[9px] text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                                                    {entry.files} files
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${entry.issues > 0 ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                                                    {entry.issues} issues
                                                </span>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mode Switcher */}
            <div className="flex bg-slate-100 border border-slate-200 rounded-full p-1 gap-1">
                <button
                    onClick={() => { setMode('github'); setUrlError(''); }}
                    className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-full transition-all duration-200 ${mode === 'github' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    GitHub
                </button>
                <button
                    onClick={() => { setMode('local'); setUrlError(''); }}
                    className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-full transition-all duration-200 ${mode === 'local' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    Local
                </button>
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-4">
                {mode === 'github' ? (
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest pl-1">GitHub Repo URL</label>
                        <input
                            type="text"
                            value={repoUrl}
                            onChange={(e) => { setRepoUrl(e.target.value); setUrlError(''); }}
                            placeholder="https://github.com/user/repo"
                            className="w-full bg-white border border-slate-300 rounded-full px-5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest pl-1">Upload Local Repo (.zip)</label>
                        <input
                            type="file"
                            accept=".zip"
                            onChange={(e) => { setFile(e.target.files[0]); setUrlError(''); }}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 file:transition-colors file:duration-200 cursor-pointer"
                        />
                        {file && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-emerald-600 mt-3 truncate font-medium pl-1">
                                ✓ {file.name}
                            </motion.p>
                        )}
                    </div>
                )}
            </div>

            {/* Error Message */}
            {urlError && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 shadow-sm">
                    {urlError}
                </motion.p>
            )}

            {/* Agent Logs */}
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 bg-slate-50 rounded-2xl border border-slate-200 p-1">
                <AgentLogs loading={loading} isComplete={analysisComplete} />
            </div>

            {/* Analyze Button */}
            <motion.button
                onClick={handleAnalyze}
                disabled={loading}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="w-full py-3.5 mt-auto bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-full transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none tracking-wide"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-slate-400 border-t-white rounded-full" />
                        Analyzing...
                    </span>
                ) : "Analyze Repository"}
            </motion.button>
        </div>
    );
}
