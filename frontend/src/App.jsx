import React, { useState, useEffect } from 'react';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';

const HISTORY_KEY = 'agcia_history';
const MAX_HISTORY = 10;

function App() {
  const [mode, setMode] = useState('github');
  const [repoUrl, setRepoUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      setHistory(stored);
    } catch { setHistory([]); }
  }, []);

  const saveHistory = (entry) => {
    const updated = [entry, ...history.filter(h => h.url !== entry.url)].slice(0, MAX_HISTORY);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setResponse(null);
    setSelectedNode(null);
    try {
      let fetchOptions = { method: 'POST' };

      if (mode === 'github') {
        fetchOptions.headers = { 'Content-Type': 'application/json' };
        fetchOptions.body = JSON.stringify({ type: 'github', repoUrl });
      } else {
        const formData = new FormData();
        formData.append('type', 'local');
        if (file) formData.append('file', file);
        fetchOptions.body = formData;
      }

      const res = await fetch('http://localhost:3000/api/analyze', fetchOptions);
      const data = await res.json();
      setResponse(data);

      // Save to history on success
      if (!data.error) {
        const repoName = mode === 'github'
          ? repoUrl.replace(/https?:\/\/github\.com\//, '').replace(/\.git$/, '')
          : file?.name || 'Local Upload';

        saveHistory({
          url: mode === 'github' ? repoUrl : `local:${file?.name || 'upload'}`,
          name: repoName,
          mode,
          files: data.projectOverview?.summary?.totalFiles || data.nodes?.length || 0,
          issues: data.issues?.length || 0,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error(err);
      setResponse({ error: 'Failed to fetch from backend. Make sure it is running.' });
    } finally {
      setLoading(false);
    }
  };

  const handleHistorySelect = (entry) => {
    if (entry.mode === 'github') {
      setMode('github');
      setRepoUrl(entry.url);
    } else {
      setMode('local');
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const handleIssueClick = (file) => {
    setSelectedNode(file);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 overflow-hidden font-sans">
      <LeftPanel
        mode={mode}
        setMode={setMode}
        repoUrl={repoUrl}
        setRepoUrl={setRepoUrl}
        file={file}
        setFile={setFile}
        onAnalyze={handleAnalyze}
        loading={loading}
        analysisComplete={!!response && !response.error}
        history={history}
        onHistorySelect={handleHistorySelect}
        onClearHistory={handleClearHistory}
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
        onIssueClick={handleIssueClick}
      />
    </div>
  );
}

export default App;
