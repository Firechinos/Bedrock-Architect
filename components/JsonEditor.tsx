
import React from 'react';

interface JsonEditorProps {
  content: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ content, onChange, readOnly = false }) => {
  return (
    <div className="flex flex-col h-full bg-[#0d1117]/80 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-2xl glow-blue">
      <div className="px-5 py-3 bg-zinc-900/50 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/20"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500/20"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/20"></div>
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span className="text-[11px] font-mono text-zinc-400 tracking-tight">source/minecraft/config.json</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">UTF-8</span>
          <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-mono text-blue-400">JSON</div>
        </div>
      </div>
      <textarea
        className="flex-1 p-6 bg-transparent text-blue-100/90 font-mono text-sm resize-none focus:outline-none focus:ring-0 leading-relaxed custom-scrollbar"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        readOnly={readOnly}
        placeholder="// Paste your Minecraft behavior JSON here or upload a file. Click 'Sync Editor' after pasting to initialize the workspace analysis."
      />
      <div className="px-5 py-2 bg-zinc-900/30 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
        <div className="flex space-x-4">
          <span>LN: {content.split('\n').length}</span>
          <span>COL: {content.length}</span>
        </div>
        <div className="flex items-center space-x-2 uppercase">
          <span>Ready</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default JsonEditor;
