import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentLogs({ loading, isComplete }) {
    const [visibleSteps, setVisibleSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);

    const AGENT_STEPS = useMemo(() => {
        return [
            { agent: 'Ingester', message: 'Downloading and extracting repository files...', color: 'text-blue-600' },
            { agent: 'Parser', message: 'Traversing file tree and reading source modules...', color: 'text-emerald-600' },
            { agent: 'Analyzer', message: 'Building dependency graph and mapping imports...', color: 'text-purple-600' },
            { agent: 'Classifier', message: 'Categorizing files into architectural layers...', color: 'text-amber-600' },
            { agent: 'Critic', message: 'Detecting issues and evaluating code health...', color: 'text-rose-600' },
            { agent: 'Reporter', message: 'Compiling structural analysis report...', color: 'text-teal-600' }
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
            className="bg-slate-50 border border-slate-200 rounded-lg p-3"
        >
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}></span>
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
                            className={`flex items-start gap-2 text-[11px] font-mono ${step.highlight ? 'bg-blue-100 rounded px-1.5 py-0.5 -mx-1.5' : ''}`}
                        >
                            <span className={`${step.color} font-bold shrink-0`}>[{step.agent}]</span>
                            <span className={`leading-tight ${step.highlight ? 'text-blue-700 font-semibold' : 'text-slate-500'}`}>{step.message}</span>
                            {i === visibleSteps.length - 1 && loading && (
                                <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-slate-400">▌</motion.span>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isComplete && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        className="text-[11px] font-mono text-emerald-600 font-bold mt-1 pt-1 border-t border-slate-200">
                        ✓ Analysis complete
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
