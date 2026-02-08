
import React from 'react';
import { ThumbnailState, AspectRatio, BrandingPosition } from '../types';

interface EditorPanelProps {
  state: ThumbnailState;
  onChange: (updates: Partial<ThumbnailState>) => void;
  onGenerateBackground: () => void;
  isGenerating: boolean;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ state, onChange, onGenerateBackground, isGenerating }) => {
  const handleFileUpload = (index: 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ [`brandingImage${index}`]: reader.result as string } as any);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderBrandingSection = (index: 1 | 2) => {
    const img = index === 1 ? state.brandingImage1 : state.brandingImage2;
    const imgKey = index === 1 ? 'brandingImage1' : 'brandingImage2';

    return (
      <div className="relative group mb-4">
        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-2">
          {index === 1 ? 'Face Reference 1 (Main Swap)' : 'Face Reference 2 (Additional)'}
        </label>
        {img ? (
          <div className="space-y-3">
            <div className="relative aspect-square w-full rounded-xl bg-[#2a2a2a] border border-red-500/20 overflow-hidden shadow-inner group-hover:border-red-500/50 transition-colors">
              <img src={img} className="w-full h-full object-cover" alt={`Face ${index}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                 <span className="text-[9px] font-black text-white/80 uppercase">AI Face Source Detected</span>
              </div>
              <button 
                onClick={() => onChange({ [imgKey]: null } as any)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-red-600 text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#333] rounded-xl cursor-pointer hover:border-red-500/50 hover:bg-red-500/10 transition-all">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-6 h-6 mb-2 text-gray-600 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-[10px] text-gray-500 font-bold uppercase group-hover:text-red-400">Upload Face Image</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload(index)} />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="w-full lg:w-96 bg-[#1a1a1a] border-r border-[#333] h-full overflow-y-auto p-6 space-y-8 scroll-smooth">
      <section>
        <div className="flex items-center gap-2 mb-4">
           <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Face Swap Sources</h3>
        </div>
        <div className="space-y-4">
          {renderBrandingSection(1)}
          {renderBrandingSection(2)}
          <p className="text-[10px] text-gray-600 leading-tight">
            * AI will map these faces onto the generated character in your scene description.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Output Format</h3>
        <div className="grid grid-cols-2 gap-2">
          {['16:9', '9:16'].map(id => (
            <button
              key={id}
              onClick={() => onChange({ aspectRatio: id as AspectRatio })}
              className={`px-3 py-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                state.aspectRatio === id 
                ? 'bg-red-600 border-red-600 text-white' 
                : 'bg-[#2a2a2a] border-[#444] text-gray-300 hover:border-gray-500'
              }`}
            >
              <span className="text-lg">{id === '16:9' ? '📺' : '📱'}</span>
              <span className="text-[10px] font-bold uppercase">{id}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Classic Content</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Main Title</label>
            <input 
              type="text" 
              value={state.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-[#444] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-bold uppercase tracking-tighter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Subtitle</label>
            <input 
              type="text" 
              value={state.subtitle}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-[#444] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Vibe Controls</h3>
        <div className="space-y-4">
          <button 
            onClick={onGenerateBackground}
            disabled={isGenerating}
            className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all ${
              isGenerating ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:scale-95 shadow-xl shadow-red-900/40'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI SWAPPING...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zM16.243 16.243a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414z" />
                </svg>
                RUN AI MAGIC
              </>
            )}
          </button>
          
          <div className="flex items-center gap-4 pt-2">
             <div className="flex-1">
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Text Depth</label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={state.overlayOpacity * 100}
                  onChange={(e) => onChange({ overlayOpacity: parseInt(e.target.value) / 100 })}
                  className="w-full accent-red-600 h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer"
                />
             </div>
             <input 
               type="color" 
               value={state.primaryColor}
               onChange={(e) => onChange({ primaryColor: e.target.value })}
               className="w-10 h-10 bg-transparent cursor-pointer rounded-lg overflow-hidden border-2 border-[#333] hover:border-red-500 transition-colors"
             />
          </div>
        </div>
      </section>
    </div>
  );
};

export default EditorPanel;
