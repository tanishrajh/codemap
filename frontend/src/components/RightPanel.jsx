import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const severityColors = {
    HIGH: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-500' },
    MEDIUM: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-500' },
    LOW: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', text: 'text-zinc-400', dot: 'bg-zinc-500' },
};

const tabAnim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.2 } };

const FileTreeNode = ({ node, level = 0, onNodeClick }) => {
    const [expanded, setExpanded] = useState(level < 1);

    if (node.name === 'root') {
        return (
            <div className="w-full">
                {node.children?.map((child, i) => <FileTreeNode key={i} node={child} level={level + 1} onNodeClick={onNodeClick} />)}
            </div>
        );
    }

    const isFolder = node.type === 'folder';

    return (
        <div className="w-full">
            <div
                onClick={() => {
                    if (isFolder) setExpanded(!expanded);
                    else if (onNodeClick && node.path) onNodeClick(node.path);
                }}
                className={`flex items-center gap-1.5 py-1 px-2 rounded hover:bg-zinc-800/50 cursor-pointer transition-colors ${isFolder ? 'text-zinc-300' : 'text-zinc-400 hover:text-blue-400'}`}
                style={{ paddingLeft: `${level * 12}px` }}
            >
                <span className="w-4 h-4 flex items-center justify-center text-[10px] opacity-70 shrink-0">
                    {isFolder ? (expanded ? '📂' : '📁') : '📄'}
                </span>
                <span className={`text-[11px] truncate ${isFolder ? 'font-semibold' : 'font-mono'}`}>{node.name}</span>
                {!isFolder && <span className="ml-auto text-[9px] text-zinc-600 font-mono tabular-nums opacity-60 shrink-0">{(node.size / 1024).toFixed(1)} KB</span>}
            </div>
            {isFolder && expanded && node.children && (
                <div className="border-l border-zinc-800/50 ml-[18px]">
                    {node.children.map((child, i) => (
                        <FileTreeNode key={i} node={child} level={level + 1} onNodeClick={onNodeClick} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function RightPanel({ response, loading, selectedNode, onClearSelection, onIssueClick }) {
    const [activeTab, setActiveTab] = useState('Overview');
    
    const tabs = [
        { id: 'Overview', icon: '📊', label: 'Overview' },
        { id: 'Issues', icon: '⚠️', label: 'Issues' }
    ];

    const issues = response?.issues || [];

    // ── Selected Node Detail ──
    const renderSelectedNode = () => {
        if (!selectedNode) return null;
        const node = response.nodes.find(n => n.id === selectedNode);
        if (!node) return null;

        const ov = node.overview || {};

        return (
            <motion.div {...tabAnim} className="space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-3">
                        <button onClick={onClearSelection} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-zinc-700">←</button>
                        <div>
                            <h3 className="font-bold text-sm text-zinc-100 truncate max-w-[240px]">{node.name}</h3>
                            <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[240px]">{node.id}</p>
                        </div>
                    </div>
                    {ov.isEntry && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full font-bold border border-blue-500/20 uppercase tracking-widest">Entry</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/50">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Role</div>
                        <div className="text-xs font-bold text-teal-400">{ov.role || 'Module'}</div>
                    </div>
                    <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/50">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Structure</div>
                        <div className="text-xs font-bold text-amber-400">{ov.structuralPosition || 'Unclassified'}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-800/20 border border-zinc-700/40 rounded-xl p-3">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            Dependencies ({ov.dependencyCount || 0})
                        </h4>
                        <ul className="text-[10px] text-zinc-500 truncate space-y-1">
                            {ov.dependencies?.length ? ov.dependencies.map(d => <li key={d} className="truncate" title={d}>{d.split('/').pop()}</li>) : <li>None</li>}
                        </ul>
                    </div>
                    <div className="bg-zinc-800/20 border border-zinc-700/40 rounded-xl p-3">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            Dependents ({ov.dependentCount || 0})
                        </h4>
                        <ul className="text-[10px] text-zinc-500 truncate space-y-1">
                            {ov.dependents?.length ? ov.dependents.map(d => <li key={d} className="truncate" title={d}>{d.split('/').pop()}</li>) : <li>None</li>}
                        </ul>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Module Issues</h4>
                    {(!node.issues || node.issues.length === 0) ? (
                        <div className="bg-emerald-500/5 text-emerald-400/60 p-3 rounded-lg border border-emerald-500/10 text-[10px] flex items-center gap-2">
                            <span>✓</span> No structural issues found.
                        </div>
                    ) : (
                        node.issues.map((issueText, i) => {
                            return (
                                <motion.div key={i} className="bg-yellow-500/10 border-yellow-500/20 border rounded-xl p-3 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0"></div>
                                        <p className="text-[11px] text-yellow-400 leading-relaxed font-bold">{issueText}</p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </motion.div>
        );
    };

    // ── Overview Tab ──
    const renderOverview = () => {
        const po = response.projectOverview;
        if (!po) return null;

        return (
            <motion.div {...tabAnim} className="space-y-4">
                <div className="bg-zinc-800/20 rounded-xl p-4 border border-zinc-800/60">
                    <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Repository Health</h3>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                            { label: 'Files', value: response.nodes.length || 0, color: 'text-zinc-200' },
                            { label: 'Edges', value: response.edges.length || 0, color: 'text-teal-400' },
                            { label: 'Issues', value: response.issues?.length || 0, color: 'text-red-400' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-zinc-900/40 rounded-lg p-2.5 border border-zinc-800/50">
                                <div className="text-zinc-500 mb-0.5 text-[9px] uppercase tracking-wider font-bold">{stat.label}</div>
                                <div className={`text-xl font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-800/80">
                    <h3 className="font-bold text-sm text-zinc-200 mb-2">Code Architecture</h3>
                    <p className="text-zinc-500 mb-3 text-[10px] border-l-2 border-zinc-700 pl-2 italic">Hierarchical view of the repository components.</p>
                    <div className="bg-zinc-950/40 rounded-lg border border-zinc-800/50 overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                        {po.fileTree ? (
                            <FileTreeNode node={po.fileTree} onNodeClick={onIssueClick} />
                        ) : (
                            <p className="text-xs text-zinc-500 p-2 italic text-center">Tree mapping unavailable.</p>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    // ── Issues Tab ──
    const renderIssues = () => (
        <motion.div {...tabAnim} className="space-y-3">
            {issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-500 gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl">✓</div>
                    <p className="text-sm font-medium">No major issues detected</p>
                    <p className="text-xs text-zinc-600">Good structure!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {issues.map((issue, i) => {
                        const c = severityColors[issue.severity] || severityColors.LOW;

                        return (
                            <motion.div key={i} onClick={() => onIssueClick?.(issue.file)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                className={`${c.bg} ${c.border} border rounded-xl p-3.5 cursor-pointer transition-all duration-200 hover:brightness-110`}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${c.text}`}>{issue.type}</span>
                                    </div>
                                    <span className={`${c.bg} ${c.border} border px-2 py-0.5 rounded-md text-[9px] font-bold ${c.text}`}>{issue.severity}</span>
                                </div>
                                <p className="text-[11px] text-zinc-300 leading-relaxed">{issue.message}</p>
                                <p className="text-[10px] text-zinc-500 mt-1.5 font-mono truncate">{issue.file}</p>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );

    // ── Main Render ──
    return (
        <div className="w-[400px] border-l border-zinc-800 p-5 flex flex-col bg-zinc-900/40 backdrop-blur-sm z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.2)]">
            <div className="flex bg-zinc-800/60 rounded-xl p-1 gap-1 mb-4">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all duration-200 rounded-lg
                            ${activeTab === tab.id
                                ? 'bg-zinc-700 text-white shadow-md'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/40'
                            }`}>
                        <span className="text-sm">{tab.icon}</span>
                        {tab.label}
                        {tab.id === 'Issues' && response?.issues?.length > 0 && (
                            <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full text-[9px] font-bold ml-0.5">{response.issues.length}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="w-8 h-8 border-2 border-zinc-700 border-t-blue-500 rounded-full" />
                        <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-400 text-sm font-medium tracking-widest uppercase">
                            Analyzing...
                        </motion.p>
                    </div>
                ) : response ? (
                    response.error ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 text-xl">✕</div>
                            <p className="text-sm text-red-400 font-medium">{response.error}</p>
                            <p className="text-xs text-zinc-500">Please check the URL or try another repository.</p>
                        </div>
                    ) : selectedNode ? (
                        <AnimatePresence mode="wait">{renderSelectedNode()}</AnimatePresence>
                    ) : (
                        <AnimatePresence mode="wait">
                            {activeTab === 'Overview' && renderOverview()}
                            {activeTab === 'Issues' && renderIssues()}
                        </AnimatePresence>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-4">
                        <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-zinc-800 flex items-center justify-center text-2xl text-zinc-700">⬡</div>
                        <p className="text-sm font-medium text-zinc-500">No analysis data yet</p>
                        <p className="text-xs text-zinc-600 text-center px-6">Enter a GitHub URL or upload a .zip file in the left panel to start.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
