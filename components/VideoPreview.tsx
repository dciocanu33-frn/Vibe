
import React from 'react';
import { VideoState } from '../types';

interface VideoPreviewProps {
  state: VideoState;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ state }) => {
  const isGenerating = state.status !== 'idle' && state.status !== 'error';

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-5xl">
      <div 
        className={`relative group rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-500 bg-[#050505] ring-4 ${
          isGenerating ? 'ring-blue-500 animate-pulse' : 'ring-white/5'
        }`}
        style={{ 
          width: '100%', 
          maxWidth: state.aspectRatio === '16:9' ? '1000px' : '400px',
          aspectRatio: state.aspectRatio === '16:9' ? '16/9' : '9/16' 
        }}
      >
        {state.videoUrl ? (
          <video 
            src={state.videoUrl} 
            controls 
            autoPlay 
            loop 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4">
                 <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                 <h2 className="text-xl font-black uppercase tracking-widest text-blue-500">Generating</h2>
                 <p className="text-gray-400 text-xs font-medium max-w-xs">{state.progressMessage}</p>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-6 border border-blue-600/20">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553 2.276A1 1 0 0120 13.17V6.83a1 1 0 011.447-.894L26 9.106" />
                    <rect x="2" y="6" width="13" height="12" rx="2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Production Studio</h2>
                <p className="text-gray-400 text-sm font-medium">Your cinematic video will appear here</p>
              </>
            )}
          </div>
        )}

        {state.videoUrl && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded shadow-lg">
            VEO 3.1 GENERATED
          </div>
        )}
      </div>

      {state.videoUrl && (
        <div className="flex gap-4">
          <a 
            href={state.videoUrl} 
            download="vibe-studio-video.mp4"
            className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all flex items-center gap-3 shadow-2xl uppercase tracking-tighter text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Save Video
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoPreview;
