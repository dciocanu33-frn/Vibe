
import React, { useState, useCallback } from 'react';
import EditorPanel from './components/EditorPanel';
import PreviewCanvas from './components/PreviewCanvas';
import { ThumbnailState } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [state, setState] = useState<ThumbnailState>({
    topic: '',
    backgroundImage: null,
    textStyle: 'impact', // Locked to YouTube Classic
    aspectRatio: '16:9',
    primaryColor: '#ff0000',
    secondaryColor: '#ffffff',
    brandingImage1: null,
    brandingImage2: null,
    brandingPosition2: 'right',
    brandingScale: 1
  });

  const handleStateUpdate = useCallback((updates: Partial<ThumbnailState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleGenerate = async () => {
    if (!state.topic) return;
    setIsGenerating(true);
    
    const brandingImages = [state.brandingImage1, state.brandingImage2];
    const img = await geminiService.generateBackground(state.topic, state.aspectRatio, brandingImages);
    if (img) {
      handleStateUpdate({ backgroundImage: img });
    }
    setIsGenerating(false);
  };

  const handleUploadBase = (dataUrl: string) => {
    handleStateUpdate({ brandingImage1: dataUrl, backgroundImage: null });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#121212] border-b border-[#222]">
        <h1 className="text-xl font-black tracking-tighter text-red-600">VIRALVIBE</h1>
      </div>

      <EditorPanel 
        state={state} 
        onChange={handleStateUpdate} 
        onGenerateBackground={handleGenerate}
        isGenerating={isGenerating}
      />

      <main className="flex-1 overflow-y-auto p-4 lg:p-10 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#121212]">
        <header className="absolute top-10 left-10 hidden lg:block">
          <h1 className="text-2xl font-black tracking-tighter text-red-600 flex items-center gap-2">
            VIRALVIBE <span className="bg-red-600/10 text-red-500 text-[10px] px-2 py-0.5 rounded font-bold tracking-[0.2em] border border-red-500/20 uppercase">AI STUDIO</span>
          </h1>
        </header>

        <section className="w-full flex flex-col justify-center items-center py-6">
          <PreviewCanvas state={state} onUploadBase={handleUploadBase} />
        </section>
      </main>
    </div>
  );
};

export default App;
