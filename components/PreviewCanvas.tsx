
import React, { useRef, useEffect } from 'react';
import { ThumbnailState } from '../types';

interface PreviewCanvasProps {
  state: ThumbnailState;
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderId = useRef(0);

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

        // 1. Determine Background (Asset 1 takes priority as Full Screen)
        const bgSource = state.brandingImage1 || state.backgroundImage;

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
          ctx.fillStyle = '#111';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Darken Overlay
        if (state.overlayOpacity > 0) {
          ctx.fillStyle = `rgba(0,0,0,${state.overlayOpacity})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 3. Render Branding Overlay (Asset 2)
        if (state.brandingImage2) {
          try {
            const bImg = await loadImage(state.brandingImage2);
            if (currentId !== renderId.current) return;

            const bWidth = canvas.width * 0.45;
            const bHeight = (bWidth / bImg.width) * bImg.height;
            const bX = state.brandingPosition2 === 'left' ? -20 : canvas.width - bWidth + 20;
            const bY = canvas.height - bHeight;

            ctx.save();
            ctx.shadowBlur = 40;
            ctx.shadowColor = state.primaryColor || 'white';
            ctx.drawImage(bImg, bX, bY, bWidth, bHeight);
            ctx.restore();
            ctx.drawImage(bImg, bX, bY, bWidth, bHeight);
          } catch (e) {
            console.warn("Branding asset failed to load", e);
          }
        }

        // 4. Fixed Viral Layout Text (Bottom Left or Center)
        ctx.textAlign = 'left';
        const padding = state.aspectRatio === '16:9' ? 60 : 40;
        let x = padding;
        let y = canvas.height - (state.aspectRatio === '16:9' ? 180 : 350);

        // Adjust text to not overlap branding if on the same side
        if (state.brandingImage2 && state.brandingPosition2 === 'left') {
           x = canvas.width * 0.45;
        }

        const scaleFactor = state.aspectRatio === '16:9' ? 1 : 0.85;
        let mainFont = `bold ${90 * scaleFactor}px Montserrat`;
        let subFont = `bold ${45 * scaleFactor}px Montserrat`;

        if (state.textStyle === 'impact') {
          mainFont = `900 ${110 * scaleFactor}px Montserrat`;
          subFont = `900 ${50 * scaleFactor}px Montserrat`;
        } else if (state.textStyle === 'comic') {
          mainFont = `${90 * scaleFactor}px Bangers`;
          subFont = `${45 * scaleFactor}px Bangers`;
        } else if (state.textStyle === 'gradient') {
          const grad = ctx.createLinearGradient(0, y - 50, 0, y + 50);
          grad.addColorStop(0, '#fff');
          grad.addColorStop(1, state.primaryColor);
          ctx.fillStyle = grad;
        }

        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 10;
        
        // Subtitle
        ctx.font = subFont;
        ctx.fillStyle = '#fff';
        ctx.fillText(state.subtitle, x, y + (100 * scaleFactor));

        // Main Title
        ctx.font = mainFont;
        if (state.textStyle !== 'gradient') {
          ctx.fillStyle = state.primaryColor === '#ffffff' ? '#fff' : state.primaryColor;
        }
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 12 * scaleFactor;
        ctx.lineJoin = 'round';
        ctx.strokeText(state.title, x, y);
        ctx.fillText(state.title, x, y);

      } catch (err) {
        console.error("Render failure:", err);
      }
    };

    render();
  }, [state, canvasWidth, canvasHeight]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `viral-thumbnail-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div 
        className="relative group rounded-xl overflow-hidden shadow-2xl shadow-black ring-1 ring-white/10"
        style={{ 
          maxWidth: '100%', 
          maxHeight: '70vh', 
          aspectRatio: state.aspectRatio === '16:9' ? '16/9' : '9/16' 
        }}
      >
        <canvas 
          ref={canvasRef} 
          width={canvasWidth} 
          height={canvasHeight}
          className="w-full h-full object-contain bg-[#1a1a1a]"
        />
      </div>
      
      <button 
        onClick={downloadImage}
        className="px-8 py-4 bg-white text-black font-black rounded-xl hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-3 shadow-xl"
      >
        Download {state.aspectRatio} Render
      </button>
    </div>
  );
};

export default PreviewCanvas;
