
import React, { useState, useRef } from 'react';
import Header from './components/Header';
import JsonEditor from './components/JsonEditor';
import { modifyMinecraftJson, summarizeMinecraftJson } from './services/geminiService';

const App: React.FC = () => {
  const [jsonContent, setJsonContent] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        try {
          JSON.parse(text); // Basic validation
          setJsonContent(text);
          setHistory([text]);
          
          setIsLoading(true);
          const s = await summarizeMinecraftJson(text);
          setSummary(s);
          setIsLoading(false);
        } catch (err) {
          alert("Invalid JSON file provided. Ensure it is a valid Minecraft Bedrock JSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleApplyModification = async () => {
    if (!jsonContent || !prompt.trim()) return;

    setIsLoading(true);
    try {
      const result = await modifyMinecraftJson(jsonContent, prompt);
      
      let formatted = result.updatedJson;
      try {
        formatted = JSON.stringify(JSON.parse(result.updatedJson), null, 2);
      } catch(e) {}

      setJsonContent(formatted);
      setHistory(prev => [...prev, formatted]);
      setPrompt('');
      
      const s = await summarizeMinecraftJson(formatted);
      setSummary(s);
    } catch (error) {
      alert("Error modifying JSON. Please check your instructions or ensure the file type is supported.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const prevContent = newHistory[newHistory.length - 1];
      setJsonContent(prevContent);
      setHistory(newHistory);
      updateSummary(prevContent);
    }
  };

  const updateSummary = async (content: string) => {
    setIsLoading(true);
    const s = await summarizeMinecraftJson(content);
    setSummary(s);
    setIsLoading(false);
  };

  const downloadJson = () => {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minecraft_config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/30">
      <Header />
      
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 lg:p-10 flex flex-col space-y-8 overflow-hidden">
        
        {/* Hero / Welcome Section */}
        <section className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur-lg transition duration-1000 group-hover:duration-200"></div>
          <div className="relative glass-panel rounded-2xl p-6 flex items-center space-x-6 border border-white/10 glow-blue">
            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">Architect Interface Initialized</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-4xl">
                Bedrock Architect provides an AI-augmented workflow for Bedrock Edition development. 
                Upload entity, item, or block definitions to perform natural-language engineering. 
                Our engine ensures schema compliance and semantic consistency across your entire project file.
              </p>
            </div>
            <div className="hidden xl:flex flex-col items-end shrink-0 border-l border-white/5 pl-8 text-right">
              <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest mb-1">System Load</span>
              <div className="flex space-x-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`w-1.5 h-4 rounded-sm ${i < 3 ? 'bg-blue-500' : 'bg-zinc-800'}`}></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
          
          {/* Left Column: Command & Intelligence */}
          <div className="lg:col-span-4 flex flex-col space-y-8 overflow-y-auto pr-2 custom-scrollbar">
            
            {/* Primary Controls */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">Input Management</h2>
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".json"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                  <div className="relative w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl border border-blue-400/30 transition-all flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    Upload Workspace
                  </div>
                </button>

                {jsonContent && (
                  <div className="flex gap-3">
                    <button 
                      onClick={downloadJson}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-white/10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                      Commit & Export
                    </button>
                    <button 
                      onClick={handleUndo}
                      disabled={history.length <= 1}
                      className="px-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl border border-white/5 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-15 9 9 0 0 0-6 2.3L3 7"/></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* AI Command Center */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col space-y-4">
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">Semantic Command</h2>
              <div className="relative group">
                <div className="absolute -inset-1 bg-blue-500/10 rounded-xl blur transition opacity-0 group-focus-within:opacity-100"></div>
                <textarea 
                  placeholder="e.g., 'Recalibrate this sword for 15 attack damage and add fire aspect capability'..."
                  className="relative w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none min-h-[160px] text-blue-50 font-medium placeholder:text-zinc-600"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={!jsonContent || isLoading}
                />
                <button 
                  onClick={handleApplyModification}
                  disabled={!jsonContent || isLoading || !prompt.trim()}
                  className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 p-2.5 rounded-lg transition-all shadow-xl shadow-blue-900/20"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Neural Summary Analysis */}
            <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/5 overflow-hidden flex flex-col terminal-scanline">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">Neural Feedback</h2>
                <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}`}></div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="text-zinc-400 text-[13px] leading-relaxed font-medium font-mono">
                  {summary ? (
                    <div className="space-y-4 whitespace-pre-wrap text-blue-100/80">
                      <span className="text-blue-500">$</span> {summary}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 text-center py-10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                      <p>Awaiting Workspace Initialization...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Code Canvas */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-[600px] group">
            <JsonEditor 
              content={jsonContent} 
              onChange={(val) => setJsonContent(val)}
            />
          </div>
        </div>
      </main>
      
      {/* Footer Info */}
      <footer className="px-10 py-5 border-t border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between text-[10px] text-zinc-600 font-mono tracking-[0.3em] uppercase">
        <div className="flex space-x-8">
          <span>Connection: Encrypted</span>
          <span>Region: Global-Alpha</span>
        </div>
        <span>© 2024 Bedrock Architect Engineering</span>
        <div className="flex space-x-8">
          <span>Latency: 42ms</span>
          <span className="text-emerald-500">Stability: Nominal</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
