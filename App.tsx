
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
  
  const [state, setState] = useState<ThumbnailState>({
    title: 'YOUR EPIC TITLE',
    subtitle: 'MUST WATCH!',
    backgroundImage: 'https://picsum.photos/1280/720?grayscale',
    textStyle: 'impact',
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

        <section className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#333] shadow-xl">
          <div className="max-w-2xl mx-auto space-y-4 text-center">
            <h2 className="text-xl font-bold">What is the video topic?</h2>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. My new Tesla, 100 days in hardcore..."
                className="flex-1 bg-[#2a2a2a] border border-[#444] rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-red-500 text-lg"
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className={`px-8 rounded-xl font-bold transition-all ${
                  isGenerating || !topic ? 'bg-gray-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Go
              </button>
            </div>
            
            {suggestions && (
              <div className="mt-6 pt-6 border-t border-[#333] text-left">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">AI Suggestions</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {suggestions.viralTitles.map((t, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleStateUpdate({ title: t.toUpperCase() })}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="flex-1 flex flex-col justify-center items-center">
          <PreviewCanvas state={state} />
        </section>
      </main>
    </div>
  );
};

export default App;
