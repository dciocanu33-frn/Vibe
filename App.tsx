
import React, { useState, useCallback, useEffect } from 'react';
import EditorPanel from './components/EditorPanel';
import PreviewCanvas from './components/PreviewCanvas';
import VideoEditorPanel from './components/VideoEditorPanel';
import VideoPreview from './components/VideoPreview';
import { ThumbnailState, VideoState, AppView } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('thumbnail');
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  
  const [thumbState, setThumbState] = useState<ThumbnailState>({
    topic: '',
    backgroundImage: null,
    textStyle: 'impact',
    aspectRatio: '16:9',
    primaryColor: '#ff0000',
    secondaryColor: '#ffffff',
    brandingImage1: null,
    brandingImage2: null,
    brandingPosition2: 'right',
    brandingScale: 1
  });

  const [videoState, setVideoState] = useState<VideoState>({
    prompt: '',
    startImage: null,
    endImage: null,
    aspectRatio: '16:9',
    resolution: '720p',
    videoUrl: null,
    status: 'idle',
    progressMessage: ''
  });

  const handleThumbUpdate = useCallback((updates: Partial<ThumbnailState>) => {
    setThumbState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleVideoUpdate = useCallback((updates: Partial<VideoState>) => {
    setVideoState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleGenerateThumbnail = async () => {
    if (!thumbState.topic) return;
    setIsGeneratingThumbnail(true);
    const brandingImages = [thumbState.brandingImage1, thumbState.brandingImage2];
    const img = await geminiService.generateBackground(thumbState.topic, thumbState.aspectRatio, brandingImages);
    if (img) handleThumbUpdate({ backgroundImage: img });
    setIsGeneratingThumbnail(false);
  };

  const handleGenerateVideo = async () => {
    if (!videoState.prompt) return;

    // Veo check: User must select their own API key
    if (typeof (window as any).aistudio !== 'undefined') {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }

    setVideoState(prev => ({ ...prev, status: 'generating', videoUrl: null }));
    
    try {
      const url = await geminiService.generateVideo(
        videoState.prompt,
        videoState.aspectRatio,
        videoState.resolution,
        videoState.startImage,
        videoState.endImage,
        (msg) => setVideoState(prev => ({ ...prev, progressMessage: msg }))
      );
      if (url) setVideoState(prev => ({ ...prev, videoUrl: url, status: 'idle' }));
    } catch (error: any) {
      console.error(error);
      setVideoState(prev => ({ 
        ...prev, 
        status: 'error', 
        progressMessage: error.message?.includes("Requested entity was not found") 
          ? "API Key error. Please try selecting your key again." 
          : "Failed to generate video. Try again."
      }));
      
      if (error.message?.includes("Requested entity was not found")) {
         (window as any).aistudio?.openSelectKey();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-6 py-4 bg-[#121212] border-b border-[#222]">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-black tracking-tighter text-white">VIBE <span className="text-red-600">PHOTO STUDIO</span></h1>
          <div className="flex gap-4">
            <button 
              onClick={() => setView('thumbnail')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'thumbnail' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              UGC Thumbnails
            </button>
            <button 
              onClick={() => setView('video')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'video' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Video Production
            </button>
          </div>
        </div>
        <div className="hidden lg:block">
           <span className="bg-red-600/10 text-red-500 text-[10px] px-2 py-0.5 rounded font-bold tracking-[0.2em] border border-red-500/20 uppercase">PRO EDITION</span>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {view === 'thumbnail' ? (
          <>
            <EditorPanel 
              state={thumbState} 
              onChange={handleThumbUpdate} 
              onGenerateBackground={handleGenerateThumbnail}
              isGenerating={isGeneratingThumbnail}
            />
            <main className="flex-1 overflow-y-auto p-4 lg:p-10 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#121212]">
              <PreviewCanvas state={thumbState} onUploadBase={(url) => handleThumbUpdate({ brandingImage1: url, backgroundImage: null })} />
            </main>
          </>
        ) : (
          <>
            <VideoEditorPanel 
              state={videoState} 
              onChange={handleVideoUpdate} 
              onGenerateVideo={handleGenerateVideo}
            />
            <main className="flex-1 overflow-y-auto p-4 lg:p-10 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0d121b]">
              <VideoPreview state={videoState} />
            </main>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
