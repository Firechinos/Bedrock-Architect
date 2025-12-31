
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import JsonEditor from './components/JsonEditor';
import ConfigModal from './components/ConfigModal';
import { modifyMinecraftJson, getDetailedAnalysis, extractStats, getEncyclopediaSuggestions } from './services/geminiService';
import { MinecraftStats, HistoryEntry, AnalysisData, EncyclopediaData, EncyclopediaItem, MinecraftFileType } from './types';

const SAMPLES = [
  {
    id: 'zombie',
    name: 'Zombie Behavior',
    icon: '🧟',
    description: 'Standard hostile mob behavior.',
    type: 'entity',
    content: `{
  "format_version": "1.16.0",
  "minecraft:entity": {
    "description": { "identifier": "minecraft:zombie", "is_spawnable": true, "is_summonable": true },
    "components": {
      "minecraft:health": { "value": 20, "max": 20 },
      "minecraft:movement": { "value": 0.23 },
      "minecraft:attack": { "damage": 3 },
      "minecraft:burns_in_daylight": {},
      "minecraft:behavior.melee_attack": { "priority": 3 }
    }
  }
}`
  },
  {
    id: 'diamond_ore_loot',
    name: 'Diamond Loot',
    icon: '💎',
    description: 'Standard loot table for diamond ore.',
    type: 'loot_table',
    content: `{
  "pools": [
    {
      "rolls": 1,
      "entries": [
        {
          "type": "item",
          "name": "minecraft:diamond",
          "weight": 1,
          "functions": [
            { "function": "minecraft:set_count", "count": { "min": 1, "max": 1 } },
            { "function": "minecraft:apply_bonus", "enchantment": "minecraft:fortune", "formula": "minecraft:ore_drops" }
          ]
        }
      ]
    }
  ]
}`
  },
  {
    id: 'golden_apple_recipe',
    name: 'Enchanted Apple',
    icon: '🍎',
    description: 'Shaped crafting recipe for special apples.',
    type: 'recipe',
    content: `{
  "format_version": "1.12.0",
  "minecraft:recipe_shaped": {
    "description": { "identifier": "minecraft:enchanted_golden_apple" },
    "tags": ["crafting_table"],
    "pattern": [ "###", "#X#", "###" ],
    "key": {
      "#": { "item": "minecraft:gold_block" },
      "X": { "item": "minecraft:apple" }
    },
    "result": { "item": "minecraft:enchanted_golden_apple" }
  }
}`
  }
];

