import React, { useState } from 'react';
import { Shade, BranchId } from '../types';
import { computeDispenseForVolume, COLORANTS_INFO, ML_PER_SHOT } from '../utils/tintFormulas';
import { soundService } from '../utils/audioChime';
import { 
  X, 
  Pipette, 
  CheckCircle2, 
  Layers, 
  RefreshCw, 
  Volume2, 
  Copy, 
  Check, 
  ExternalLink,
  Beaker,
  Clock,
  Sparkles
} from 'lucide-react';

interface TintDispenserModalProps {
  isOpen: boolean;
  onClose: () => void;
  shade: Shade;
  selectedBranch: BranchId;
  onSyncToSheet?: () => Promise<void>;
  isSyncing?: boolean;
}

const CAN_VOLUMES = [
  { volume: 0.75, label: '0.75 ליטר (דוגמית)' },
  { volume: 1, label: '1 ליטר (מיכל אישי)' },
  { volume: 3, label: '3 ליטר (חדר סטנדרט)' },
  { volume: 5, label: '5 ליטר (דירה ממוצעת)' },
  { volume: 18, label: '18 ליטר (פח קבלנים)' },
];

export const TintDispenserModal: React.FC<TintDispenserModalProps> = ({
  isOpen,
  onClose,
  shade,
  selectedBranch,
  onSyncToSheet,
  isSyncing = false,
}) => {
  const [selectedVolume, setSelectedVolume] = useState<number>(1);
  const [isDispensing, setIsDispensing] = useState(false);
  const [dispenseProgress, setDispenseProgress] = useState(0);
  const [dispenseCompleted, setDispenseCompleted] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);

  if (!isOpen) return null;

  const formula = shade.tintFormula;
  const dispenseData = formula ? computeDispenseForVolume(formula, selectedVolume) : null;

  const handleStartDispense = () => {
    setIsDispensing(true);
    setDispenseProgress(0);
    setDispenseCompleted(false);
    soundService.playChime('tap');

    const interval = setInterval(() => {
      setDispenseProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDispensing(false);
          setDispenseCompleted(true);
          soundService.playChime('order');
          return 100;
        }
        return prev + 12;
      });
    }, 150);
  };

  const handleCopyFormula = () => {
    if (!dispenseData) return;
    const text = `ח.סבן (${selectedBranch}) - נוסחת גיוון ממוחשבת:
גוון: ${shade.name} (${shade.code}) - ${shade.manufacturer}
בסיס צבע: ${dispenseData.base}
נפח פחית: ${selectedVolume} ליטר
משחות מוזרקות:
${dispenseData.scaledPastes.map((p) => `• ${p.name}: ${p.scaledMl} מ״ל (${p.scaledShots} שוטים)`).join('\n')}
סה״כ משחה: ${dispenseData.totalVolumeMl} מ״ל
הוראות: ערבול במערבל גירוסקופי ${dispenseData.shakerTimeSeconds} שניות.`;

    navigator.clipboard.writeText(text);
    setCopiedFormula(true);
    soundService.playChime('notification');
    setTimeout(() => setCopiedFormula(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Shade Swatch */}
        <div className="relative p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl shadow-md border-2 border-white ring-2 ring-slate-200/80 flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: shade.hex }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent pointer-events-none" />
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-white backdrop-blur-xs">
                {shade.code}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  {shade.manufacturer}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {shade.collectionName || 'המניפה'}
                </span>
                {shade.fandeckPage && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {shade.fandeckPage}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {shade.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                מחלקת גוונים ממוחשבת • {selectedBranch}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Base & Machine Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                בסיס גיוון נדרש
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="font-bold text-sm text-slate-900">
                  {dispenseData?.base || 'בסיס לבן (BW)'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                סה״כ משחת גיוון לפחית
              </span>
              <div className="flex items-center gap-2">
                <Beaker className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-sm text-slate-900">
                  {dispenseData ? `${dispenseData.totalVolumeMl} מ״ל` : '0 מ״ל'}
                </span>
                <span className="text-xs text-slate-400">
                  ({dispenseData?.totalVolumeShots} שוטים)
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                זמן ערבול גירוסקופי
              </span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-sm text-slate-900">
                  {dispenseData?.shakerTimeSeconds || 180} שניות
                </span>
              </div>
            </div>
          </div>

          {/* Volume Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              בחר נפח פחית / מיכל צבע לחישוב כמויות הזרקה:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CAN_VOLUMES.map((item) => {
                const isSelected = selectedVolume === item.volume;
                return (
                  <button
                    key={item.volume}
                    onClick={() => {
                      setSelectedVolume(item.volume);
                      setDispenseCompleted(false);
                      soundService.playChime('tap');
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                      isSelected
                        ? 'bg-saban-blue text-white border-saban-blue shadow-sm ring-2 ring-saban-blue/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colorants Pastes Breakdown */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Pipette className="w-4 h-4 text-saban-blue" />
                <h3 className="text-sm font-bold text-slate-900">
                  פירוט משחות גוונים להזרקה במכונה ({selectedVolume} ליטר)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                1 שוט = 1/48 אונקיה (~0.616 מ״ל)
              </span>
            </div>

            {dispenseData && dispenseData.scaledPastes.length > 0 ? (
              <div className="space-y-2.5">
                {dispenseData.scaledPastes.map((p) => {
                  const info = COLORANTS_INFO[p.pasteCode];
                  return (
                    <div 
                      key={p.pasteCode}
                      className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between shadow-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-7 h-7 rounded-lg shadow-inner border border-slate-300 flex items-center justify-center font-bold text-[11px] text-white"
                          style={{ backgroundColor: p.colorHex || info?.colorHex || '#333' }}
                        >
                          {p.pasteCode}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-800">
                            {p.name}
                          </div>
                          {info && (
                            <div className="text-[10px] text-slate-400">
                              {info.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-left font-mono">
                        <span className="text-sm font-bold text-slate-900">
                          {p.scaledMl} מ״ל
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {p.scaledShots} שוטים
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                לבן שלג בסיס טהור - אין צורך בהזרקת משחות גוונים. מוכן לשימוש ישיר.
              </div>
            )}
          </div>

          {/* Dispensing Animation / Progress */}
          {isDispensing && (
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-sky-900 mb-2">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                  מזרק מכונת הגיוון פעיל: מזריק קולורנטים לפחית {selectedVolume}L...
                </span>
                <span>{dispenseProgress}%</span>
              </div>
              <div className="w-full bg-sky-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-sky-600 h-2.5 rounded-full transition-all duration-150"
                  style={{ width: `${dispenseProgress}%` }}
                />
              </div>
            </div>
          )}

          {dispenseCompleted && (
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  הזרקת המשחות הושלמה בהצלחה! העבר את הפחית למערבל גירוסקופי ל-{dispenseData?.shakerTimeSeconds} שניות.
                </span>
              </div>
              <span className="text-[11px] bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded font-mono">
                מוכן למסירה
              </span>
            </div>
          )}

          {/* Machine notes */}
          {formula?.machineDispenseNote && (
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 flex items-center gap-2">
              <span className="font-semibold text-slate-700">הנחיות דלפק:</span>
              <span>{formula.machineDispenseNote}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFormula}
              className="py-2 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              {copiedFormula ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>הועתק ללוח!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>העתק נוסחה להדפסה</span>
                </>
              )}
            </button>

            {onSyncToSheet && (
              <button
                onClick={onSyncToSheet}
                disabled={isSyncing}
                className="py-2 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>סנכרן ל-Google Sheets</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartDispense}
              disabled={isDispensing}
              className="py-2.5 px-5 bg-saban-blue text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Pipette className="w-4 h-4" />
              <span>הזרק משחות במכונת גיוון</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
