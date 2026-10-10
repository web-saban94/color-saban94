import React, { useState, useMemo } from 'react';
import { Shade, ProductItem, BranchId } from '../types';
import { soundService } from '../utils/audioChime';
import { 
  Search, 
  Eye, 
  MessageSquare, 
  ShoppingCart, 
  Sparkles,
  Check,
  RefreshCw,
  FileSpreadsheet,
  ExternalLink,
  Layers,
  CheckCircle2
} from 'lucide-react';

import { TintDispenserModal } from './TintDispenserModal';
import { Pipette } from 'lucide-react';

interface ShadeLibraryProps {
  shades: Shade[];
  activeShade: Shade;
  onSelectShadeForCanvas: (shade: Shade) => void;
  onSendToChat: (shade: Shade) => void;
  onAddToCart: (product: ProductItem, shade: Shade) => void;
  wallPaintProduct: ProductItem;
  onRefreshShades?: () => void;
  isSyncingShades?: boolean;
  lastShadesSyncTime?: string | null;
  shadesSource?: string;
  onInjectTintPastes?: () => Promise<void>;
  isInjectingPastes?: boolean;
  selectedBranch?: BranchId;
}

export const ShadeLibrary: React.FC<ShadeLibraryProps> = ({
  shades,
  activeShade,
  onSelectShadeForCanvas,
  onSendToChat,
  onAddToCart,
  wallPaintProduct,
  onRefreshShades,
  isSyncingShades = false,
  lastShadesSyncTime,
  shadesSource = 'google_sheets_live',
  onInjectTintPastes,
  isInjectingPastes = false,
  selectedBranch = 'תלמיד 6',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('הכל');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('הכל');
  const [selectedSurface, setSelectedSurface] = useState<string>('הכל');
  const [addedShadeId, setAddedShadeId] = useState<string | null>(null);
  const [activeDispenserShade, setActiveDispenserShade] = useState<Shade | null>(null);

  // Dynamically extract manufacturers and families from shades loaded from Google Sheets
  const manufacturers = useMemo(() => {
    const list = Array.from(new Set(shades.map((s) => s.manufacturer).filter(Boolean)));
    return ['הכל', ...list];
  }, [shades]);

  const families = useMemo(() => {
    const list = Array.from(new Set(shades.map((s) => s.family).filter(Boolean)));
    return ['הכל', ...list];
  }, [shades]);

  const surfaces = useMemo(() => {
    const list = Array.from(new Set(shades.map((s) => s.surfaceType).filter(Boolean)));
    return ['הכל', ...list];
  }, [shades]);

  const filteredShades = useMemo(() => {
    return shades.filter((s) => {
      const matchSearch =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.collectionName && s.collectionName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchFamily = selectedFamily === 'הכל' || s.family === selectedFamily;
      const matchManufacturer = selectedManufacturer === 'הכל' || s.manufacturer === selectedManufacturer;
      const matchSurface = selectedSurface === 'הכל' || s.surfaceType === selectedSurface;

      return matchSearch && matchFamily && matchManufacturer && matchSurface;
    });
  }, [shades, searchQuery, selectedFamily, selectedManufacturer, selectedSurface]);

  const handleQuickAdd = (shade: Shade) => {
    onAddToCart(wallPaintProduct, shade);
    setAddedShadeId(shade.id);
    soundService.playChime('tap');
    setTimeout(() => setAddedShadeId(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Live Google Sheets Status & Synchronize Banner */}
      <div className="bg-gradient-to-r from-[#0B3B60] via-[#0D4B7A] to-[#0284C7] text-white p-4 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
            <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black">מניפת גוונים חיה – מסונכרנת מ-Google Sheets</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>זמן אמת אונליין</span>
              </span>
            </div>
            <p className="text-xs text-sky-100/90 mt-0.5 flex flex-wrap items-center gap-2">
              <span>{shades.length} גוונים פעילים במניפה (טמבור, נירלט, יעקבי, סבן)</span>
              {lastShadesSyncTime && (
                <>
                  <span>•</span>
                  <span>סנכרון אחרון: {lastShadesSyncTime}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <a
            href="https://docs.google.com/spreadsheets/d/1vVE0ZOag1WuVMtFfLjB1u0nosRQ67C-s0FerqYH_Jdc/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition flex items-center gap-1.5 border border-white/20"
            title="פתח את הגיליון ב-Google Sheets"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">פתח גיליון</span>
          </a>

          {onInjectTintPastes && (
            <button
              onClick={() => {
                onInjectTintPastes();
                soundService.playChime('tap');
              }}
              disabled={isInjectingPastes || isSyncingShades}
              className={`px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold transition shadow-xs flex items-center gap-1.5 ${
                isInjectingPastes ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              title="הזרק משחות גוונים ממוחשבות לכל המניפה וסנכרן לגיליון Google Sheets"
            >
              <Pipette className={`w-3.5 h-3.5 ${isInjectingPastes ? 'animate-bounce' : ''}`} />
              <span>{isInjectingPastes ? 'מזריק ומסנכרן...' : '💉 הזרק משחות וסנכרן לגיליון'}</span>
            </button>
          )}

          {onRefreshShades && (
            <button
              onClick={() => {
                onRefreshShades();
                soundService.playChime('tap');
              }}
              disabled={isSyncingShades || isInjectingPastes}
              className={`px-3.5 py-1.5 rounded-xl bg-white text-[#0B3B60] hover:bg-sky-50 text-xs font-bold transition shadow-xs flex items-center gap-1.5 ${
                isSyncingShades ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingShades ? 'animate-spin' : ''}`} />
              <span>{isSyncingShades ? 'מסנכרן כעת...' : 'רענן מגיליון'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="חפש לפי שם, קוד גוון (WW2202, 0155)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0B3B60] focus:ring-1 focus:ring-[#0B3B60] transition"
            />
          </div>

          {/* Manufacturer Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">ספק / מותג:</span>
            {manufacturers.map((m) => (
              <button
                key={m}
                onClick={() => { setSelectedManufacturer(m); soundService.playChime('tap'); }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                  selectedManufacturer === m
                    ? 'bg-[#0B3B60] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Family Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">משפחת גוון:</span>
          {families.map((f) => (
            <button
              key={f}
              onClick={() => { setSelectedFamily(f); soundService.playChime('tap'); }}
              className={`px-3 py-1 text-xs font-medium rounded-xl whitespace-nowrap transition ${
                selectedFamily === f
                  ? 'bg-sky-50 text-[#0B3B60] border border-sky-300 font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Surfaces Horizontal Filter */}
        {surfaces.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">סוג תשתית:</span>
            {surfaces.map((s) => (
              <button
                key={s}
                onClick={() => { setSelectedSurface(s); soundService.playChime('tap'); }}
                className={`px-2.5 py-0.5 text-xs rounded-lg whitespace-nowrap transition ${
                  selectedSurface === s
                    ? 'bg-slate-800 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Shades Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filteredShades.map((shade) => {
          const isActive = activeShade.id === shade.id;
          const isAdded = addedShadeId === shade.id;

          return (
            <div
              key={shade.id}
              className={`bg-white rounded-2xl p-3.5 border transition hover:shadow-md flex flex-col justify-between ${
                isActive
                  ? 'border-[#0B3B60] ring-2 ring-[#0B3B60]/20 shadow-sm'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                {/* Swatch Sample */}
                <div className="relative mb-3">
                  <div
                    className="w-full h-24 rounded-xl shadow-inner border border-black/10 relative overflow-hidden flex items-end p-2 transition-transform hover:scale-[1.01]"
                    style={{ backgroundColor: shade.hex }}
                  >
                    {/* Visual texture sheen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/15 via-transparent to-white/20 pointer-events-none" />

                    <div className="relative z-10 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] font-mono font-bold text-slate-900 shadow-xs">
                      {shade.code}
                    </div>

                    {shade.isPopular && (
                      <div className="absolute top-2 left-2 bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>נבחר ע״י אדריכלים</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shade Metadata */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {shade.name}
                    </h4>
                    <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded shrink-0">
                      {shade.manufacturer}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {shade.description}
                  </p>

                  <div className="flex items-center flex-wrap gap-1.5 pt-1 text-[11px] text-slate-400 font-medium">
                    <span>{shade.surfaceType}</span>
                    <span aria-hidden="true">·</span>
                    <span>{shade.finishType || 'מט משי'}</span>
                    {shade.fandeckPage && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#0B3B60] font-bold bg-sky-50 px-1 py-0.2 rounded">{shade.fandeckPage}</span>
                      </>
                    )}
                  </div>

                  {/* Tint Pastes & Base Formula Badge */}
                  {shade.tintFormula && (
                    <div className="pt-2 flex flex-wrap items-center gap-1 border-t border-slate-100/80 mt-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {shade.tintFormula.baseCode || 'BW'}
                      </span>
                      {shade.tintFormula.pastes.slice(0, 3).map((p) => (
                        <span 
                          key={p.pasteCode} 
                          className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1"
                          title={`${p.name}: ${p.amountMlPerLiter} מ״ל לליטר`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.colorHex }} />
                          <span>{p.pasteCode}:{p.amountMlPerLiter}m</span>
                        </span>
                      ))}
                      {shade.tintFormula.pastes.length > 3 && (
                        <span className="text-[9px] text-slate-400">+{shade.tintFormula.pastes.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => {
                    onSelectShadeForCanvas(shade);
                    soundService.playChime('tap');
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    isActive
                      ? 'bg-[#0B3B60] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="הצג בקנבס"
                >
                  <Eye className="w-3 h-3" />
                  <span>{isActive ? 'מוצג כעת' : 'לקנבס'}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveDispenserShade(shade);
                    soundService.playChime('tap');
                  }}
                  className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition flex items-center gap-1"
                  title="מחשבון והזרקת משחות גיוון במכונה"
                >
                  <Pipette className="w-3 h-3 text-amber-600" />
                  <span>משחות</span>
                </button>

                <button
                  onClick={() => {
                    onSendToChat(shade);
                    soundService.playChime('tap');
                  }}
                  className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-sky-50 text-[#0B3B60] hover:bg-sky-100 transition flex items-center gap-1"
                  title="התייעץ עם נועה על גוון זה"
                >
                  <MessageSquare className="w-3 h-3 text-sky-600" />
                  <span>לצ׳אט</span>
                </button>

                <button
                  onClick={() => handleQuickAdd(shade)}
                  className={`p-1.5 rounded-xl transition ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="הוסף להזמנה"
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredShades.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-500">לא נמצאו גוונים התואמים את הסינון</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedFamily('הכל'); setSelectedManufacturer('הכל'); }}
            className="mt-2 text-xs font-bold text-[#0B3B60] hover:underline"
          >
            אפס סינונים
          </button>
        </div>
      )}

      {/* Interactive Tint Dispenser Modal */}
      {activeDispenserShade && (
        <TintDispenserModal
          isOpen={Boolean(activeDispenserShade)}
          onClose={() => setActiveDispenserShade(null)}
          shade={activeDispenserShade}
          selectedBranch={selectedBranch}
          onSyncToSheet={onInjectTintPastes}
          isSyncing={isInjectingPastes}
        />
      )}
    </div>
  );
};
