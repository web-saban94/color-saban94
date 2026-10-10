import React, { useState, useEffect } from 'react';
import { Order, SheetsSyncStatus } from '../types';
import { soundService } from '../utils/audioChime';
import { 
  X, 
  Lock, 
  Download, 
  RefreshCw, 
  Bell, 
  Trash2, 
  CheckCircle2, 
  Store, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Layers,
  Database
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'shades' | 'baskets' | 'sync'>('orders');

  const [shadesHistory, setShadesHistory] = useState<any[]>([]);
  const [basketsHistory, setBasketsHistory] = useState<any[]>([]);
  const [syncConfig, setSyncConfig] = useState<SheetsSyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch admin data on open
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchAdminData();
    }
  }, [isOpen, isAuthenticated]);

  const fetchAdminData = async () => {
    try {
      const [shadesRes, basketsRes, sheetsRes] = await Promise.all([
        fetch('/api/shades/history'),
        fetch('/api/baskets'),
        fetch('/api/sheets/config'),
      ]);
      const shadesData = await shadesRes.json();
      const basketsData = await basketsRes.json();
      const sheetsData = await sheetsRes.json();

      setShadesHistory(shadesData.shades || []);
      setBasketsHistory(basketsData.baskets || []);
      if (sheetsData.config) {
        setSyncConfig(sheetsData.config);
        setWebhookUrlInput(sheetsData.config.webhookUrl || '');
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode === '1994' || pinCode === 'saban' || pinCode === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
      soundService.playChime('tap');
    } else {
      setPinError(true);
      soundService.playChime('notification');
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    soundService.playChime('tap');

    try {
      const res = await fetch('/api/sheets/sync', { method: 'POST' });
      const data = await res.json();
      setSyncSuccessMsg(data.message || 'הסנכרון הושלם בהצלחה!');
      soundService.playChime('notification');
      fetchAdminData();
    } catch {
      setSyncSuccessMsg('שגיאה בסנכרון ל-Google Sheets.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveWebhook = async () => {
    try {
      await fetch('/api/sheets/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: webhookUrlInput }),
      });
      alert('כתובת ה-Webhook נשמרה בהצלחה!');
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetMemory = async () => {
    if (confirm('האם לאפס את זיכרון השיחות והמטמון של נועה?')) {
      await fetch('/api/admin/reset-memory', { method: 'POST' });
      localStorage.removeItem('saban_noa_chat_history');
      alert('זיכרון השיחה אופס.');
      soundService.playChime('tap');
    }
  };

  const handleTestChime = () => {
    soundService.playChime('order');
  };

  const sampleAppsScriptCode = `/**
 * ח.סבן חומרי בניין (1994) בע״מ – מודול נועה צבע וגוונים
 * סקריפט Google Apps Script מלא (Code.js)
 */
function onOpen() {
  SpreadsheetApp.getUi().createMenu("🎨 ח.סבן - ניהול גוונים והזמנות")
    .addItem("🚀 הקם ועצב את כל הטאבים מחדש", "setupAllSabanSheets")
    .addItem("🎨 הוסף גווני דוגמה למניפה (טמבור, נירלט, יעקבי)", "seedColorCatalog")
    .addToUi();
}

function setupAllSabanSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetCatalog = getOrCreateSheet(ss, "מניפת גוונים - קטלוג ארצי", 1);
  var sheetTalmid = getOrCreateSheet(ss, "הזמנות - סניף תלמיד 6", 2);
  var sheetHarash = getOrCreateSheet(ss, "הזמנות - סניף החרש אסף", 3);
  var sheetShades = getOrCreateSheet(ss, "גוונים שנבחרו בקנבס", 4);
  var sheetBaskets = getOrCreateSheet(ss, "סלים מומלצים - נועה Ai", 5);

  [sheetCatalog, sheetTalmid, sheetHarash, sheetShades, sheetBaskets].forEach(function(s) {
    s.setRightToLeft(true);
  });

  buildCatalog(sheetCatalog);
  buildOrders(sheetTalmid, "סניף תלמיד 6");
  buildOrders(sheetHarash, "סניף החרש אסף");
  seedColorCatalog();
  SpreadsheetApp.getUi().alert("כל הטאבים הוקמו ועוצבו בהצלחה!");
}

function getOrCreateSheet(ss, name, idx) {
  return ss.getSheetByName(name) || ss.insertSheet(name, idx - 1);
}

function buildCatalog(sheet) {
  sheet.clear();
  sheet.getRange("A1:J1").merge().setValue("🎨 ח.סבן (1994) בע״מ – קטלוג מניפות ארצי (טמבור, נירלט, יעקבי)")
    .setBackground("#0B3B60").setFontColor("#FFFFFF").setFontWeight("bold").setHorizontalAlignment("center");
  sheet.getRange(2, 1, 1, 10).setValues([["דוגמית", "קוד גוון", "שם הגוון", "חברה/יצרן", "מניפה", "קוד HEX", "משפחה", "משטח", "גימור", "עמוד"]]);
  sheet.getRange(2, 1, 1, 10).setBackground("#0284C7").setFontColor("#FFFFFF").setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setFrozenRows(2);
}

function buildOrders(sheet, branch) {
  sheet.clear();
  sheet.getRange("A1:K1").merge().setValue("🏢 מערכת הזמנות סניף – " + branch)
    .setBackground("#0B3B60").setFontColor("#FFFFFF").setFontWeight("bold").setHorizontalAlignment("center");
  sheet.getRange(2, 1, 1, 11).setValues([["מספר הזמנה", "תאריך", "שם לקוח", "טלפון", "גוון מבוקש", "סל מוצרים", "סה״כ ₪", "סטטוס", "איסוף משוער", "הערות", "סונכרן מנועה"]]);
  sheet.getRange(2, 1, 1, 11).setBackground("#0284C7").setFontColor("#FFFFFF").setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setFrozenRows(2);
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(["התקבלה", "בטיפול בסניף", "מוכנה לאיסוף", "נמסרה ללקוח"], true).build();
  sheet.getRange("H3:H1000").setDataValidation(rule);
}

function seedColorCatalog() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("מניפת גוונים - קטלוג ארצי");
  if (!sheet) return;
  var colors = [
    { code: "WW2202", name: "לראות צלול", brand: "טמבור", book: "המניפה 2026", hex: "#D7DDD4", fam: "לבן ופנינה", s: "קירות פנים", f: "מט משי", p: "עמ׳ 42" },
    { code: "IS 0155", name: "טרוורטין מדברי", brand: "נירלט", book: "אבני ארץ", hex: "#D9CDBF", fam: "אבן וחול", s: "קירות פנים", f: "מט משי", p: "עמ׳ 24" },
    { code: "0543", name: "בטון מעודן", brand: "טמבור", book: "המניפה", hex: "#C8CCCB", fam: "אפורים", s: "קירות פנים", f: "מט מהודר", p: "עמ׳ 84" },
    { code: "SB-0B3B", name: "כחול ח.סבן מורשת", brand: "ח.סבן", book: "קולקציית 1994", hex: "#0B3B60", fam: "כחול Saban", s: "קירות פנים", f: "מט משי", p: "עמ׳ 3" },
    { code: "IS 0412", name: "אקליפטוס גלילי", brand: "נירלט", book: "צבעי הטבע", hex: "#A7B7A3", fam: "מרווה וטבע", s: "קירות פנים", f: "מט משי", p: "עמ׳ 67" }
  ];
  for (var i = 0; i < colors.length; i++) {
    var row = i + 3;
    var c = colors[i];
    sheet.getRange(row, 1).setValue("■").setBackground(c.hex).setFontColor(c.hex).setHorizontalAlignment("center");
    sheet.getRange(row, 2).setValue(c.code).setFontWeight("bold").setHorizontalAlignment("center");
    sheet.getRange(row, 3).setValue(c.name);
    sheet.getRange(row, 4).setValue(c.brand).setHorizontalAlignment("center");
    sheet.getRange(row, 5).setValue(c.book);
    sheet.getRange(row, 6).setValue(c.hex).setFontFamily("monospace").setHorizontalAlignment("center");
    sheet.getRange(row, 7).setValue(c.fam).setHorizontalAlignment("center");
    sheet.getRange(row, 8).setValue(c.s).setHorizontalAlignment("center");
    sheet.getRange(row, 9).setValue(c.f).setHorizontalAlignment("center");
    sheet.getRange(row, 10).setValue(c.p).setHorizontalAlignment("center");
  }
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (data.orders) {
    data.orders.forEach(function(o) {
      var sheetName = (o.branch && o.branch.indexOf("החרש") > -1) ? "הזמנות - סניף החרש אסף" : "הזמנות - סניף תלמיד 6";
      var s = ss.getSheetByName(sheetName);
      if (s) {
        s.appendRow([o.orderNumber, o.createdAt, o.customerName, o.customerPhone, o.shadeSummary, (o.items||[]).map(function(i){return (i.product?i.product.name:i.name)+" x"+i.quantity;}).join(", "), o.totalAmount, o.status, "תוך 30 דקות", o.notes, "כן"]);
      }
    });
  }
  return ContentService.createTextOutput(JSON.stringify({status:"success"})).setMimeType(ContentService.MimeType.JSON);
}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto text-right flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-l from-slate-900 via-[#0B3B60] to-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Database className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white leading-tight">
                  מרכז ניהול וסנכרון Google Sheets
                </h3>
                <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                  גישת מנהל
                </span>
              </div>
              <p className="text-xs text-sky-200/80">ח.סבן חומרי בניין (1994) בע״מ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Check */}
        {!isAuthenticated ? (
          <div className="p-8 max-w-sm mx-auto text-center space-y-4 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0B3B60] flex items-center justify-center mx-auto border border-sky-100 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">כניסת מנהל מערכת ח.סבן</h4>
              <p className="text-xs text-slate-500 mt-1">הזן קוד גישה לניהול הזמנות, גוונים וסנכרון Sheets (קוד ברירת מחדל: 1994)</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                placeholder="הזן קוד PIN (1994)"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full px-4 py-2.5 text-center text-sm font-mono tracking-widest rounded-xl border border-slate-200 focus:outline-none focus:border-[#0B3B60]"
              />
              {pinError && <p className="text-xs text-red-500">קוד שגוי, נסה 1994</p>}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0B3B60] text-white text-xs font-bold hover:bg-[#072942] transition shadow-md"
              >
                כניסה ללוח הניהול
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Views */
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Navigation Tabs */}
            <div className="px-5 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
              <button
                onClick={() => { setActiveTab('orders'); soundService.playChime('tap'); }}
                className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'bg-white text-[#0B3B60] border-t-2 border-t-[#0B3B60] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                גיליון הזמנות ({orders.length})
              </button>

              <button
                onClick={() => { setActiveTab('shades'); soundService.playChime('tap'); }}
                className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap ${
                  activeTab === 'shades'
                    ? 'bg-white text-[#0B3B60] border-t-2 border-t-[#0B3B60] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                גוונים שנבחרו ({shadesHistory.length})
              </button>

              <button
                onClick={() => { setActiveTab('baskets'); soundService.playChime('tap'); }}
                className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap ${
                  activeTab === 'baskets'
                    ? 'bg-white text-[#0B3B60] border-t-2 border-t-[#0B3B60] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                סלים מומלצים ({basketsHistory.length})
              </button>

              <button
                onClick={() => { setActiveTab('sync'); soundService.playChime('tap'); }}
                className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'sync'
                    ? 'bg-white text-[#0B3B60] border-t-2 border-t-[#0B3B60] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>סנכרון Google Sheets & הגדרות</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {/* TAB 1: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">רשימת הזמנות פעילות בסניפים</span>
                    <a
                      href="/api/sheets/export/orders"
                      download="orders.csv"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>הורד גיליון הזמנות CSV</span>
                    </a>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    {orders.map((o) => (
                      <div key={o.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-[#0B3B60]">{o.orderNumber}</span>
                            <span className="font-bold text-slate-900">{o.customerName}</span>
                            <span className="text-slate-400 font-mono">({o.customerPhone})</span>
                            <span className="bg-sky-50 text-sky-900 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                              סניף {o.branch}
                            </span>
                          </div>
                          {o.shadeSummary && (
                            <div className="text-[11px] text-slate-600">
                              גוון מבוקש: <strong>{o.shadeSummary}</strong>
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400">
                            {new Date(o.createdAt).toLocaleString('he-IL')} · סה״כ: <strong className="font-mono text-slate-900">₪{o.totalAmount}</strong>
                          </div>
                        </div>

                        {/* Status Select */}
                        <div className="flex items-center gap-2 shrink-0">
                          <label className="text-[11px] text-slate-500">סטטוס:</label>
                          <select
                            value={o.status}
                            onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as any)}
                            className="text-xs font-semibold px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#0B3B60]"
                          >
                            <option value="התקבלה">התקבלה</option>
                            <option value="בטיפול בסניף">בטיפול בסניף</option>
                            <option value="מוכנה לאיסוף">מוכנה לאיסוף</option>
                            <option value="נמסרה ללקוח">נמסרה ללקוח</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: SHADES LOG */}
              {activeTab === 'shades' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">היסטוריית גוונים שנבחרו בקנבס ובצ׳אט</span>
                    <a
                      href="/api/sheets/export/shades"
                      download="shades.csv"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>הורד גיליון גוונים CSV</span>
                    </a>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">דוגמית</th>
                          <th className="p-3">שם וקוד גוון</th>
                          <th className="p-3">יצרן</th>
                          <th className="p-3">סניף מיועד</th>
                          <th className="p-3">מקור</th>
                          <th className="p-3">זמן בחירה</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {shadesHistory.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <div className="w-5 h-5 rounded border border-black/10" style={{ backgroundColor: s.hex }} />
                            </td>
                            <td className="p-3 font-bold text-slate-800">{s.shadeName} ({s.shadeCode})</td>
                            <td className="p-3 text-slate-600">{s.manufacturer}</td>
                            <td className="p-3 text-slate-600">סניף {s.branch}</td>
                            <td className="p-3 text-sky-800 font-medium">{s.source}</td>
                            <td className="p-3 text-slate-400 font-mono text-[11px]">{new Date(s.timestamp).toLocaleTimeString('he-IL')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: RECOMMENDED BASKETS */}
              {activeTab === 'baskets' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">סלים מומלצים שהורכבו ע״י נועה ומשתמשים</span>
                    <a
                      href="/api/sheets/export/baskets"
                      download="baskets.csv"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>הורד גיליון סלים CSV</span>
                    </a>
                  </div>

                  <div className="space-y-2">
                    {basketsHistory.map((b, idx) => (
                      <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900">{b.category}</div>
                          <div className="text-[11px] text-slate-500 leading-relaxed max-w-xl truncate">
                            {b.itemsList}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            סניף: {b.branch} · פריטים: {b.itemsCount} · אופסל נכלל: {b.upsellIncluded ? 'כן' : 'לא'}
                          </div>
                        </div>

                        <div className="text-left shrink-0">
                          <span className="font-mono font-bold text-sm text-[#0B3B60]">₪{b.totalEstimate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: GOOGLE SHEETS & SYSTEM CONFIG */}
              {activeTab === 'sync' && (
                <div className="space-y-4">
                  {/* Google Sheets Live Sync Card */}
                  <div className="bg-gradient-to-r from-emerald-50/70 to-sky-50/70 p-4 rounded-2xl border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">מנוע סנכרון Google Sheets אוטומטי</h4>
                          <p className="text-xs text-slate-600">שומר בזמן אמת ב-3 גיליונות: הזמנות, גוונים שנבחרו, סלים מומלצים</p>
                        </div>
                      </div>

                      <button
                        onClick={handleTriggerSync}
                        disabled={isSyncing}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isSyncing ? 'מסנכרן כעת...' : 'סנכרן נתונים עכשיו'}</span>
                      </button>
                    </div>

                    {syncSuccessMsg && (
                      <div className="p-2.5 bg-white/90 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{syncSuccessMsg}</span>
                      </div>
                    )}
                  </div>

                  {/* Webhook Configuration */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <h5 className="font-bold text-slate-900">חיבור Webhook של Google Apps Script (אופציונלי לסנכרון ישיר חי):</h5>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/..."
                        value={webhookUrlInput}
                        onChange={(e) => setWebhookUrlInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0B3B60] font-mono text-[11px]"
                      />
                      <button
                        onClick={handleSaveWebhook}
                        className="px-4 py-2 rounded-xl bg-[#0B3B60] text-white font-bold hover:bg-[#072942] transition"
                      >
                        שמור כתובת
                      </button>
                    </div>
                  </div>

                  {/* Apps Script Template */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">קוד Google Apps Script מלא (Code.js) להקמת כל הטאבים:</span>
                      <div className="flex items-center gap-2">
                        <a
                          href="/Code.js"
                          download="Code.js"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0B3B60] text-white font-semibold text-[11px] hover:bg-[#072942] transition shadow-xs"
                          title="הורד קובץ Code.js למחשב"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>הורד קובץ Code.js</span>
                        </a>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(sampleAppsScriptCode);
                            setCopiedScript(true);
                            setTimeout(() => setCopiedScript(false), 2000);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-[11px] hover:bg-slate-100 transition shadow-xs"
                        >
                          {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedScript ? 'הועתק!' : 'העתק קוד'}</span>
                        </button>
                      </div>
                    </div>
                    <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[10px] font-mono overflow-x-auto max-h-36 leading-normal dir-ltr text-left">
                      {sampleAppsScriptCode}
                    </pre>
                  </div>

                  {/* Notifications and Audio Settings */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">צלצולי התראה ופעמון יוקרתי</div>
                        <div className="text-[11px] text-slate-500">משמיע צלצול בעת קבלת הזמנה או מענה מנועה</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTestChime}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs"
                      >
                        השמע צלצול בדיקה
                      </button>

                      <button
                        onClick={handleResetMemory}
                        className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-semibold text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>איפוס זיכרון שיחה ומטמון</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
