import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function SourceDrawer({ isOpen, onClose, node }) {
    if (!node) return null;

    const copyToClipboard = () => {
        if (!node.content) return;
        navigator.clipboard.writeText(node.content);
        // We could add a "Copied!" toast here if we had one
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-[2px]"
                    />

                    {/* Drawer */}
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-[600px] bg-white border-l-[6px] border-black z-[101] shadow-[-10px_0_0_0_rgba(0,0,0,0.1)] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 bg-[#F3C623] border-b-[6px] border-black flex items-center justify-between">
                            <div className="overflow-hidden">
                                <h2 className="text-sm font-black uppercase truncate" title={node.id}>
                                    {node.id.split('/').pop()}
                                </h2>
                                <p className="text-[10px] font-bold opacity-70 truncate uppercase">{node.id}</p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={copyToClipboard}
                                    className="bg-white border-[3px] border-black px-3 py-1 text-[10px] font-black uppercase hover:bg-black hover:text-white transition-all shadow-[3px_3px_0_0_#000] active:shadow-none active:translate-y-1 active:translate-x-1"
                                >
                                    Copy Code
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="bg-[#EF476F] text-white border-[3px] border-black px-3 py-1 text-[10px] font-black uppercase hover:bg-black transition-all shadow-[3px_3px_0_0_#000] active:shadow-none active:translate-y-1 active:translate-x-1"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto bg-[#1e1e1e] p-2 custom-scrollbar relative">
                            <div className="absolute top-4 right-4 z-10 px-2 py-1 bg-[#F3C623] border-2 border-black text-[9px] font-black uppercase">
                                {node.extension || 'JS'}
                            </div>
                            <SyntaxHighlighter
                                language={node.extension?.replace('.', '') || 'javascript'}
                                style={vscDarkPlus}
                                showLineNumbers={true}
                                customStyle={{
                                    margin: 0,
                                    padding: '1.5rem',
                                    fontSize: '12px',
                                    fontFamily: '"Fira Code", monospace',
                                    background: 'transparent',
                                    lineHeight: '1.6'
                                }}
                            >
                                {node.content || '// No content available for this file.'}
                            </SyntaxHighlighter>
                        </div>

                        {/* Footer / Stats */}
                        <div className="p-4 bg-white border-t-[4px] border-black flex items-center justify-between text-[10px] font-black uppercase">
                            <div className="flex gap-4">
                                <span>Size: {((node.content?.length || 0) / 1024).toFixed(1)} KB</span>
                                <span>Lines: {node.content?.split('\n').length || 0}</span>
                            </div>
                            <div className="bg-black text-white px-2 py-0.5">
                                Type: {node.overview?.role || 'Module'}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
