import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        const days = Math.floor(hrs / 24);
        return `${days}d`;
    };

    return (
        <div className="w-[340px] h-full flex flex-col gap-5 bg-[#FFDEE9] border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 shrink-0 z-10 transition-all">
            {/* Header */}
            <div className="flex items-center justify-between border-b-[3px] border-black pb-4">
                <div>
                    <h1 className="text-3xl font-black text-black tracking-tighter uppercase leading-none" style={{ textShadow: "2px 2px 0px #FFF" }}>
                        CodeMap
                    </h1>
                    <p className="text-[10px] text-black font-bold uppercase mt-1 tracking-widest bg-white inline-block px-1 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        Structural Engine
                    </p>
                </div>
                
                {/* History Button */}
                <button
                    onClick={() => setHistoryOpen(!historyOpen)}
                    className="relative w-10 h-10 border-[3px] border-black bg-[#C2EABD] text-black font-black flex items-center justify-center transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#000000] active:translate-y-0 active:translate-x-0 active:shadow-none"
                >
                    H
                    {history.length > 0 && !historyOpen && (
                        <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#FF6B6B] border-2 border-black text-white text-[9px] flex items-center justify-center font-bold">
                            {history.length}
                        </span>
                    )}
                </button>
            </div>

            {/* History Panel */}
            <AnimatePresence>
                {historyOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, borderBottomWidth: 0 }}
                        animate={{ opacity: 1, height: 'auto', borderBottomWidth: 3 }}
                        exit={{ opacity: 0, height: 0, borderBottomWidth: 0 }}
                        className="overflow-hidden border-black border-l-0 border-r-0 border-t-0"
                    >
                        <div className="py-2 space-y-2 mb-2">
                            <div className="flex items-center justify-between px-1">
                                <h4 className="text-[11px] font-black text-black uppercase tracking-widest bg-yellow-300 px-1 border border-black">History</h4>
                                {history.length > 0 && (
                                    <button onClick={onClearHistory} className="text-[10px] text-white bg-black px-2 py-0.5 font-bold uppercase hover:bg-red-500">Wipe</button>
                                )}
                            </div>
                            {history.length === 0 ? (
                                <p className="text-[11px] font-bold text-black py-2 bg-white border-2 border-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">EMPTY</p>
                            ) : (
                                <div className="space-y-2 max-h-[160px] overflow-y-auto px-1 pb-1">
                                    {history.map((entry, i) => (
                                        <button
                                            key={entry.url + i}
                                            onClick={() => { onHistorySelect(entry); setHistoryOpen(false); }}
                                            className="w-full text-left bg-white border-2 border-black p-2 hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[11px] text-black font-black truncate max-w-[170px]">
                                                    {entry.name}
                                                </span>
                                                <span className="text-[9px] text-white bg-black px-1 font-bold">{formatTimeAgo(entry.timestamp)}</span>
                                            </div>
                                            <div className="flex gap-2 text-[9px] font-black">
                                                <span className="bg-[#C2EABD] border border-black px-1">{entry.files} files</span>
                                                <span className={`border border-black px-1 ${entry.issues > 0 ? 'bg-[#FF6B6B] text-white' : 'bg-gray-200'}`}>{entry.issues} issues</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mode Switcher */}
            <div className="flex gap-2 mt-2">
                <button
                    onClick={() => { setMode('github'); setUrlError(''); }}
                    className={`flex-1 py-1.5 text-xs font-black uppercase border-[3px] border-black transition-all ${mode === 'github' ? 'bg-[#FFD166] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5 -translate-x-0.5' : 'bg-white hover:bg-gray-100'}`}
                >
                    GitHub
                </button>
                <button
                    onClick={() => { setMode('local'); setUrlError(''); }}
                    className={`flex-1 py-1.5 text-xs font-black uppercase border-[3px] border-black transition-all ${mode === 'local' ? 'bg-[#118AB2] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5 -translate-x-0.5' : 'bg-white hover:bg-gray-100'}`}
                >
                    Local ZIP
                </button>
            </div>

            {/* Input Form */}
            <div className="flex flex-col gap-3 mt-2">
                {mode === 'github' ? (
                    <div>
                        <input
                            type="text"
                            value={repoUrl}
                            onChange={(e) => { setRepoUrl(e.target.value); setUrlError(''); }}
                            placeholder="GITHUB URL (HTTPS)"
                            className="w-full bg-white border-[3px] border-black p-3 text-sm font-bold text-black placeholder:text-gray-400 placeholder:font-black focus:outline-none focus:shadow-[4px_4px_0_0_#000] focus:-translate-y-1 focus:-translate-x-1 transition-all"
                        />
                    </div>
                ) : (
                    <div className="bg-white border-[3px] border-black p-3 hover:shadow-[4px_4px_0_0_#000] transition-all">
                        <input
                            type="file"
                            accept=".zip"
                            onChange={(e) => { setFile(e.target.files[0]); setUrlError(''); }}
                            className="block w-full text-[11px] font-black text-black file:mr-2 file:py-1 file:px-2 file:border-[2px] file:border-black file:text-[11px] file:font-black file:uppercase file:bg-[#FFD166] hover:file:bg-[#FFC03A] cursor-pointer"
                        />
                        {file && (
                            <div className="text-[10px] font-black bg-[#C2EABD] border-2 border-black inline-block px-2 py-0.5 mt-2 truncate max-w-full">
                                {file.name}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {urlError && (
                <div className="bg-[#FF6B6B] border-[3px] border-black text-white font-black text-xs p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    ERROR: {urlError}
                </div>
            )}

            <div className="flex-1"></div> {/* Spacer since agent logs are gone */}

            {/* Analyze Button */}
            <button
                onClick={handleAnalyze}
                disabled={loading}
                className={`w-full py-4 text-sm uppercase font-black border-[4px] border-black transition-all ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#EF476F] text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none'}`}
            >
                {loading ? "PROCESSING..." : "ANALYZE NOW >>"}
            </button>
        </div>
    );
}
