
import React, { useRef, useEffect, useState } from 'react';
import { ThumbnailState } from '../types';

interface PreviewCanvasProps {
  state: ThumbnailState;
  onUploadBase: (dataUrl: string) => void;
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ state, onUploadBase }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const renderId = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const canvasWidth = state.aspectRatio === '16:9' ? 1280 : 720;
  const canvasHeight = state.aspectRatio === '16:9' ? 720 : 1280;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentId = ++renderId.current;

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
      });
    };

    const drawCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
      const imgAspect = img.width / img.height;
      const targetAspect = w / h;
      let dw, dh, dx, dy;

      if (imgAspect > targetAspect) {
        dh = h;
        dw = h * imgAspect;
        dx = x + (w - dw) / 2;
        dy = y;
      } else {
        dw = w;
        dh = w / imgAspect;
        dx = x;
        dy = y + (h - dh) / 2;
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    const render = async () => {
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Background Priority: Generated Result > Style Source 1 > Fallback Placeholder
        const bgSource = state.backgroundImage || state.brandingImage1;

        if (bgSource) {
          try {
            const img = await loadImage(bgSource);
            if (currentId !== renderId.current) return;
            drawCover(ctx, img, 0, 0, canvas.width, canvas.height);
          } catch (e) {
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        } else {
          // Empty State Canvas Background
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Subtle grid pattern
          ctx.strokeStyle = '#1a1a1a';
          ctx.lineWidth = 2;
          for(let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
          }
          for(let i = 0; i < canvas.height; i += 40) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
          }
        }
      } catch (err) {
        console.error("Render failure:", err);
      }
    };

    render();
  }, [state, canvasWidth, canvasHeight]);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUploadBase(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `viral-thumbnail-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const hasImage = !!(state.backgroundImage || state.brandingImage1);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-5xl">
      <div 
        className={`relative group rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-300 ring-4 ${
          isDragging ? 'ring-red-600 scale-[1.02]' : 'ring-white/5'
        } ${!hasImage ? 'cursor-pointer hover:ring-white/20' : ''}`}
        style={{ 
          width: '100%', 
          maxWidth: state.aspectRatio === '16:9' ? '1000px' : '400px',
          aspectRatio: state.aspectRatio === '16:9' ? '16/9' : '9/16' 
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !hasImage && fileInputRef.current?.click()}
      >
        <canvas 
          ref={canvasRef} 
          width={canvasWidth} 
          height={canvasHeight}
          className="w-full h-full object-contain bg-[#050505]"
        />

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {!hasImage && !isDragging && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none p-10 text-center">
             <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-6 border border-red-600/30">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
             </div>
             <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Drop Base Image Here</h2>
             <p className="text-gray-400 text-sm font-medium">Or click to select Source 1 (Style & Content)</p>
          </div>
        )}

        {isDragging && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/20 backdrop-blur-md border-4 border-dashed border-red-600 pointer-events-none animate-pulse">
             <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Release to Style</h2>
          </div>
        )}

        {hasImage && (
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="p-3 bg-black/60 hover:bg-red-600 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs font-black uppercase tracking-widest">Replace Base</span>
            </button>
          </div>
        )}

        {state.backgroundImage && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded shadow-lg animate-pulse">
            AI Generated Result
          </div>
        )}
      </div>
      
      <div className="flex gap-4 w-full justify-center">
        <button 
          onClick={downloadImage}
          disabled={!hasImage}
          className={`px-10 py-5 font-black rounded-2xl transition-all flex items-center gap-3 shadow-2xl uppercase tracking-tighter text-lg ${
            hasImage 
            ? 'bg-white text-black hover:bg-gray-200 active:scale-95 shadow-white/10' 
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Image
        </button>
      </div>
    </div>
  );
};

export default PreviewCanvas;
