import React, { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion, AnimatePresence } from 'framer-motion';

export default function CenterPanel({ response, selectedNode, onNodeSelected, loading }) {
    const containerRef = useRef();
    const fgRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [legendOpen, setLegendOpen] = useState(true);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            if (entries.length > 0) {
                setDimensions({ width: entries[0].contentRect.width, height: entries[0].contentRect.height });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (fgRef.current && response?.nodes?.length > 0) {
            fgRef.current.d3Force('charge').strength(-400);
            fgRef.current.d3Force('link').distance(80);
            setTimeout(() => { if (fgRef.current) fgRef.current.zoomToFit(1000, 50); }, 100);
        }
    }, [response]);

    const drawNode = useCallback((node, ctx, globalScale) => {
        if (node.x === undefined || node.y === undefined) return;

        let opacity = 1.0;
        if (selectedNode) {
            if (node.id === selectedNode) { opacity = 1.0; }
            else {
                const isNeighbor = response?.edges?.some(e =>
                    (e.source === selectedNode && e.target === node.id) || (e.target === selectedNode && e.source === node.id) ||
                    (e.source?.id === selectedNode && e.target?.id === node.id) || (e.target?.id === selectedNode && e.source?.id === node.id)
                );
                opacity = isNeighbor ? 0.6 : 0.12;
            }
        } else if (node.importanceLevel === 'LOW') { opacity = 0.35; }

        let baseColor = '#94a3b8', glowColor = 'rgba(148,163,184,0.3)';
        switch (node.category) {
            case 'Core Logic': baseColor = '#3b82f6'; glowColor = 'rgba(59,130,246,0.3)'; break;
            case 'UI': baseColor = '#10b981'; glowColor = 'rgba(16,185,129,0.3)'; break;
            case 'Backend': baseColor = '#8b5cf6'; glowColor = 'rgba(139,92,246,0.3)'; break;
            case 'Utility': baseColor = '#f59e0b'; glowColor = 'rgba(245,158,11,0.3)'; break;
            case 'Config': baseColor = '#94a3b8'; glowColor = 'rgba(148,163,184,0.3)'; break;
            case 'Data': baseColor = '#f97316'; glowColor = 'rgba(249,115,22,0.3)'; break;
        }

        let size = 5.5, hasGlow = false;
        if (node.importanceLevel === 'HIGH') { size = 12; hasGlow = true; }
        else if (node.importanceLevel === 'MEDIUM') { size = 7; }
        else if (node.importanceLevel === 'LOW') { size = 3; }

        // Selected node ring
        if (selectedNode === node.id) {
            ctx.globalAlpha = 1.0;
            ctx.beginPath(); ctx.arc(node.x, node.y, size * 2.2, 0, 2 * Math.PI); ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fill();
            ctx.beginPath(); ctx.arc(node.x, node.y, size * 1.5, 0, 2 * Math.PI); ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.2; ctx.stroke();
        }

        if (hasGlow) {
            ctx.globalAlpha = opacity;
            ctx.beginPath(); ctx.arc(node.x, node.y, size * 1.6, 0, 2 * Math.PI); ctx.fillStyle = glowColor; ctx.fill();
        }

        ctx.globalAlpha = opacity;
        ctx.beginPath(); ctx.arc(node.x, node.y, size, 0, 2 * Math.PI); ctx.fillStyle = baseColor; ctx.fill();

        // Label for HIGH importance nodes when zoomed in
        if (node.importanceLevel === 'HIGH' && globalScale > 1.5) {
            ctx.globalAlpha = opacity * 0.9;
            ctx.font = `${Math.max(10 / globalScale, 2.5)}px Inter, sans-serif`;
            ctx.fillStyle = '#1e293b';
            ctx.textAlign = 'center';
            const label = node.id.split('/').pop();
            ctx.fillText(label, node.x, node.y + size + 6 / globalScale);
        }

        ctx.globalAlpha = 1.0;
    }, [selectedNode, response?.edges]);

    const drawNodePointer = useCallback((node, color, ctx) => {
        if (node.x === undefined || node.y === undefined) return;
        let size = 5.5;
        if (node.importanceLevel === 'HIGH') size = 12 * 1.6;
        else if (node.importanceLevel === 'MEDIUM') size = 7;
        else if (node.importanceLevel === 'LOW') size = 5;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(node.x, node.y, size, 0, 2 * Math.PI); ctx.fill();
    }, []);

    const generateTooltip = useCallback((node) => {
        const cat = node.category ? `<br/><span style="color:#64748b">Category: <b style="color:#334155">${node.category}</b></span>` : '';
        const imp = node.importanceLevel ? `<br/><span style="color:#64748b">Importance: <b style="color:#3b82f6">${node.importanceLevel}</b></span>` : '';
        return `<div style="background:rgba(255,255,255,0.95); padding:10px 14px; border-radius:8px; border:1px solid #e2e8f0; font-family:'JetBrains Mono',monospace; font-size:11px; backdrop-filter:blur(8px); box-shadow:0 8px 32px rgba(0,0,0,0.1); color:#334155;">
              <span style="color:#0f172a; font-weight:700;">${node.id}</span>${cat}${imp}
            </div>`;
    }, []);

    // Empty / Loading state
    if (!response || !response.nodes || response.nodes.length === 0) {
        return (
            <div className="flex-1 flex flex-col p-6 bg-slate-50 relative" ref={containerRef}>
                <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3">
                    {loading ? (
                        <motion.div className="flex flex-col items-center gap-3">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full" />
                            <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }} className="text-blue-600 text-sm font-medium tracking-widest uppercase">
                                Analyzing Repository...
                            </motion.p>
                        </motion.div>
                    ) : (
                        <>
                            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-2xl text-slate-300">⬡</div>
                            <p className="text-sm text-slate-500 font-medium">Enter a repository and goal to begin analysis</p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const { nodes, edges } = response;
    const graphData = {
        nodes: nodes.map(n => ({ id: n.id, category: n.category, importanceLevel: n.importanceLevel })),
        links: edges.map(e => ({ source: e.source, target: e.target }))
    };

    return (
        <div className="flex-1 overflow-hidden relative bg-[#f8fafc]" ref={containerRef}>
            <motion.div initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="w-full h-full">
                <ForceGraph2D
                    ref={fgRef} width={dimensions.width} height={dimensions.height} graphData={graphData}
                    nodeCanvasObject={drawNode} nodePointerAreaPaint={drawNodePointer} nodeLabel={generateTooltip}
                    onNodeClick={(node) => onNodeSelected(node.id)} onBackgroundClick={() => onNodeSelected(null)}
                    linkDirectionalArrowLength={3} linkDirectionalArrowRelPos={1}
                    linkColor={() => 'rgba(148,163,184,0.4)'} linkWidth={0.8}
                    backgroundColor="#f8fafc" cooldownTicks={100} d3VelocityDecay={0.15}
                />
            </motion.div>

            {/* Collapsible Legend */}
            <div className="absolute top-4 left-4 z-10">
                <button onClick={() => setLegendOpen(!legendOpen)} className="bg-white/90 border border-slate-200 rounded-lg px-3 py-1.5 backdrop-blur-md shadow text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-white transition-all duration-200 flex items-center gap-2">
                    Legend <span className="text-slate-400 text-[10px]">{legendOpen ? '▲' : '▼'}</span>
                </button>
                <AnimatePresence>
                    {legendOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                            className="mt-1 bg-white/90 border border-slate-200 rounded-lg p-3 backdrop-blur-md shadow pointer-events-none overflow-hidden">
                            <div className="flex gap-5 mb-2.5 border-b border-slate-100 pb-2.5">
                                <div className="space-y-1.5 text-[11px]">
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span className="text-slate-600">Core Logic</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div><span className="text-slate-600">UI</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-500 rounded-full"></div><span className="text-slate-600">Backend</span></div>
                                </div>
                                <div className="space-y-1.5 text-[11px]">
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"></div><span className="text-slate-600">Utility</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-slate-400 rounded-full"></div><span className="text-slate-600">Config</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-orange-500 rounded-full"></div><span className="text-slate-600">Data</span></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-[10px]">
                                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-slate-400 rounded-full"></div><span className="text-slate-500">HIGH</span></div>
                                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div><span className="text-slate-400">MED</span></div>
                                <div className="flex items-center gap-1"><div className="w-1 h-1 bg-slate-200 rounded-full"></div><span className="text-slate-400">LOW</span></div>
                                <span className="text-slate-400 ml-1">← importance</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
