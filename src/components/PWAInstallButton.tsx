import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, don't show
  if (isInstalled) {
    return null;
  }

  // Chromium / Desktop / Android flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0B3B60] text-white hover:bg-[#072942] transition shadow-xs whitespace-nowrap"
        title="התקן כאפליקציה במסך הבית"
      >
        <Download className="w-3.5 h-3.5" />
        <span>התקן אפליקציה</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition shadow-xs whitespace-nowrap"
          title="התקנה באייפון"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#0B3B60]" />
          <span>התקנה ל-iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-right">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-base font-bold text-slate-900">התקנת נועה באייפון / אייפד</h3>
              </div>
              <div className="space-y-3 text-sm text-slate-600 mb-6 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-[#0B3B60] font-bold text-xs shrink-0">1</span>
                  <p>לחץ על כפתור <strong>שיתוף (Share)</strong> בתחתית דפדפן Safari (סמל הריבוע עם החץ למעלה).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-[#0B3B60] font-bold text-xs shrink-0">2</span>
                  <p>גלול מטה ובחר באפשרות <strong>הוסף למסך הבית (Add to Home Screen)</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-[#0B3B60] font-bold text-xs shrink-0">3</span>
                  <p>לחץ <strong>הוסף (Add)</strong> לקבלת גישה מיידית ומהירה למודול נועה.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-[#0B3B60] py-2.5 text-sm font-semibold text-white hover:bg-[#072942] transition"
              >
                הבנתי, תודה
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
