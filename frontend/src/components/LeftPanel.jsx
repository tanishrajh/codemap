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
        <div className="w-80 border-r border-zinc-800 p-5 flex flex-col gap-5 bg-zinc-900/50">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 tracking-tight">
                        AGCIA
                    </h1>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Autonomous Goal-Driven Codebase Intelligence Agent</p>
                </div>
                {/* History Toggle */}
                <button
                    onClick={() => setHistoryOpen(!historyOpen)}
                    className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 border ${historyOpen
                        ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                        : 'bg-zinc-800/60 border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                        }`}
                    title="Analysis History"
                >
                    <span className="text-sm">🕘</span>
                    {history.length > 0 && !historyOpen && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-500 text-[8px] text-white font-bold flex items-center justify-center">{history.length}</span>
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
                        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recent Analyses</h4>
                                {history.length > 0 && (
                                    <button onClick={onClearHistory} className="text-[9px] text-zinc-600 hover:text-red-400 transition-colors font-bold uppercase">Clear</button>
                                )}
                            </div>
                            {history.length === 0 ? (
                                <p className="text-[10px] text-zinc-600 text-center py-2 italic">No history yet. Analyze a repo to get started.</p>
                            ) : (
                                <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar">
                                    {history.map((entry, i) => (
                                        <motion.button
                                            key={entry.url + i}
                                            onClick={() => { onHistorySelect(entry); setHistoryOpen(false); }}
                                            whileHover={{ x: 2 }}
                                            className="w-full text-left bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-700/40 hover:border-zinc-600/50 rounded-lg p-2.5 transition-all duration-200 group"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[11px] text-zinc-200 font-semibold truncate max-w-[170px] group-hover:text-blue-400 transition-colors">
                                                    {entry.name}
                                                </span>
                                                <span className="text-[9px] text-zinc-600 font-mono shrink-0 ml-2">{formatTimeAgo(entry.timestamp)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[9px] text-zinc-500">
                                                <span className="flex items-center gap-1">
                                                    <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                                                    {entry.files} files
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className={`w-1 h-1 rounded-full ${entry.issues > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
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
            <div className="flex bg-zinc-800/80 rounded-lg p-1 gap-1">
                <button
                    onClick={() => { setMode('github'); setUrlError(''); }}
                    className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-all duration-200 ${mode === 'github' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'}`}
                >
                    GitHub
                </button>
                <button
                    onClick={() => { setMode('local'); setUrlError(''); }}
                    className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-all duration-200 ${mode === 'local' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'}`}
                >
                    Local
                </button>
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-4">
                {mode === 'github' ? (
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">GitHub Repo URL</label>
                        <input
                            type="text"
                            value={repoUrl}
                            onChange={(e) => { setRepoUrl(e.target.value); setUrlError(''); }}
                            placeholder="https://github.com/user/repo"
                            className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-200"
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Upload Local Repo (.zip)</label>
                        <input
                            type="file"
                            accept=".zip"
                            onChange={(e) => { setFile(e.target.files[0]); setUrlError(''); }}
                            className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 file:transition-colors file:duration-200 cursor-pointer"
                        />
                        {file && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-green-400 mt-2 truncate">
                                ✓ {file.name}
                            </motion.p>
                        )}
                    </div>
                )}
            </div>

            {/* Error Message */}
            {urlError && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {urlError}
                </motion.p>
            )}

            {/* Agent Logs */}
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                <AgentLogs loading={loading} isComplete={analysisComplete} />
            </div>

            {/* Analyze Button */}
            <motion.button
                onClick={handleAnalyze}
                disabled={loading}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 disabled:shadow-none"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-zinc-500 border-t-zinc-300 rounded-full" />
                        Analyzing...
                    </span>
                ) : "Analyze"}
            </motion.button>
        </div>
    );
}
