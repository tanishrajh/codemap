import React, { useState } from 'react';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import SourceDrawer from './components/SourceDrawer';
import { processRepository } from './services/apiService';

function App() {
  const [mode, setMode] = useState('github'); // 'github' or 'local'
  const [repoUrl, setRepoUrl] = useState('');
  const [file, setFile] = useState(null);

  // Global state
  const [loading, setLoading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [response, setResponse] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('codemap_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const saveToHistory = (data, requestData) => {
    const newEntry = {
      timestamp: Date.now(),
      name: requestData.url ? requestData.url.split('/').pop() : requestData.fileName,
      url: requestData.url || requestData.fileName,
      files: data.nodes?.length || 0,
      issues: data.issues?.length || 0,
      data: data
    };
    const updated = [newEntry, ...history.filter(h => h.url !== newEntry.url)].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('codemap_history', JSON.stringify(updated));
  };

  const handleHistorySelect = (entry) => {
    setLoading(true);
    setAnalysisComplete(false);
    setSelectedNode(null);
    if (entry.url && entry.url.includes('github')) {
      setMode('github'); setRepoUrl(entry.url);
    } else {
      setMode('local');
    }
    
    // Simulate loading to preserve the theatrical agent UI experience
    setTimeout(() => {
      setResponse(entry.data);
      setAnalysisComplete(true);
      setLoading(false);
    }, 1500);
  };

  const handleAnalyze = async () => {
    if (mode === 'github' && !repoUrl) return;
    if (mode === 'local' && !file) return;

    setLoading(true);
    setAnalysisComplete(false);
    setResponse(null);
    setSelectedNode(null);

    const formData = new FormData();
    formData.append('type', mode);

    if (mode === 'github') formData.append('repoUrl', repoUrl);
    else formData.append('file', file);

    const data = await processRepository(formData);

    if (!data.error) {
      saveToHistory(data, { url: mode === 'github' ? repoUrl : null, fileName: mode === 'local' ? file.name : null });
    }

    setResponse(data);
    setAnalysisComplete(true);
    setTimeout(() => setLoading(false), 500); 
  };

  const wrapIssueClick = (nodeId) => {
    const node = response?.nodes?.find(n => n.id === nodeId || n.path === nodeId);
    if (node) {
      setSelectedNode(node.id);
    } else {
       console.warn('Node not found for issue:', nodeId);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#E5E1DA] p-4 gap-4 overflow-hidden font-sans box-border selection:bg-black selection:text-[#00FF41]">
      <LeftPanel
        mode={mode}
        setMode={setMode}
        repoUrl={repoUrl}
        setRepoUrl={setRepoUrl}
        file={file}
        setFile={setFile}
        onAnalyze={handleAnalyze}
        loading={loading}
        analysisComplete={analysisComplete}
        history={history}
        onHistorySelect={handleHistorySelect}
        onClearHistory={() => { setHistory([]); localStorage.removeItem('codemap_history'); }}
      />
      <CenterPanel
        response={response}
        selectedNode={selectedNode}
        onNodeSelected={setSelectedNode}
        loading={loading}
      />
      <RightPanel
        response={response}
        loading={loading}
        selectedNode={selectedNode}
        onClearSelection={() => setSelectedNode(null)}
        onIssueClick={wrapIssueClick}
        onOpenSource={() => setIsDrawerOpen(true)}
      />

      <SourceDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        node={response?.nodes?.find(n => n.id === selectedNode)}
      />
    </div>
  );
}

export default App;
