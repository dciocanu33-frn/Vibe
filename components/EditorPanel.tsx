
import React from 'react';
import { ThumbnailState, TextStyle, AspectRatio, BrandingPosition } from '../types';

interface EditorPanelProps {
  state: ThumbnailState;
  onChange: (updates: Partial<ThumbnailState>) => void;
  onGenerateBackground: () => void;
  isGenerating: boolean;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ state, onChange, onGenerateBackground, isGenerating }) => {
  const styles: { id: TextStyle; label: string }[] = [
    { id: 'clean', label: 'Modern Clean' },
    { id: 'impact', label: 'YouTube Classic' },
    { id: 'comic', label: 'Bangers Comic' },
    { id: 'gradient', label: 'Stylish Gradient' },
  ];

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
    const pos = index === 2 ? state.brandingPosition2 : null;
    const imgKey = index === 1 ? 'brandingImage1' : 'brandingImage2';

    return (
      <div className="relative group mb-4">
        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-2">
          {index === 1 ? 'Main Asset (Full Screen Background)' : 'Overlay Asset (Branding/Subject)'}
        </label>
        {img ? (
          <div className="space-y-3">
            <div className="relative aspect-square w-full rounded-xl bg-[#2a2a2a] border border-[#444] overflow-hidden shadow-inner">
              <img src={img} className="w-full h-full object-contain" alt={`Branding ${index}`} />
              <button 
                onClick={() => onChange({ [imgKey]: null } as any)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-red-600 text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {index === 2 && (
              <div className="flex gap-2">
                {(['left', 'right'] as BrandingPosition[]).map(p => (
                  <button
                    key={p}
                    onClick={() => onChange({ brandingPosition2: p })}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase rounded border ${
                      state.brandingPosition2 === p ? 'bg-red-600 border-red-600' : 'bg-[#2a2a2a] border-[#444]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#444] rounded-xl cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-6 h-6 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Upload Asset</p>
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
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Format</h3>
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
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Branding & Assets</h3>
        <div className="space-y-4">
          {renderBrandingSection(1)}
          {renderBrandingSection(2)}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Content</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Main Title</label>
            <input 
              type="text" 
              value={state.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-[#444] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Subtitle</label>
            <input 
              type="text" 
              value={state.subtitle}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-[#444] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Background</h3>
        <div className="space-y-4">
          <button 
            onClick={onGenerateBackground}
            disabled={isGenerating}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
              isGenerating ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:scale-95 shadow-lg shadow-red-900/20'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI Magic...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11l-7-7-7 7m14 0l-7 7-7-7" />
                </svg>
                Generate Background
              </>
            )}
          </button>
          
          <div className="flex items-center gap-4">
             <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Darken</label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={state.overlayOpacity * 100}
                  onChange={(e) => onChange({ overlayOpacity: parseInt(e.target.value) / 100 })}
                  className="w-full accent-red-600"
                />
             </div>
             <input 
               type="color" 
               value={state.primaryColor}
               onChange={(e) => onChange({ primaryColor: e.target.value })}
               className="w-10 h-10 bg-transparent cursor-pointer rounded overflow-hidden"
             />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Typography</h3>
        <div className="grid grid-cols-1 gap-2">
          {styles.map(s => (
            <button
              key={s.id}
              onClick={() => onChange({ textStyle: s.id })}
              className={`px-4 py-3 text-sm font-bold rounded-md border text-left transition-all ${
                state.textStyle === s.id 
                ? 'bg-[#333] border-red-500 ring-1 ring-red-500' 
                : 'bg-[#2a2a2a] border-[#444] hover:border-gray-500'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default EditorPanel;
