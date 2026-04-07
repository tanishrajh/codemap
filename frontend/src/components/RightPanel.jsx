import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const severityColors = {
    HIGH: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', dot: 'bg-rose-500' },
    MEDIUM: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', dot: 'bg-amber-500' },
    LOW: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', dot: 'bg-slate-500' },
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
                className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors ${isFolder ? 'text-slate-700' : 'text-slate-500 hover:text-blue-600'}`}
                style={{ paddingLeft: `${level * 12}px` }}
            >
                <span className="w-4 h-4 flex items-center justify-center text-[10px] opacity-70 shrink-0">
                    {isFolder ? (expanded ? '📂' : '📁') : '📄'}
                </span>
                <span className={`text-[11px] truncate ${isFolder ? 'font-semibold' : 'font-mono'}`}>{node.name}</span>
                {!isFolder && <span className="ml-auto text-[9px] text-slate-400 font-mono tabular-nums opacity-60 shrink-0">{(node.size / 1024).toFixed(1)} KB</span>}
            </div>
            {isFolder && expanded && node.children && (
                <div className="border-l border-slate-200 ml-[18px]">
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
            <motion.div {...tabAnim} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                        <button onClick={onClearSelection} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors border border-slate-200">←</button>
                        <div>
                            <h3 className="font-bold text-sm text-slate-800 truncate max-w-[240px]">{node.name}</h3>
                            <p className="text-[10px] text-slate-500 font-mono truncate max-w-[240px]">{node.id}</p>
                        </div>
                    </div>
                    {ov.isEntry && <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-bold border border-blue-200 uppercase tracking-widest">Entry</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Role</div>
                        <div className="text-xs font-bold text-blue-600">{ov.role || 'Module'}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Structure</div>
                        <div className="text-xs font-bold text-indigo-600">{ov.structuralPosition || 'Unclassified'}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            Dependencies ({ov.dependencyCount || 0})
                        </h4>
                        <ul className="text-[10px] text-slate-600 truncate space-y-1">
                            {ov.dependencies?.length ? ov.dependencies.map(d => <li key={d} className="truncate" title={d}>{d.split('/').pop()}</li>) : <li className="italic text-slate-400">None</li>}
                        </ul>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            Dependents ({ov.dependentCount || 0})
                        </h4>
                        <ul className="text-[10px] text-slate-600 truncate space-y-1">
                            {ov.dependents?.length ? ov.dependents.map(d => <li key={d} className="truncate" title={d}>{d.split('/').pop()}</li>) : <li className="italic text-slate-400">None</li>}
                        </ul>
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Module Issues</h4>
                    {(!node.issues || node.issues.length === 0) ? (
                        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl border border-emerald-100 text-[11px] flex items-center gap-2 font-medium">
                            <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">✓</div>
                            No structural issues found
                        </div>
                    ) : (
                        node.issues.map((issueText, i) => {
                            return (
                                <motion.div key={i} className="bg-amber-50 border-amber-200 border rounded-2xl p-4 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                                        <p className="text-[11px] text-amber-700 leading-relaxed font-bold">{issueText}</p>
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
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Repository Health</h3>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                            { label: 'Files', value: response.nodes.length || 0, color: 'text-slate-800' },
                            { label: 'Edges', value: response.edges.length || 0, color: 'text-blue-600' },
                            { label: 'Issues', value: response.issues?.length || 0, color: 'text-rose-600' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center text-center">
                                <div className="text-slate-400 mb-1 text-[9px] uppercase tracking-wider font-bold">{stat.label}</div>
                                <div className={`text-xl font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col h-[450px]">
                    <div className="mb-3">
                        <h3 className="font-bold text-sm text-slate-800">Code Architecture</h3>
                        <p className="text-slate-500 text-[10px] italic">Hierarchical view of components.</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 flex-1 overflow-y-auto custom-scrollbar p-3">
                        {po.fileTree ? (
                            <FileTreeNode node={po.fileTree} onNodeClick={onIssueClick} />
                        ) : (
                            <p className="text-xs text-slate-400 p-2 italic text-center">Tree mapping unavailable.</p>
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
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-2xl shadow-sm border border-emerald-100">✓</div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-700">No major issues detected</p>
                        <p className="text-xs text-slate-400 mt-1">Excellent architecture!</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {issues.map((issue, i) => {
                        const c = severityColors[issue.severity] || severityColors.LOW;

                        return (
                            <motion.div key={i} onClick={() => onIssueClick?.(issue.file)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                className={`${c.bg} ${c.border} border rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${c.dot}`}></div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${c.text}`}>{issue.type}</span>
                                    </div>
                                    <span className={`bg-white/60 ${c.border} border px-2.5 py-0.5 rounded-full text-[9px] font-bold ${c.text}`}>{issue.severity}</span>
                                </div>
                                <p className="text-[12px] text-slate-700 leading-relaxed font-medium mb-1.5">{issue.message}</p>
                                <p className="text-[10px] text-slate-400 font-mono truncate bg-white/40 p-1.5 rounded-lg border border-slate-100/50">{issue.file}</p>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );

    // ── Main Render ──
    return (
        <div className="w-[400px] rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col bg-white shrink-0">
            <div className="flex bg-slate-100 border border-slate-200 rounded-full p-1 gap-1 mb-5 shrink-0">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-all duration-200 rounded-full
                            ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}>
                        <span className="text-sm">{tab.icon}</span>
                        {tab.label}
                        {tab.id === 'Issues' && response?.issues?.length > 0 && (
                            <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[9px] font-bold ml-1">{response.issues.length}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="w-10 h-10 border-2 border-slate-200 border-t-blue-600 rounded-full" />
                        <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-blue-600 text-sm font-bold tracking-widest uppercase">
                            Analyzing...
                        </motion.p>
                    </div>
                ) : response ? (
                    response.error ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 text-2xl shadow-sm border border-rose-100">✕</div>
                            <p className="text-sm text-rose-600 font-bold">{response.error}</p>
                            <p className="text-xs text-slate-500">Please check the URL or try another repository.</p>
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
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-5">
                        <div className="w-20 h-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center text-3xl text-slate-300">⬡</div>
                        <div className="text-center px-4">
                            <p className="text-sm font-bold text-slate-600">No analysis data yet</p>
                            <p className="text-xs text-slate-400 mt-1">Enter a GitHub URL or upload a .zip file in the left panel to start.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