const App: React.FC = () => {
  const [jsonContent, setJsonContent] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [encyclopedia, setEncyclopedia] = useState<EncyclopediaData | null>(null);
  const [stats, setStats] = useState<MinecraftStats>({});
  const [detectedType, setDetectedType] = useState<MinecraftFileType>('unknown');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'code' | 'analysis' | 'samples' | 'encyclopedia'>('code');
  const [configTarget, setConfigTarget] = useState<EncyclopediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processEditorContent = async (label: string = "Process Editor") => {
    if (!jsonContent.trim()) return;
    setIsLoading(true);
    try {
      const parsed = JSON.parse(jsonContent);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonContent(formatted);

      if (history.length === 0 || history[history.length - 1].content !== formatted) {
        setHistory(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          label: label,
          content: formatted
        }]);
      }

      const [analysisData, st, encData] = await Promise.all([
        getDetailedAnalysis(formatted),
        extractStats(formatted),
        getEncyclopediaSuggestions(formatted)
      ]);
      setAnalysis(analysisData);
      setDetectedType(analysisData.detectedType);
      setStats(st);
      setEncyclopedia(encData);
    } catch (err) {
      alert("Error: The editor content is not valid JSON.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadJsonContent = async (text: string, label: string = "Load") => {
    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonContent(formatted);
      
      setHistory(prev => [...prev, { 
        timestamp: new Date().toLocaleTimeString(), 
        label: label, 
        content: formatted 
      }]);
      
      setIsLoading(true);
      const [analysisData, st, encData] = await Promise.all([
        getDetailedAnalysis(formatted),
        extractStats(formatted),
        getEncyclopediaSuggestions(formatted)
      ]);
      setAnalysis(analysisData);
      setDetectedType(analysisData.detectedType);
      setStats(st);
      setEncyclopedia(encData);
      setIsLoading(false);
      if (activeTab === 'samples') setActiveTab('code');
    } catch (err) {
      alert("Invalid JSON data.");
      setIsLoading(false);
    }
  };

  const applyModification = async (instruction: string) => {
    if (!jsonContent) return;
    setIsLoading(true);
    try {
      const result = await modifyMinecraftJson(jsonContent, instruction);
      let formatted = result.updatedJson;
      try { formatted = JSON.stringify(JSON.parse(result.updatedJson), null, 2); } catch(e) {}

      setJsonContent(formatted);
      setHistory(prev => [...prev, { 
        timestamp: new Date().toLocaleTimeString(), 
        label: instruction.length > 20 ? instruction.substring(0, 20) + "..." : instruction, 
        content: formatted 
      }]);
      
      const [analysisData, st, encData] = await Promise.all([
        getDetailedAnalysis(formatted),
        extractStats(formatted),
        getEncyclopediaSuggestions(formatted)
      ]);
      setAnalysis(analysisData);
      setDetectedType(analysisData.detectedType);
      setStats(st);
      setEncyclopedia(encData);
      setConfigTarget(null);
    } catch (error) {
      alert("AI Processing Failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const getVisibleStats = () => {
    if (detectedType === 'loot_table') {
      return [
        { label: 'Richness', val: stats.richness, color: 'from-emerald-400 to-emerald-600' },
        { label: 'Efficiency', val: stats.efficiency, color: 'from-amber-400 to-amber-600' },
        { label: 'Variance', val: 50, color: 'from-blue-400 to-indigo-600' },
        { label: 'Power', val: stats.power || 20, color: 'from-purple-400 to-purple-600' },
      ];
    }
    if (detectedType === 'recipe') {
      return [
        { label: 'Complexity', val: stats.complexity, color: 'from-orange-400 to-red-600' },
        { label: 'Power Level', val: stats.power, color: 'from-blue-400 to-blue-600' },
        { label: 'Cost Ratio', val: stats.efficiency, color: 'from-zinc-400 to-zinc-600' },
        { label: 'Rarity', val: 30, color: 'from-amber-400 to-amber-600' },
      ];
    }
    // Default to Entity stats
    return [
      { label: 'Vitality (HP)', val: stats.health, color: 'from-rose-500 to-rose-700' },
      { label: 'Kinetic (SPD)', val: stats.speed, color: 'from-blue-400 to-blue-600' },
      { label: 'Offensive (ATK)', val: stats.attack, color: 'from-amber-400 to-orange-600' },
      { label: 'Complexity', val: stats.complexity || 10, color: 'from-zinc-400 to-zinc-600' },
    ];
  };

  const macros = [
    { label: "Maximize Drop Rate", prompt: "If this is a loot table, ensure item counts are high and drop weights are maximized.", icon: "💰" },
    { label: "Cheaper Recipe", prompt: "Modify the ingredients to be easier to obtain or reduce the item count required.", icon: "🛠️" },
    { label: "Hardcore Variant", prompt: "Double the health and damage of this entity and add resistance components.", icon: "💀" },
    { label: "Add Rarity Tag", prompt: "Add appropriate rarity metadata and glowing effects to the result/entity.", icon: "✨" },
  ];

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/30">
      <Header />
      
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 lg:p-10 flex flex-col space-y-8 overflow-hidden">
        
        {/* HUD Indicator */}
        <div className="flex items-center gap-4">
          <div className="px-4 py-1.5 bg-blue-600/10 border border-blue-500/30 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest animate-pulse">
            System Online: {detectedType.replace('_', ' ')} Detected
          </div>
        </div>

        {/* Top Diagnostics HUD */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {getVisibleStats().map((stat, i) => (
            <div key={i} className="glass-panel p-4 rounded-xl border border-white/5 glow-blue overflow-hidden relative">
              <div className="flex justify-between items-end mb-2 relative z-10">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                <span className="text-sm font-mono text-white">{Math.round(stat.val || 0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative z-10 border border-white/5">
                <div 
                  className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${stat.val || 0}%` }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-20 pointer-events-none"></div>
            </div>
          ))}
        </section>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
          
          <div className="lg:col-span-4 flex flex-col space-y-8 overflow-y-auto pr-2 custom-scrollbar">
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col space-y-4 shadow-2xl">
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">Command Engine</h2>
              <div className="relative group">
                <textarea 
                  placeholder="e.g. 'Make this recipe require netherite' or 'Add a fortune function to this loot'..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all resize-none min-h-[120px] text-blue-50 font-medium"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={!jsonContent || isLoading}
                />
                <button 
                  onClick={() => applyModification(prompt)}
                  disabled={!jsonContent || isLoading || !prompt.trim()}
                  className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 p-2.5 rounded-lg transition-all shadow-xl"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 px-3 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-[10px] font-bold text-zinc-500 hover:text-white hover:border-blue-500/50 uppercase tracking-widest transition-all">
                  Import File
                </button>
                <button onClick={() => processEditorContent()} disabled={!jsonContent.trim() || isLoading} className="flex items-center justify-center gap-2 px-3 py-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[10px] font-bold text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-400 uppercase tracking-widest transition-all disabled:opacity-30">
                  Sync Editor
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => loadJsonContent(ev.target?.result as string, "Imported File");
                  reader.readAsText(file);
                }
              }} className="hidden" accept=".json" />
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">Blueprint Macros</h2>
              <div className="grid grid-cols-2 gap-3">
                {macros.map((m, idx) => (
                  <button key={idx} onClick={() => applyModification(m.prompt)} disabled={!jsonContent || isLoading} className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-blue-600/10 hover:border-blue-500/30 transition-all text-center group disabled:opacity-30">
                    <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{m.icon}</span>
                    <span className="text-[10px] font-bold text-zinc-300 uppercase leading-tight">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex-1 overflow-hidden flex flex-col min-h-[250px]">
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">Engineering Log</h2>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {history.map((entry, idx) => (
                  <div key={idx} onClick={() => {
                    setJsonContent(entry.content);
                    processEditorContent("Restored Log");
                  }} className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-blue-500/50 cursor-pointer transition-all group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-mono text-blue-500">{entry.timestamp}</span>
                      <span className="text-[9px] font-bold text-zinc-600 uppercase group-hover:text-blue-400">Restore</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-medium truncate">{entry.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col h-full min-h-[600px] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-white/5 overflow-x-auto max-w-full">
                {[
                  { id: 'code', label: 'Code' },
                  { id: 'analysis', label: 'Analysis' },
                  { id: 'encyclopedia', label: 'Encyclopedia' },
                  { id: 'samples', label: 'Samples' }
                ].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`whitespace-nowrap px-4 lg:px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <button onClick={() => {
                const blob = new Blob([jsonContent], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bedrock_${detectedType}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }} disabled={!jsonContent} className="group hidden sm:flex items-center gap-3 px-6 py-2 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-blue-400 transition-all disabled:opacity-30 shadow-xl">
                Export JSON
              </button>
            </div>

             <div className="flex-1 relative">
               {activeTab === 'code' && (
                 <JsonEditor content={jsonContent} onChange={setJsonContent} />
               )}
               
               {activeTab === 'analysis' && (
                 <div className="absolute inset-0 glass-panel p-8 rounded-2xl border border-white/10 terminal-scanline overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="mb-6"><h2 className="text-xl font-bold text-white tracking-tight">Technical Analysis</h2></div>
                    {analysis ? (
                      <div className="space-y-6">
                        <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/10">
                          <p className="text-blue-100/70 font-mono text-sm leading-relaxed">
                            <span className="text-blue-400 font-bold mr-2">[{detectedType.toUpperCase()}]</span>
                            {analysis.overview}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysis.sections.map((section, idx) => (
                            <div key={idx} className="p-5 rounded-xl bg-white/5 border border-white/5 flex flex-col space-y-3">
                               <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                                 <span className="text-xl">{section.icon || '🛠️'}</span>
                                 <h3 className="text-xs font-bold text-white uppercase tracking-widest">{section.header}</h3>
                               </div>
                               <ul className="space-y-1">
                                 {section.items.map((item, i) => <li key={i} className="text-[11px] text-zinc-400 font-mono">• {item}</li>)}
                               </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : <div className="h-full flex items-center justify-center opacity-30">Sync editor to generate analysis.</div>}
                 </div>
               )}

               {activeTab === 'encyclopedia' && (
                 <div className="absolute inset-0 glass-panel p-8 rounded-2xl border border-white/10 overflow-y-auto custom-scrollbar flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6 flex justify-between items-end">
                      <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Technical Encyclopedia</h2>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Elements for {detectedType.replace('_', ' ')}</p>
                      </div>
                      <button onClick={() => processEditorContent("Refreshed Suggestions")} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-white transition-colors">Refresh</button>
                    </div>
                    {encyclopedia && encyclopedia.items.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {encyclopedia.items.map((item, idx) => (
                          <div key={idx} className="group p-5 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all flex flex-col justify-between">
                             <div className="mb-4">
                               <div className="flex justify-between items-start mb-2">
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-blue-500/10 border-blue-500/20 text-blue-400 uppercase tracking-widest">{item.category}</span>
                               </div>
                               <h3 className="text-sm font-mono font-bold text-white mb-2 break-all">{item.name}</h3>
                               <p className="text-[11px] text-zinc-400 leading-normal">{item.description}</p>
                             </div>
                             <button onClick={() => setConfigTarget(item)} className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600/10 border border-blue-500/20 rounded-lg text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                               Configure & Add
                             </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-30 py-10">
                        <p className="text-lg font-bold uppercase tracking-widest">No Context Provided</p>
                      </div>
                    )}
                 </div>
               )}

               {activeTab === 'samples' && (
                 <div className="absolute inset-0 glass-panel p-8 rounded-2xl border border-white/10 overflow-y-auto custom-scrollbar flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6"><h2 className="text-xl font-bold text-white tracking-tight">Engineering Samples</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {SAMPLES.map(sample => (
                        <button key={sample.id} onClick={() => loadJsonContent(sample.content, `Sample: ${sample.name}`)} className="group flex flex-col p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-blue-600/5 transition-all text-left">
                          <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{sample.icon}</div>
                          <h3 className="text-white font-bold mb-1">{sample.name}</h3>
                          <p className="text-xs text-zinc-400 leading-normal mb-3">{sample.description}</p>
                          <span className="mt-auto text-[9px] font-bold text-blue-500 uppercase tracking-widest">{sample.type.replace('_', ' ')}</span>
                        </button>
                      ))}
                    </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      </main>

      {configTarget && (
        <ConfigModal 
          item={configTarget}
          isOpen={!!configTarget}
          onClose={() => setConfigTarget(null)}
          onApply={applyModification}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default App;
