
import React from 'react';
import { ThumbnailState, AspectRatio } from '../types';

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
        <label className="block text-[10px] text-gray-500 font-black uppercase mb-2 tracking-widest">
          {index === 1 ? 'Source 1: Creator Reference' : 'Source 2: Aesthetic / Vibe'}
        </label>
        {img ? (
          <div className="space-y-3">
            <div className="relative aspect-video w-full rounded-xl bg-[#2a2a2a] border border-red-500/20 overflow-hidden shadow-inner group-hover:border-red-500/50 transition-colors">
              <img src={img} className="w-full h-full object-cover" alt={`Source ${index}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                 <div className="flex flex-col">
                   <span className="text-[9px] font-black text-white uppercase tracking-tighter">
                     {index === 1 ? 'CREATOR FACE' : 'AESTHETIC REF'}
                   </span>
                   <span className="text-[8px] text-white/60 font-medium">Ready for Fusion</span>
                 </div>
              </div>
              <button 
                onClick={() => onChange({ [imgKey]: null } as any)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-red-600 text-white transition-colors backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#333] rounded-xl cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all group/upload">
            <div className="flex flex-col items-center justify-center px-4 text-center">
              <div className="p-2 bg-white/5 rounded-lg mb-1 group-hover/upload:bg-red-500/10 transition-colors">
                {index === 1 ? (
                   <svg className="w-4 h-4 text-gray-500 group-hover/upload:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-500 group-hover/upload:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <p className="text-[9px] text-gray-500 font-black uppercase group-hover/upload:text-gray-300">
                {index === 1 ? 'Add Face' : 'Add Vibe'}
              </p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload(index)} />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="w-full lg:w-96 bg-[#121212] border-r border-[#222] h-full overflow-y-auto p-6 space-y-8 scroll-smooth flex flex-col">
      <section>
        <div className="flex items-center gap-2 mb-4">
           <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]"></div>
           <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">UGC Creator Intent</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1 tracking-widest">UGC Context / Scenario</label>
            <textarea 
              value={state.topic}
              onChange={(e) => onChange({ topic: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#222] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 font-medium text-white placeholder:text-gray-700 transition-all resize-none h-24"
              placeholder="e.g. Unboxing a premium laptop with an excited expression"
            />
          </div>
          
          <div className="space-y-4">
            {renderBrandingSection(1)}
            {renderBrandingSection(2)}
          </div>

          <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
            <p className="text-[9px] text-red-400/80 leading-relaxed font-medium">
              <span className="font-black uppercase">UGC TIP:</span> Upload your own photo as <span className="text-white">Source 1</span>. Upload a high-end product shot or aesthetic scene as <span className="text-white">Source 2</span>. 
              The AI will fuse your identity into the aesthetic context seamlessly.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Output Dimensions</h3>
        <div className="grid grid-cols-2 gap-2">
          {['16:9', '9:16'].map(id => (
            <button
              key={id}
              onClick={() => onChange({ aspectRatio: id as AspectRatio })}
              className={`px-3 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                state.aspectRatio === id 
                ? 'bg-red-600/10 border-red-600 text-white' 
                : 'bg-[#1a1a1a] border-[#222] text-gray-500 hover:border-gray-600'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{id}</span>
              <span className="text-[8px] opacity-60">{id === '16:9' ? 'YouTube' : 'Reels/Shorts'}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-auto pt-6 border-t border-[#222]">
        <button 
          onClick={onGenerateBackground}
          disabled={isGenerating || !state.topic}
          className={`w-full py-5 rounded-xl font-black text-xs flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${
            isGenerating || !state.topic ? 'bg-[#222] text-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_10px_20px_rgba(220,38,38,0.2)] active:scale-95'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white/50" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>ANALYZING SCENE...</span>
            </div>
          ) : (
            <>
              <span>GENERATE UGC THUMBNAIL</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </>
          )}
        </button>
      </section>
    </div>
  );
};

export default EditorPanel;
