import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const severityColors = {
    HIGH: { bg: 'bg-[#FF6B6B]', border: 'border-black', text: 'text-white' },
    MEDIUM: { bg: 'bg-[#FFD166]', border: 'border-black', text: 'text-black' },
    LOW: { bg: 'bg-white', border: 'border-black', text: 'text-black' },
};

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
                className={`flex items-center gap-2 py-1 px-1 cursor-pointer hover:bg-black hover:text-white transition-colors border-l-2 border-transparent hover:border-black ${isFolder ? 'font-black' : 'font-bold'}`}
                style={{ paddingLeft: `${level * 14}px` }}
            >
                <span className="text-[12px] shrink-0 font-mono">
                    {isFolder ? (expanded ? '[-]' : '[+]') : '>'}
                </span>
                <span className="text-[11px] truncate uppercase">{node.name}</span>
                {!isFolder && <span className="ml-auto text-[9px] font-black opacity-80 shrink-0 bg-yellow-300 text-black px-1 border border-black">{(node.size / 1024).toFixed(1)}K</span>}
            </div>
            {isFolder && expanded && node.children && (
                <div className="border-l-2 border-black ml-[18px]">
                    {node.children.map((child, i) => (
                        <FileTreeNode key={i} node={child} level={level + 1} onNodeClick={onNodeClick} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function RightPanel({ response, loading, selectedNode, onClearSelection, onIssueClick, onOpenSource }) {
    const [activeTab, setActiveTab] = useState('Overview');
    
    const tabs = [
        { id: 'Overview', label: 'DATA' },
        { id: 'Issues', label: 'BUGS' }
    ];

    // Global state
    const issues = response?.issues || [];

    const renderSelectedNode = () => {
        if (!selectedNode) return null;
        const node = response.nodes.find(n => n.id === selectedNode);
        if (!node) return null;

        const ov = node.overview || {};

        return (
            <div className="space-y-4">
                <div className="flex items-start gap-3 bg-[#118AB2] text-white border-[3px] border-black p-3 shadow-[4px_4px_0_0_#000]">
                    <button onClick={onClearSelection} className="w-6 h-6 shrink-0 bg-white border-2 border-black text-black font-black flex items-center justify-center hover:bg-black hover:text-white mt-1.5 transition-colors">X</button>
                    <div className="overflow-hidden">
                        <h3 className="font-black text-sm uppercase truncate w-full" title={node.name}>{node.name}</h3>
                        <p className="text-[9px] font-mono font-bold bg-black text-white px-1 mt-1 truncate inline-block max-w-full" title={node.id}>{node.id}</p>
                    </div>
                </div>

                <div className="flex gap-4 border-[3px] border-black p-3 bg-white">
                    <div className="flex-1">
                        <div className="text-[9px] font-black uppercase mb-1 bg-black text-white inline-block px-1">Role</div>
                        <div className="text-xs font-black uppercase text-[#EF476F]">{ov.role || 'NA'}</div>
                    </div>
                    <div className="w-1 h-auto bg-black"></div>
                    <div className="flex-1">
                        <div className="text-[9px] font-black uppercase mb-1 bg-black text-white inline-block px-1">Class</div>
                        <div className="text-xs font-black uppercase">{ov.structuralPosition || 'NA'}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-[#FFD166] border-[3px] border-black p-3 shadow-[3px_3px_0_0_#000]">
                        <h4 className="text-[10px] font-black uppercase border-b-2 border-black pb-1 mb-2">
                            Needs ({ov.dependencyCount || 0})
                        </h4>
                        <ul className="text-[10px] font-bold space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                            {ov.dependencies?.length ? ov.dependencies.map(d => <li key={d} className="truncate before:content-['>'] before:mr-1 uppercase">{d.split('/').pop()}</li>) : <li className="uppercase opacity-50">Empty</li>}
                        </ul>
                    </div>
                    <div className="bg-[#C2EABD] border-[3px] border-black p-3 shadow-[3px_3px_0_0_#000]">
                        <h4 className="text-[10px] font-black uppercase border-b-2 border-black pb-1 mb-2">
                            Used By ({ov.dependentCount || 0})
                        </h4>
                        <ul className="text-[10px] font-bold space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                            {ov.dependents?.length ? ov.dependents.map(d => <li key={d} className="truncate before:content-['<-'] before:mr-1 uppercase">{d.split('/').pop()}</li>) : <li className="uppercase opacity-50">Empty</li>}
                        </ul>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button 
                        onClick={onOpenSource}
                        className="flex-1 py-4 bg-[#F3C623] border-[3px] border-black text-black text-[11px] font-black uppercase hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all flex items-center justify-center gap-3 group"
                    >
                        🔍 VIEW SOURCE
                        <span className="bg-black text-white px-1.5 border border-white text-[9px] group-hover:bg-[#EF476F] transition-colors">{node.extension || 'JS'}</span>
                    </button>
                    <button 
                         onClick={() => {
                             const bestNext = response.nodes
                                 .filter(n => ov.dependencies?.includes(n.id))
                                 .sort((a,b) => b.importanceScore - a.importanceScore)[0];
                             if (bestNext) onIssueClick(bestNext.id);
                         }}
                         disabled={!ov.dependencies?.length}
                         className="px-4 bg-white border-[3px] border-black text-black text-[11px] font-black uppercase hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all flex items-center justify-center disabled:opacity-30 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_#000]"
                         title="Follow flow to next important module"
                    >
                        NEXT ↱
                    </button>
                </div>

                <div className="flex items-center gap-2 mt-2">
                     <button 
                         onClick={() => {
                             const bestPrev = response.nodes
                                 .filter(n => ov.dependents?.includes(n.id))
                                 .sort((a,b) => b.importanceScore - a.importanceScore)[0];
                             if (bestPrev) onIssueClick(bestPrev.id);
                         }}
                         disabled={!ov.dependents?.length}
                         className="flex-1 py-2 bg-white border-[3px] border-black text-black text-[10px] font-black uppercase hover:-translate-y-0.5 hover:-translate-x-0.5 shadow-[3px_3px_0_0_#000] hover:shadow-[5px_5px_0_0_#000] transition-all disabled:opacity-30"
                    >
                        ↰ PREV STEP
                    </button>
                    <p className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">Flow Navigation</p>
                </div>
            </div>
        );
    };

    const renderOverview = () => {
        const po = response.projectOverview;
        const vitals = response.vitals || {};
        if (!po) return null;

        return (
            <div className="space-y-5 h-full flex flex-col">
                <div className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0_0_#000]">
                    <h3 className="text-[11px] font-black uppercase bg-black text-white inline-block px-2 mb-3 tracking-widest">Repository Vitals</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-[#C2EABD] border-[3px] border-black p-2 shadow-[2px_2px_0_0_#000]">
                            <div className="text-[8px] font-black uppercase opacity-60">Breadth (Files)</div>
                            <div className="text-lg font-black">{vitals.totalFiles || 0}</div>
                        </div>
                        <div className="bg-[#118AB2] text-white border-[3px] border-black p-2 shadow-[2px_2px_0_0_#000]">
                            <div className="text-[8px] font-black uppercase opacity-80">Modular Density</div>
                            <div className="text-lg font-black">{vitals.density || 0}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="bg-black text-white p-2 border-2 border-black flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase">👑 God Object</span>
                            <span className="text-[10px] font-bold truncate max-w-[150px]">{vitals.godObject || 'None'}</span>
                        </div>
                        <div className="bg-white text-black p-2 border-2 border-black flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase">🛰️ Dep Hub</span>
                            <span className="text-[10px] font-bold truncate max-w-[150px]">{vitals.dependencyHub || 'None'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#F8F9FA] border-[3px] border-black p-4 shadow-[4px_4px_0_0_#000] flex-1 min-h-0 flex flex-col">
                    <h3 className="text-[12px] font-black uppercase border-b-[3px] border-black pb-1 mb-2">FILE TREE</h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-white border-2 border-black">
                        {po.fileTree ? (
                            <FileTreeNode node={po.fileTree} onNodeClick={onIssueClick} />
                        ) : (
                            <p className="text-xs font-bold uppercase text-center p-4">UNAVAILABLE</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderIssues = () => (
        <div className="space-y-4 pb-4">
            {issues.length === 0 ? (
                <div className="bg-[#C2EABD] border-[4px] border-black p-6 text-center shadow-[6px_6px_0_0_#000] mt-10 mx-2">
                    <div className="text-4xl mb-4 font-black">CLEAN!</div>
                    <p className="text-xs font-black uppercase bg-white border-2 border-black inline-block px-2 py-1">No structural flaws found</p>
                </div>
            ) : (
                issues.map((issue, i) => {
                    const c = severityColors[issue.severity] || severityColors.LOW;
                    return (
                        <div key={i} onClick={() => onIssueClick?.(issue.file)} className={`${c.bg} ${c.text} border-[3px] ${c.border} p-3 cursor-pointer hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] transition-all`}>
                            <div className="flex items-center justify-between border-b-[3px] border-black pb-2 mb-2">
                                <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">{issue.type}</span>
                                <span className="text-[10px] font-black uppercase underline decoration-2 underline-offset-2">{issue.severity}</span>
                            </div>
                            <p className="text-[11px] font-bold leading-tight mb-2">{issue.message}</p>
                            
                            {issue.isCycle && issue.cycleArr && (
                                <div className="mt-3 mb-3 bg-white border-2 border-dashed border-black p-2 font-mono text-[9px] text-black">
                                    {issue.cycleArr.map((p, idx) => (
                                        <span key={idx}>
                                            {p.split('/').pop()}
                                            {idx < issue.cycleArr.length - 1 && <span className="mx-1 font-black text-[#EF476F]">→</span>}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className="text-[9px] font-black uppercase bg-white text-black border-2 border-black px-1.5 py-1 truncate">{issue.file}</p>
                        </div>
                    );
                })
            )}
        </div>
    );

    return (
        <div className="w-[360px] h-full flex flex-col bg-[#F3C623] border-[3px] border-black shadow-[-6px_6px_0px_0px_rgba(0,0,0,1)] p-5 shrink-0 z-10 transition-all">
            <div className="flex border-[3px] border-black bg-white mb-5 shadow-[4px_4px_0_0_#000] p-1">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2 text-[11px] font-black uppercase transition-all
                            ${activeTab === tab.id
                                ? 'bg-black text-white'
                                : 'bg-transparent text-black hover:bg-gray-200'
                            }`}>
                        {tab.label}
                        {tab.id === 'Issues' && response?.issues?.length > 0 && (
                            <span className="bg-[#FF6B6B] text-white px-1.5 font-bold ml-1 border border-transparent">{response.issues.length}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-1 min-h-0 custom-scrollbar pb-2">
                {loading ? (
                    <div className="flex justify-center items-center h-full bg-white border-[4px] border-black shadow-[6px_6px_0_0_#000]">
                        <div className="animate-bounce font-black text-2xl uppercase">LOADING.</div>
                    </div>
                ) : response ? (
                    response.error ? (
                        <div className="bg-[#FF6B6B] border-[4px] border-black p-5 text-center shadow-[6px_6px_0_0_#000] text-white">
                            <h2 className="font-black text-2xl mb-2">ERROR</h2>
                            <p className="font-bold text-xs uppercase bg-black px-2 py-1">{response.error}</p>
                        </div>
                    ) : selectedNode ? (
                        renderSelectedNode()
                    ) : (
                        activeTab === 'Overview' ? renderOverview() : renderIssues()
                    )
                ) : (
                    <div className="h-full flex flex-col items-center justify-center border-4 border-black border-dashed bg-[#FFF9CC] p-4 text-center">
                        <div className="text-4xl mb-4 font-black">?</div>
                        <p className="font-black text-xs uppercase bg-black text-white px-2 py-1">WAITING FOR INPUT</p>
                    </div>
                )}
            </div>
        </div>
    );
}
