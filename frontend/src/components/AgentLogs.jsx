import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentLogs({ loading, isComplete }) {
    const [visibleSteps, setVisibleSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);

    const AGENT_STEPS = useMemo(() => {
        return [
            { agent: 'Ingester', message: 'Downloading and extracting repository files...', color: 'text-cyan-400' },
            { agent: 'Parser', message: 'Traversing file tree and reading source modules...', color: 'text-emerald-400' },
            { agent: 'Analyzer', message: 'Building dependency graph and mapping imports...', color: 'text-purple-400' },
            { agent: 'Classifier', message: 'Categorizing files into architectural layers...', color: 'text-yellow-400' },
            { agent: 'Critic', message: 'Detecting issues and evaluating code health...', color: 'text-red-400' },
            { agent: 'Reporter', message: 'Compiling structural analysis report...', color: 'text-green-400' }
        ];
    }, []);

    useEffect(() => {
        if (loading) {
            setVisibleSteps([]);
            setCurrentStep(0);

            const interval = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev < AGENT_STEPS.length) {
                        setVisibleSteps(steps => [...steps, AGENT_STEPS[prev]]);
                        return prev + 1;
                    }
                    clearInterval(interval);
                    return prev;
                });
            }, 500);

            return () => clearInterval(interval);
        }
    }, [loading, AGENT_STEPS]);

    useEffect(() => {
        if (isComplete && visibleSteps.length < AGENT_STEPS.length) {
            setVisibleSteps([...AGENT_STEPS]);
            setCurrentStep(AGENT_STEPS.length);
        }
    }, [isComplete, AGENT_STEPS]);

    if (!loading && visibleSteps.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3"
        >
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
                Agent Activity
            </h4>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                    {visibleSteps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex items-start gap-2 text-[11px] font-mono ${step.highlight ? 'bg-blue-500/8 rounded px-1.5 py-0.5 -mx-1.5' : ''}`}
                        >
                            <span className={`${step.color} font-bold shrink-0`}>[{step.agent}]</span>
                            <span className={`leading-tight ${step.highlight ? 'text-blue-300 font-semibold' : 'text-zinc-400'}`}>{step.message}</span>
                            {i === visibleSteps.length - 1 && loading && (
                                <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-zinc-500">▌</motion.span>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isComplete && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        className="text-[11px] font-mono text-green-400 font-bold mt-1 pt-1 border-t border-zinc-700/50">
                        ✓ Analysis complete
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
