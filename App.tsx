
import React, { useState, useCallback } from 'react';
import EditorPanel from './components/EditorPanel';
import PreviewCanvas from './components/PreviewCanvas';
import { ThumbnailState, SuggestionResponse } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null);
  const [showTips, setShowTips] = useState(false);
  
  const [state, setState] = useState<ThumbnailState>({
    title: 'YOUR EPIC TITLE',
    subtitle: 'MUST WATCH!',
    backgroundImage: 'https://picsum.photos/1280/720?grayscale',
    textStyle: 'impact', // Locked to YouTube Classic
    aspectRatio: '16:9',
    primaryColor: '#ff0000',
    secondaryColor: '#ffffff',
    showOverlay: true,
    overlayOpacity: 0.3,
    brandingImage1: null,
    brandingImage2: null,
    brandingPosition2: 'right',
    brandingScale: 1
  });

  const handleStateUpdate = useCallback((updates: Partial<ThumbnailState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    
    if (!suggestions) {
      handleSuggestions();
    }

    const brandingImages = [state.brandingImage1, state.brandingImage2];
    const img = await geminiService.generateBackground(topic, state.aspectRatio, brandingImages);
    if (img) {
      handleStateUpdate({ backgroundImage: img });
    }
    setIsGenerating(false);
  };

  const handleSuggestions = async () => {
    if (!topic) return;
    setIsGettingSuggestions(true);
    const res = await geminiService.getViralSuggestions(topic);
    setSuggestions(res);
    setIsGettingSuggestions(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#0f0f0f]">
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#1a1a1a] border-b border-[#333]">
        <h1 className="text-xl font-black tracking-tighter text-red-600">VIRALVIBE</h1>
      </div>

      <EditorPanel 
        state={state} 
        onChange={handleStateUpdate} 
        onGenerateBackground={handleGenerate}
        isGenerating={isGenerating}
      />

      <main className="flex-1 overflow-y-auto p-4 lg:p-10 flex flex-col gap-8">
        <header className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-red-600">VIRALVIBE <span className="text-white text-lg font-normal ml-2 opacity-50">AI Studio</span></h1>
            <p className="text-gray-400 text-sm">Professional AI-driven thumbnail composition</p>
          </div>
        </header>

        <section className="relative group">
          {/* Animated Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-focus-within:duration-200"></div>
          
          <div className="relative bg-[#1a1a1a] p-1 rounded-2xl border border-[#333] shadow-2xl overflow-hidden">
             <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                   <div className="p-2 bg-red-500/10 rounded-lg">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                   </div>
                   <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">AI Prompt Box</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      placeholder="Describe your video (e.g. 24 Hours in a futuristic city...)"
                      className="w-full bg-[#0f0f0f] border border-[#333] rounded-xl pl-12 pr-5 py-5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-xl font-medium transition-all placeholder:text-gray-600"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                       </svg>
                    </div>
                  </div>
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic}
                    className={`px-10 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn ${
                      isGenerating || !topic ? 'bg-gray-800 text-gray-500' : 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-900/20'
                    }`}
                  >
                    {isGenerating ? (
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <span>GENERATE</span>
                        <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
                
                {suggestions && (
                  <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-500 space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Viral Title Suggestions</h4>
                        <div className="h-px flex-1 bg-white/5 ml-4"></div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.viralTitles.map((t, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleStateUpdate({ title: t.toUpperCase() })}
                            className="px-4 py-2 bg-[#2a2a2a] hover:bg-red-600 hover:text-white border border-[#333] hover:border-red-500 rounded-lg text-sm font-bold transition-all active:scale-95 flex items-center gap-2 group/pill"
                          >
                            <span className="opacity-40 group-hover/pill:opacity-100 transition-opacity">#</span>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {suggestions.designTips && suggestions.designTips.length > 0 && (
                      <div className="bg-white/5 rounded-xl overflow-hidden border border-white/5">
                        <button 
                          onClick={() => setShowTips(!showTips)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors group/tips"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-yellow-500/10 rounded-md">
                              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">AI Design Optimization Tips</span>
                          </div>
                          <svg 
                            className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showTips ? 'rotate-180' : ''}`} 
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        <div className={`transition-all duration-300 overflow-hidden ${showTips ? 'max-h-96' : 'max-h-0'}`}>
                          <div className="p-4 pt-0 space-y-2">
                            {suggestions.designTips.map((tip, idx) => (
                              <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-black/20 border border-white/5">
                                <div className="mt-1 flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 text-[10px] font-bold">
                                  {idx + 1}
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed italic">"{tip}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
             </div>
          </div>
        </section>

        <section className="flex-1 flex flex-col justify-center items-center py-4">
          <PreviewCanvas state={state} />
        </section>
      </main>
    </div>
  );
};

export default App;
