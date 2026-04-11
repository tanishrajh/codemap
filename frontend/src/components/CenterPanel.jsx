import React, { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion, AnimatePresence } from 'framer-motion';

export default function CenterPanel({ response, selectedNode, onNodeSelected, loading }) {
    const containerRef = useRef();
    const fgRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [legendOpen, setLegendOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showExport, setShowExport] = useState(false);

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
        let sizeMultiplier = 1.0;

        if (selectedNode) {
            if (node.id === selectedNode) { 
                opacity = 1.0; 
                sizeMultiplier = 1.3; // Extra pop for the pivot node
            } else {
                const isNeighbor = response?.edges?.some(e =>
                    (e.source === selectedNode && e.target === node.id) || (e.target === selectedNode && e.source === node.id) ||
                    (e.source?.id === selectedNode && e.target?.id === node.id) || (e.target?.id === selectedNode && e.source?.id === node.id)
                );
                opacity = isNeighbor ? 1.0 : 0.05; // Aggressive fade
                sizeMultiplier = isNeighbor ? 1.15 : 1.0;
            }
        } else if (node.importanceLevel === 'LOW') { opacity = 0.35; }

        let baseColor = '#475569', glowColor = 'rgba(71,85,105,0.3)';
        switch (node.category) {
            case 'Core Logic': baseColor = '#1d4ed8'; glowColor = 'rgba(29,78,216,0.3)'; break;
            case 'UI': baseColor = '#047857'; glowColor = 'rgba(4,120,87,0.3)'; break;
            case 'Backend': baseColor = '#7e22ce'; glowColor = 'rgba(126,34,206,0.3)'; break;
            case 'Utility': baseColor = '#d97706'; glowColor = 'rgba(217,119,6,0.3)'; break;
            case 'Config': baseColor = '#475569'; glowColor = 'rgba(71,85,105,0.3)'; break;
            case 'Data': baseColor = '#c2410c'; glowColor = 'rgba(194,65,12,0.3)'; break;
        }

        let size = 5.5, hasGlow = false;
        if (node.importanceLevel === 'HIGH') { size = 12; hasGlow = true; }
        else if (node.importanceLevel === 'MEDIUM') { size = 7; }
        else if (node.importanceLevel === 'LOW') { size = 3; }

        size *= sizeMultiplier;

        if (selectedNode === node.id) {
            ctx.globalAlpha = 1.0;
            ctx.beginPath(); ctx.arc(node.x, node.y, size * 2.2, 0, 2 * Math.PI); ctx.fillStyle = 'rgba(0,0,0,1)'; ctx.fill();
            ctx.beginPath(); ctx.arc(node.x, node.y, size * 1.6, 0, 2 * Math.PI); ctx.fillStyle = 'rgba(255,255,255,1)'; ctx.fill();
        } else {
            // Draw harsh inner shadow/border for neo brutalism feel on nodes
            ctx.globalAlpha = opacity;
            ctx.beginPath(); ctx.arc(node.x, node.y, size + 1.5, 0, 2 * Math.PI); ctx.fillStyle = '#000000'; ctx.fill();
        }

        ctx.globalAlpha = opacity;
        ctx.beginPath(); ctx.arc(node.x, node.y, size, 0, 2 * Math.PI); ctx.fillStyle = baseColor; ctx.fill();

        if ((node.importanceLevel === 'HIGH' && globalScale > 1.5) || selectedNode === node.id) {
            ctx.globalAlpha = opacity * 1.0;
            ctx.font = `bold ${Math.max(10 / globalScale, 3)}px monospace`;
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            const label = node.id.split('/').pop();
            ctx.fillText(label, node.x, node.y + size + 8 / globalScale);
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
        const cat = node.category ? `<br/><span style="color:#000; font-weight: 800; background: yellow; padding: 0 4px; border: 1px solid black; margin-top: 4px; display: inline-block;">${node.category}</span>` : '';
        const imp = node.importanceLevel ? `<br/><span style="color:#FFF; background: black; font-weight: 800; padding: 0 4px; margin-top: 4px; display: inline-block;">IMP: ${node.importanceLevel}</span>` : '';
        return `<div style="background:#FFF; padding:12px; border:4px solid #000; font-family:monospace; font-size:12px; box-shadow:4px 4px 0px 0px rgba(0,0,0,1); color:#000; text-transform: uppercase;">
              <span style="color:#000; font-weight:900; font-size: 14px;">${node.id}</span>${cat}${imp}
            </div>`;
    }, []);

    const getLinkColor = useCallback((link) => {
        if (!selectedNode) return 'rgba(0,0,0,0.5)';
        
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        if (sourceId === selectedNode) return 'rgba(217,119,6,1)'; // Yellow arrow OUT
        if (targetId === selectedNode) return 'rgba(29,78,216,1)'; // Blue arrow IN
        return 'rgba(0,0,0,0.1)';
    }, [selectedNode]);

    const getLinkWidth = useCallback((link) => {
        if (!selectedNode) return 1.5;
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        return (sourceId === selectedNode || targetId === selectedNode) ? 4.0 : 0.5;
    }, [selectedNode]);

    const getLinkDirectionalParticles = useCallback((link) => {
        if (!selectedNode) return 0;
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        return (sourceId === selectedNode || targetId === selectedNode) ? 4 : 0;
    }, [selectedNode]);

    const getLinkDirectionalParticleWidth = useCallback((link) => {
        if (!selectedNode) return 0;
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        return (sourceId === selectedNode || targetId === selectedNode) ? 7 : 0;
    }, [selectedNode]);

    if (!response || !response.nodes || response.nodes.length === 0) {
        return (
            <div className="flex-1 flex flex-col p-5 relative h-full w-full" ref={containerRef}>
                <div className="flex-1 bg-[#118AB2] border-[4px] border-black shadow-[6px_6px_0_0_#000] flex flex-col items-center justify-center text-white gap-4">
                    {loading ? (
                        <>
                            <div className="w-16 h-16 bg-white border-4 border-black animate-spin shadow-[4px_4px_0_0_#000]"></div>
                            <p className="text-white text-xl font-black bg-black px-3 py-1 uppercase border-2 border-transparent">
                                ANALYZING CODE...
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-24 h-24 bg-[#FFD166] border-[4px] border-black shadow-[6px_6px_0_0_#000] flex items-center justify-center text-black text-6xl font-black uppercase">?</div>
                            <p className="text-sm text-black bg-[#C2EABD] font-black uppercase border-[3px] border-black px-4 py-2 shadow-[4px_4px_0_0_#000] mt-2">
                                NO DATA - SELECT A REPOSITORY
                            </p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const { nodes, edges } = response;
    const graphData = {
        nodes: nodes.map(n => ({ ...n })),
        links: edges.map(e => ({ source: e.source, target: e.target }))
    };

    const handleSearchSelect = (node) => {
        if (!fgRef.current || !node) return;
        
        // Use coordinates if available, otherwise force simulation to settle a bit
        const x = node.x ?? 0;
        const y = node.y ?? 0;
        
        fgRef.current.centerAt(x, y, 1000);
        fgRef.current.zoom(2.5, 1000);
        onNodeSelected(node.id);
        setSearchTerm('');
        setShowSuggestions(false);
    };

    const suggestions = searchTerm 
        ? nodes.filter(n => n.id.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
        : [];

    const exportJSON = () => {
        const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'codemap-analysis.json';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setShowExport(false);
    };

    const exportCSV = () => {
        if (!response.issues?.length) return;
        const headers = 'File,Issue,Severity,Type\n';
        const rows = response.issues.map(iss => 
            `"${iss.file}","${iss.message.replace(/"/g, '""')}","${iss.severity}","${iss.type}"`
        ).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'codemap-issues.csv';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setShowExport(false);
    };

    return (
        <div className="flex-1 overflow-hidden relative bg-white border-[4px] border-black shadow-[8px_8px_0_0_#000]" ref={containerRef}>
            <motion.div initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="w-full h-full">
                <ForceGraph2D
                    ref={fgRef} width={dimensions.width} height={dimensions.height} graphData={graphData}
                    nodeCanvasObject={drawNode} nodePointerAreaPaint={drawNodePointer} nodeLabel={generateTooltip}
                    onNodeClick={(node) => onNodeSelected(node.id)} onBackgroundClick={() => onNodeSelected(null)}
                    
                    linkDirectionalArrowLength={selectedNode ? 10 : 6} 
                    linkDirectionalArrowRelPos={1}
                    linkColor={getLinkColor} 
                    linkWidth={getLinkWidth}
                    linkDirectionalParticles={getLinkDirectionalParticles}
                    linkDirectionalParticleWidth={getLinkDirectionalParticleWidth}
                    linkDirectionalParticleSpeed={0.015}
                    
                    backgroundColor="#ffffff" cooldownTicks={100} d3VelocityDecay={0.15}
                />
            </motion.div>

            {/* Collapsible Legend */}
            <div className="absolute top-5 left-5 z-10 font-mono">
                <button onClick={() => setLegendOpen(!legendOpen)} className="bg-[#FFD166] border-[3px] border-black px-4 py-2 shadow-[4px_4px_0_0_#000] text-black font-black uppercase hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_6px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all flex items-center gap-2">
                    KEY <span className="text-black text-[10px]">{legendOpen ? '▲' : '▼'}</span>
                </button>
                <AnimatePresence>
                    {legendOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                            className="mt-3 bg-white border-[3px] border-black p-4 shadow-[4px_4px_0_0_#000] origin-top-left overflow-hidden">
                            <div className="flex gap-4 mb-3 border-b-2 border-black pb-3">
                                <div className="space-y-2 text-[11px] font-black uppercase">
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#1d4ed8] border-2 border-black"></div>CORE</div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#047857] border-2 border-black"></div>UI</div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#7e22ce] border-2 border-black"></div>BACKEND</div>
                                </div>
                                <div className="space-y-2 text-[11px] font-black uppercase">
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#d97706] border-2 border-black"></div>UTIL</div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#475569] border-2 border-black"></div>CONFIG</div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#c2410c] border-2 border-black"></div>DATA</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 text-[10px] uppercase font-black">
                                <div className="flex items-center gap-2"><div className="w-5 h-5 bg-black border-2 border-black"></div>HIGH IMPACT</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-black border-2 border-black"></div>MED IMPACT</div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-black border-2 border-black"></div>LOW IMPACT</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Smart Search */}
            <div className="absolute top-5 right-5 z-20 w-64 font-mono">
                <div className="relative">
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="SEARCH FILES..."
                        className="w-full bg-white border-[3px] border-black p-3 text-xs font-black uppercase outline-none shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] transition-all placeholder:text-gray-400"
                    />
                    <div className="absolute top-0 right-0 h-full flex items-center pr-3 pointer-events-none">
                        <span className="text-lg">🔍</span>
                    </div>

                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                className="absolute top-full left-0 w-full mt-2 bg-[#F3C623] border-[3px] border-black shadow-[4px_4px_0_0_#000] overflow-hidden"
                            >
                                {suggestions.map((suggestion, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => handleSearchSelect(suggestion)}
                                        className="p-2 border-b-2 border-black last:border-0 hover:bg-black hover:text-white cursor-pointer group flex items-center justify-between transition-colors"
                                    >
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-black truncate">{suggestion.id.split('/').pop()}</span>
                                            <span className="text-[7px] opacity-70 truncate uppercase">{suggestion.id}</span>
                                        </div>
                                        <div className="w-4 h-4 bg-white border-2 border-black flex items-center justify-center text-[8px] font-black group-hover:bg-yellow-400 group-hover:text-black">
                                            →
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Export Menu */}
            <div className="absolute bottom-5 left-5 z-20 font-mono">
                <button 
                    onClick={() => setShowExport(!showExport)}
                    className="bg-[#EF476F] border-[3px] border-black px-4 py-2 shadow-[4px_4px_0_0_#000] text-white font-black uppercase hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_6px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all flex items-center gap-2"
                >
                    EXPORT <span className="text-[10px]">{showExport ? '▼' : '▲'}</span>
                </button>
                <AnimatePresence>
                    {showExport && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-0 mb-3 w-48 bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000] p-1"
                        >
                            {[
                                { label: 'Analysis (JSON)', action: exportJSON, icon: '📄' },
                                { label: 'Bugs List (CSV)', action: exportCSV, icon: '📊', disabled: !response.issues?.length }
                            ].map((btn, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={btn.action}
                                    disabled={btn.disabled}
                                    className={`w-full p-2 text-[10px] font-black uppercase border-b-2 border-black last:border-0 text-left hover:bg-black hover:text-white transition-colors flex items-center gap-2
                                        ${btn.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                                >
                                    <span>{btn.icon}</span> {btn.label}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
