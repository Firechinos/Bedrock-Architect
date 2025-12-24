
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50 px-8 py-4">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/10">
               <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="m10 3 5 2 5-2v12l-5 2-5-2-5 2V5l5-2Z"/><path d="m15 5-5-2"/><path d="m15 17-5-2"/><path d="M10 3v12"/><path d="M15 5v12"/></svg>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Bedrock Architect
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono uppercase">v2.1</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Universal Configuration Engine</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Engine: Gemini-3-Flash</span>
          </div>
          <a 
            href="https://ai.google.dev/gemini-api/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-semibold text-zinc-400 hover:text-blue-400 transition-all border border-white/5 bg-white/5 px-4 py-2 rounded-lg"
          >
            Documentation
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
