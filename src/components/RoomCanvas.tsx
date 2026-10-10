import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Shade, ProductItem } from '../types';
import { soundService } from '../utils/audioChime';
import { 
  Upload, 
  RotateCcw, 
  Sun, 
  Sunset, 
  CloudSun, 
  MessageSquare, 
  ShoppingCart, 
  Sparkles, 
  Check, 
  SlidersHorizontal,
  Paintbrush,
  Image as ImageIcon
} from 'lucide-react';

interface RoomCanvasProps {
  currentShade: Shade;
  onSelectShade: (shade: Shade) => void;
  onSendToChat: (shade: Shade, roomNote?: string) => void;
  onAddToCart: (product: ProductItem, shade?: Shade, qty?: number) => void;
  onAnalyzeWallPhoto: (imageDataUrl: string) => void;
  bonderolProduct: ProductItem;
  tesaProduct: ProductItem;
  wallPaintProduct: ProductItem;
}

type AmbientLighting = '3000K' | '4000K' | '5000K';

export const RoomCanvas: React.FC<RoomCanvasProps> = ({
  currentShade,
  onSendToChat,
  onAddToCart,
  onAnalyzeWallPhoto,
  bonderolProduct,
  tesaProduct,
  wallPaintProduct,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Template room images
  const sampleRooms = [
    {
      id: 'living',
      name: 'סלון מודרני סקנדינבי',
      src: '/src/assets/images/room_living_modern_1791593484427.jpg',
    },
    {
      id: 'bedroom',
      name: 'חדר שינה מינימליסטי',
      src: '/src/assets/images/room_bedroom_minimal_1791593495013.jpg',
    },
    {
      id: 'inspection',
      name: 'בדיקת קיר וסדקים (Ai)',
      src: '/src/assets/images/room_wall_damage_1791593506091.jpg',
    },
  ];

  const [activeImageSrc, setActiveImageSrc] = useState<string>(sampleRooms[0].src);
  const [ambientLighting, setAmbientLighting] = useState<AmbientLighting>('4000K');
  const [lightnessSlider, setLightnessSlider] = useState<number>(0); // -50 to +50
  const [paintMode, setPaintMode] = useState<'full' | 'brush'>('full');
  const [brushIntensity, setBrushIntensity] = useState<number>(75);
  const [isUpsellAdded, setIsUpsellAdded] = useState<boolean>(false);
  const [isPaintAdded, setIsPaintAdded] = useState<boolean>(false);
  const [isCustomUploaded, setIsCustomUploaded] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Adjust hex color based on lightness slider
  const getAdjustedHex = useCallback((baseHex: string, sliderVal: number): string => {
    let hex = baseHex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const num = parseInt(hex, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    // Shift based on slider percentage (-50 to +50)
    const factor = sliderVal / 100;
    if (factor > 0) {
      r = Math.min(255, Math.round(r + (255 - r) * factor));
      g = Math.min(255, Math.round(g + (255 - g) * factor));
      b = Math.min(255, Math.round(b + (255 - b) * factor));
    } else if (factor < 0) {
      r = Math.max(0, Math.round(r * (1 + factor)));
      g = Math.max(0, Math.round(g * (1 + factor)));
      b = Math.max(0, Math.round(b * (1 + factor)));
    }

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }, []);

  const activeColorHex = getAdjustedHex(currentShade.hex, lightnessSlider);

  // Render canvas with real-time blending algorithm
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw base room photograph
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Prepare color overlay
    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = width;
    overlayCanvas.height = height;
    const oCtx = overlayCanvas.getContext('2d');
    if (!oCtx) return;

    if (paintMode === 'full') {
      // Automatic wall tinting: soft-light / multiply with luminosity preservation
      oCtx.fillStyle = activeColorHex;
      oCtx.fillRect(0, 0, width, height);

      // Ambient lighting color filter
      if (ambientLighting === '3000K') {
        oCtx.fillStyle = 'rgba(255, 179, 71, 0.16)'; // Warm golden hour
        oCtx.fillRect(0, 0, width, height);
      } else if (ambientLighting === '5000K') {
        oCtx.fillStyle = 'rgba(173, 216, 230, 0.12)'; // Cool architectural
        oCtx.fillRect(0, 0, width, height);
      }

      ctx.save();
      // Multiply blend mode maintains deep textures, furniture silhouettes, and shadows
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.58;
      ctx.drawImage(overlayCanvas, 0, 0);

      // Soft light overlay brings out pigment luminescence
      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = 0.65;
      ctx.drawImage(overlayCanvas, 0, 0);
      ctx.restore();
    } else {
      // Interactive brush paint mode using maskCanvas
      if (maskCanvasRef.current) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = (brushIntensity / 100) * 0.75;
        ctx.drawImage(maskCanvasRef.current, 0, 0);

        ctx.globalCompositeOperation = 'soft-light';
        ctx.globalAlpha = (brushIntensity / 100) * 0.8;
        ctx.drawImage(maskCanvasRef.current, 0, 0);
        ctx.restore();
      }
    }
  }, [activeColorHex, ambientLighting, paintMode, brushIntensity]);

  // Load image onto canvas
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeImageSrc;
    img.onload = () => {
      imageObjRef.current = img;
      if (canvasRef.current) {
        canvasRef.current.width = img.naturalWidth || 1280;
        canvasRef.current.height = img.naturalHeight || 720;

        // Reset or init mask canvas
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = canvasRef.current.width;
        maskCanvas.height = canvasRef.current.height;
        maskCanvasRef.current = maskCanvas;
      }
      renderCanvas();
    };
  }, [activeImageSrc, renderCanvas]);

  // Re-render when shade, slider, lighting, or paint mode changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle touch / brush drawing
  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (paintMode !== 'brush' || !isDrawing || !maskCanvasRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const mCtx = maskCanvasRef.current.getContext('2d');
    if (mCtx) {
      mCtx.beginPath();
      mCtx.arc(x, y, 45 * scaleX, 0, Math.PI * 2);
      mCtx.fillStyle = activeColorHex;
      mCtx.fill();
    }
    renderCanvas();
  };

  // Image file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const res = event.target.result as string;
          setActiveImageSrc(res);
          setIsCustomUploaded(true);
          soundService.playChime('tap');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUpsell = () => {
    onAddToCart(bonderolProduct, undefined, 1);
    onAddToCart(tesaProduct, undefined, 2);
    setIsUpsellAdded(true);
    soundService.playChime('tap');
    setTimeout(() => setIsUpsellAdded(false), 3000);
  };

  const handleAddPaint = () => {
    onAddToCart(wallPaintProduct, currentShade, 1);
    setIsPaintAdded(true);
    soundService.playChime('tap');
    setTimeout(() => setIsPaintAdded(false), 3000);
  };

  const handleResetCanvas = () => {
    setLightnessSlider(0);
    setAmbientLighting('4000K');
    if (maskCanvasRef.current) {
      const mCtx = maskCanvasRef.current.getContext('2d');
      if (mCtx) {
        mCtx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      }
    }
    renderCanvas();
    soundService.playChime('tap');
  };

  return (
    <div className="space-y-4">
      {/* Canvas Viewport Container */}
      <div 
        ref={containerRef} 
        className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 aspect-16/10 md:aspect-16/9 flex items-center justify-center select-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={() => setIsDrawing(true)}
          onMouseUp={() => setIsDrawing(false)}
          onMouseMove={handleDraw}
          onTouchStart={() => setIsDrawing(true)}
          onTouchEnd={() => setIsDrawing(false)}
          onTouchMove={handleDraw}
          className={`w-full h-full object-cover ${paintMode === 'brush' ? 'cursor-crosshair' : 'cursor-default'}`}
        />

        {/* Floating Quick Action Overlay on Canvas */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {/* Surface & Mode Switcher */}
          <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-xs border border-white/40 flex items-center gap-1 text-xs font-semibold text-slate-800">
            <button
              onClick={() => { setPaintMode('full'); soundService.playChime('tap'); }}
              className={`px-2 py-1 rounded-lg transition ${paintMode === 'full' ? 'bg-[#0B3B60] text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              המחשת חלל מלאה
            </button>
            <button
              onClick={() => { setPaintMode('brush'); soundService.playChime('tap'); }}
              className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${paintMode === 'brush' ? 'bg-[#0B3B60] text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <Paintbrush className="w-3 h-3" />
              מברשת מגע
            </button>
          </div>

          <button
            onClick={handleResetCanvas}
            title="איפוס גוון ותאורה"
            className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur-md border border-white/40 text-slate-700 flex items-center justify-center hover:bg-white shadow-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Shade Badge inside Canvas (Matching Reference UI) */}
        <div className="absolute bottom-3 right-3 left-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-white/80 pointer-events-auto flex items-center gap-3">
            <div 
              className="w-7 h-7 rounded-lg shadow-inner border border-black/10 shrink-0 transition-colors" 
              style={{ backgroundColor: activeColorHex }} 
            />
            <div className="text-right">
              <div className="text-xs font-extrabold text-slate-900 leading-tight">
                {currentShade.name}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {currentShade.manufacturer} · {currentShade.code} · {currentShade.finishType || 'מט משי'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => {
                onSendToChat(currentShade, `מבקש התייעצות על הגוון ${currentShade.name} בחלל זה`);
                soundService.playChime('tap');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md text-xs font-bold text-[#0B3B60] shadow-lg border border-white/80 hover:bg-white transition"
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
              <span>התייעץ עם נועה</span>
            </button>

            <button
              onClick={handleAddPaint}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-lg transition ${
                isPaintAdded ? 'bg-emerald-600 text-white' : 'bg-[#0B3B60] text-white hover:bg-[#072942]'
              }`}
            >
              {isPaintAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
              <span>{isPaintAdded ? 'נוסף לסל!' : 'הוסף צבע לסל'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Template Rooms & Photo Upload Bar */}
      <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-bold text-slate-600 whitespace-nowrap">בחר חלל:</span>
          {sampleRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => {
                setActiveImageSrc(room.src);
                setIsCustomUploaded(false);
                soundService.playChime('tap');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeImageSrc === room.src && !isCustomUploaded
                  ? 'bg-sky-50 text-[#0B3B60] border border-sky-200 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <ImageIcon className="w-3 h-3 text-sky-600" />
              <span>{room.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Custom Upload Button */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>העלה תמונה שלך</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Quick AI Wall Diagnostic Trigger */}
          <button
            onClick={() => onAnalyzeWallPhoto(activeImageSrc)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>אבחון סדקים ורטיבות (Ai)</span>
          </button>
        </div>
      </div>

      {/* Control Sliders & Ambient Lighting (Matching Reference Interface) */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
        {/* Slider 1: בורר גוון (Shade Slider: כהה <---> בהיר) */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0B3B60]" />
              <span>בורר גוון (Shade Slider)</span>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {lightnessSlider > 0 ? `בהיר יותר (+${lightnessSlider}%)` : lightnessSlider < 0 ? `כהה יותר (${lightnessSlider}%)` : 'גוון יצרן מדויק'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">כהה יותר</span>
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={lightnessSlider}
              onChange={(e) => setLightnessSlider(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gradient-to-r from-slate-700 via-slate-300 to-amber-100 rounded-lg appearance-none cursor-pointer accent-[#0B3B60]"
            />
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">בהיר יותר</span>
          </div>
        </div>

        {/* Ambient Lighting Selector (Ambient Filters from Reference Image) */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-700">סימולציית תאורה (Ambient Filters):</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setAmbientLighting('3000K'); soundService.playChime('tap'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                ambientLighting === '3000K'
                  ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sunset className="w-3.5 h-3.5 text-amber-500" />
              <span>תאורה חמה 3000K</span>
            </button>

            <button
              onClick={() => { setAmbientLighting('4000K'); soundService.playChime('tap'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                ambientLighting === '4000K'
                  ? 'bg-sky-50 text-sky-900 border-sky-300 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-sky-500" />
              <span>אור יום טבעי 4000K</span>
            </button>

            <button
              onClick={() => { setAmbientLighting('5000K'); soundService.playChime('tap'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                ambientLighting === '5000K'
                  ? 'bg-slate-100 text-slate-900 border-slate-300 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5 text-slate-500" />
              <span>אור קריר 5000K</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upsell Card (הצעה טכנית חובה) - Replicated from User Reference Mockup */}
      <div className="bg-gradient-to-r from-amber-50/90 via-white to-sky-50/70 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Product Thumbnails */}
          <div className="flex -space-x-3 space-x-reverse shrink-0">
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
              <span className="text-[10px] font-extrabold text-[#0B3B60] leading-none text-center">בונדרול סופר</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
              <span className="text-[10px] font-extrabold text-blue-600 leading-none text-center">Tesa 4435</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-900">הצעה טכנית חובה (Upsell)</span>
              <span className="text-[11px] text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md font-bold">מפרט סבן מקצועי</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-snug">
              לצביעה מושלמת וקווים חדים: יישמו <strong>בונדרול סופר</strong> לפני הצבע והשתמשו ב-<strong>Tesa 4435</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={handleAddUpsell}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs shrink-0 flex items-center gap-1.5 ${
            isUpsellAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-[#0B3B60] text-white hover:bg-[#072942]'
          }`}
        >
          {isUpsellAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
          <span>{isUpsellAdded ? 'המוצרים נוספו לסל!' : 'הוסף לסל (בונדרול + Tesa)'}</span>
        </button>
      </div>
    </div>
  );
};
