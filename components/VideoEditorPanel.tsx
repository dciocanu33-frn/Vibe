
import React from 'react';
import { VideoState, AspectRatio } from '../types';

interface VideoEditorPanelProps {
  state: VideoState;
  onChange: (updates: Partial<VideoState>) => void;
  onGenerateVideo: () => void;
}

const VideoEditorPanel: React.FC<VideoEditorPanelProps> = ({ state, onChange, onGenerateVideo }) => {
  const handleFileUpload = (type: 'startImage' | 'endImage') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ [type]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const isGenerating = state.status !== 'idle' && state.status !== 'error';

  const renderImageSlot = (type: 'startImage' | 'endImage', label: string) => {
    const img = state[type];
    return (
      <div className="flex-1">
        <label className="block text-[10px] text-gray-500 font-black uppercase mb-2 tracking-widest">{label}</label>
        {img ? (
          <div className="relative aspect-square rounded-xl overflow-hidden border border-[#333] group">
            <img src={img} className="w-full h-full object-cover" />
            <button 
              onClick={() => onChange({ [type]: null })}
              className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-[#222] rounded-xl cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all">
            <svg className="w-4 h-4 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
            <span className="text-[8px] font-bold text-gray-600 uppercase">Upload</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload(type)} />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="w-full lg:w-96 bg-[#121212] border-r border-[#222] h-full overflow-y-auto p-6 space-y-8 flex flex-col">
      <section>
        <div className="flex items-center gap-2 mb-4">
           <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
           <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Cine-UGC Director</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-widest">Story / Scene Script</label>
            <textarea 
              value={state.prompt}
              onChange={(e) => onChange({ prompt: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#222] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-white placeholder:text-gray-700 transition-all resize-none h-32"
              placeholder="e.g. A creator unboxing a mysterious glowing box in a dark room, cinematic slow motion with particles"
            />
          </div>

          <div className="flex gap-4">
            {renderImageSlot('startImage', 'Start Frame')}
            {renderImageSlot('endImage', 'End Frame')}
          </div>

          <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
            <p className="text-[9px] text-blue-400/80 leading-relaxed font-medium">
              <span className="font-black uppercase">DIRECTOR'S NOTE:</span> Veo 3.1 works best with descriptive prompts. Upload a <span className="text-white">Start Frame</span> to keep the video consistent with your brand.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Visual Format</h3>
        <div className="grid grid-cols-2 gap-2">
          {['16:9', '9:16'].map(id => (
            <button
              key={id}
              onClick={() => onChange({ aspectRatio: id as AspectRatio })}
              className={`px-3 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                state.aspectRatio === id 
                ? 'bg-blue-600/10 border-blue-500 text-white' 
                : 'bg-[#1a1a1a] border-[#222] text-gray-500 hover:border-gray-600'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{id}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-auto pt-6 border-t border-[#222]">
        <button 
          onClick={onGenerateVideo}
          disabled={isGenerating || !state.prompt}
          className={`w-full py-5 rounded-xl font-black text-xs flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${
            isGenerating || !state.prompt ? 'bg-[#222] text-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)] active:scale-95'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white/50" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{state.status.toUpperCase()}...</span>
            </div>
          ) : (
            <>
              <span>RENDER CINEMATIC VIDEO</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 10l4.553 2.276A1 1 0 0120 13.17V6.83a1 1 0 011.447-.894L26 9.106" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 10l4.553 2.276A1 1 0 0120 13.17V6.83a1 1 0 011.447-.894L26 9.106" />
                <rect x="2" y="6" width="13" height="12" rx="2" strokeWidth="3" />
              </svg>
            </>
          )}
        </button>
      </section>
    </div>
  );
};

export default VideoEditorPanel;
