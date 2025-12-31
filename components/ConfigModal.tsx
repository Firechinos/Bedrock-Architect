
import React, { useState, useEffect } from 'react';
import { EncyclopediaItem, ComponentConfigInfo } from '../types';
import { getComponentConfigInfo } from '../services/geminiService';

interface ConfigModalProps {
  item: EncyclopediaItem;
  isOpen: boolean;
  onClose: () => void;
  onApply: (instruction: string) => void;
  isLoading?: boolean;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ item, isOpen, onClose, onApply, isLoading: parentLoading }) => {
  const [configInfo, setConfigInfo] = useState<ComponentConfigInfo | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setIsLoading(true);
      getComponentConfigInfo(item.name)
        .then(info => {
          setConfigInfo(info);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      setCustomInput('');
      setConfigInfo(null);
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handlePresetClick = (val: string) => {
    onApply(`Add the ${item.category.toLowerCase()} "${item.name}" configured as: ${val}`);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onApply(`Add the ${item.category.toLowerCase()} "${item.name}" with these details: ${customInput}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded">
                Configuring {item.category}
              </span>
              <h2 className="text-2xl font-bold text-white mt-3 font-mono break-all">{item.name}</h2>
              <p className="text-sm text-zinc-400 mt-2">{item.description}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Predicting Presets...</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {configInfo && configInfo.presets.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Suggested Presets</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {configInfo.presets.map((preset, idx) => (
                      <button 
                        key={idx}
                        disabled={parentLoading}
                        onClick={() => handlePresetClick(preset.value)}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/40 hover:bg-blue-600/10 transition-all text-left group"
                      >
                        <span className="text-sm font-bold text-white block group-hover:text-blue-300">{preset.label}</span>
                        <span className="text-[10px] text-zinc-500 uppercase mt-1 block">Quick Apply</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  {configInfo?.suggestedPrompt || "Custom Configuration"}
                </h3>
                <div className="relative group">
                  <textarea 
                    autoFocus
                    placeholder="e.g. Set it to a very high rarity with glowing effects..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none min-h-[100px] text-blue-50"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    disabled={parentLoading}
                  />
                  <button 
                    type="submit"
                    disabled={parentLoading || !customInput.trim()}
                    className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 p-2 rounded-lg transition-all shadow-xl"
                  >
                    {parentLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-zinc-900/50 border-t border-white/5 flex justify-center">
           <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-bold">Bedrock Engine Integration</p>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
