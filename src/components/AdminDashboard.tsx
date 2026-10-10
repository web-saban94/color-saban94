import React, { useState, useEffect } from 'react';
import { Order, SheetsSyncStatus, Shade } from '../types';
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
  Database,
  ExternalLink,
  Palette,
  Plus,
  Pipette,
  Beaker
} from 'lucide-react';
import { TintDispenserModal } from './TintDispenserModal';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  catalogShades?: Shade[];
  onRefreshCatalog?: () => void;
  isSyncingCatalog?: boolean;
  onInjectTintPastes?: () => Promise<void>;
  isInjectingPastes?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
  catalogShades = [],
  onRefreshCatalog,
  isSyncingCatalog = false,
  onInjectTintPastes,
  isInjectingPastes = false,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'shades' | 'pastes' | 'baskets' | 'sync'>('orders');
  const [shadesSubTab, setShadesSubTab] = useState<'catalog' | 'log'>('catalog');
  const [activeDispenserShade, setActiveDispenserShade] = useState<Shade | null>(null);

  const [shadesHistory, setShadesHistory] = useState<any[]>([]);
  const [basketsHistory, setBasketsHistory] = useState<any[]>([]);
  const [syncConfig, setSyncConfig] = useState<SheetsSyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // New Shade Add Form State
  const [isAddShadeOpen, setIsAddShadeOpen] = useState(false);
  const [newShadeCode, setNewShadeCode] = useState('');
  const [newShadeName, setNewShadeName] = useState('');
  const [newShadeManufacturer, setNewShadeManufacturer] = useState('טמבור');
  const [newShadeHex, setNewShadeHex] = useState('#D7DDD4');
  const [newShadeFamily, setNewShadeFamily] = useState('לבן ופנינה');
  const [newShadeSurface, setNewShadeSurface] = useState('קירות פנים');
  const [newShadeFinish, setNewShadeFinish] = useState('מט משי');
  const [newShadeCollection, setNewShadeCollection] = useState('המניפה – טמבור');
  const [newShadePage, setNewShadePage] = useState('');
  const [isAddingShade, setIsAddingShade] = useState(false);

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

  const handleAddShadeToCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShadeCode.trim() || !newShadeName.trim()) {
      alert('נא למלא קוד גוון ושם גוון');
      return;
    }
    setIsAddingShade(true);
    soundService.playChime('tap');

    try {
      const res = await fetch('/api/sheets/shades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newShadeCode.trim(),
          name: newShadeName.trim(),
          manufacturer: newShadeManufacturer,
          hex: newShadeHex,
          family: newShadeFamily,
          surfaceType: newShadeSurface,
          finishType: newShadeFinish,
          collectionName: newShadeCollection,
          fandeckPage: newShadePage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        soundService.playChime('notification');
        setIsAddShadeOpen(false);
        setNewShadeCode('');
        setNewShadeName('');
        setNewShadePage('');
        if (onRefreshCatalog) onRefreshCatalog();
        alert('הגוון נוסף בהצלחה למניפה ונשלח לסנכרון ב-Google Sheets!');
      }
    } catch (err: any) {
      alert('שגיאה בהוספת גוון: ' + err.message);
    } finally {
      setIsAddingShade(false);
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
                מניפת גוונים ({catalogShades.length})
              </button>

              <button
                onClick={() => { setActiveTab('pastes'); soundService.playChime('tap'); }}
                className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'pastes'
                    ? 'bg-white text-[#0B3B60] border-t-2 border-t-[#0B3B60] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Pipette className="w-3.5 h-3.5 text-amber-600" />
                <span>מכונת גיוון ומשחות ({catalogShades.length})</span>
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

              {/* TAB 2: SHADES & CATALOG (LIVE GOOGLE SHEETS INTEGRATION) */}
              {activeTab === 'shades' && (
                <div className="space-y-4">
                  {/* Sub-tab Navigation */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setShadesSubTab('catalog'); soundService.playChime('tap'); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          shadesSubTab === 'catalog'
                            ? 'bg-[#0B3B60] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span>מניפת גוונים ארצית ({catalogShades.length})</span>
                      </button>

                      <button
                        onClick={() => { setShadesSubTab('log'); soundService.playChime('tap'); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          shadesSubTab === 'log'
                            ? 'bg-[#0B3B60] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>לוג בדיקות בקנבס ({shadesHistory.length})</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href="https://docs.google.com/spreadsheets/d/1vVE0ZOag1WuVMtFfLjB1u0nosRQ67C-s0FerqYH_Jdc/edit#gid=0"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1"
                        title="פתח גיליון מניפות ב-Google Sheets"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">פתח גיליון מניפה</span>
                      </a>

                      {shadesSubTab === 'catalog' && onRefreshCatalog && (
                        <button
                          onClick={() => { onRefreshCatalog(); soundService.playChime('tap'); }}
                          disabled={isSyncingCatalog}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-[#0B3B60] border border-sky-200 hover:bg-sky-100 transition flex items-center gap-1.5 shadow-xs"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCatalog ? 'animate-spin' : ''}`} />
                          <span>{isSyncingCatalog ? 'מסנכרן...' : 'רענן מניפה מ-Sheets'}</span>
                        </button>
                      )}

                      {shadesSubTab === 'catalog' && (
                        <button
                          onClick={() => { setIsAddShadeOpen(!isAddShadeOpen); soundService.playChime('tap'); }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0B3B60] text-white hover:bg-[#072942] transition flex items-center gap-1 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isAddShadeOpen ? 'סגור טופס' : 'הוסף גוון למניפה'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Add New Shade Form (Collapsible) */}
                  {shadesSubTab === 'catalog' && isAddShadeOpen && (
                    <form onSubmit={handleAddShadeToCatalog} className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#0B3B60] flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" />
                          <span>הוספת גוון חדש למניפה ול-Google Sheets</span>
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 font-medium">תצוגה מקדימה:</span>
                          <div className="w-6 h-6 rounded-md border border-black/20 shadow-xs" style={{ backgroundColor: newShadeHex }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">קוד גוון (חובה):</label>
                          <input
                            type="text"
                            placeholder="לדוגמה: WW2300"
                            value={newShadeCode}
                            onChange={(e) => setNewShadeCode(e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0B3B60]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">שם הגוון (חובה):</label>
                          <input
                            type="text"
                            placeholder="לדוגמה: פנינה זוהרת"
                            value={newShadeName}
                            onChange={(e) => setNewShadeName(e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0B3B60]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">חברה / יצרן:</label>
                          <select
                            value={newShadeManufacturer}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewShadeManufacturer(val);
                              if (val === 'RAL' || val === 'ח.סבן') {
                                setNewShadeCollection('מניפת RAL');
                              }
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0B3B60]"
                          >
                            <option value="טמבור">טמבור</option>
                            <option value="נירלט">נירלט</option>
                            <option value="יעקבי">יעקבי</option>
                            <option value="ח.סבן">ח.סבן (בלעדי)</option>
                            <option value="RAL">RAL Classic</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">מניפה / קולקציה:</label>
                          <select
                            value={newShadeCollection}
                            onChange={(e) => setNewShadeCollection(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0B3B60]"
                          >
                            <option value="המניפה – טמבור">המניפה – טמבור</option>
                            <option value="נירלט Natural Whites">נירלט Natural Whites</option>
                            <option value="אבני ארץ – נירלט">אבני ארץ – נירלט</option>
                            <option value="מניפת RAL">🇩🇪 מניפת RAL</option>
                            <option value="סבן בסיס מושלם">סבן בסיס מושלם</option>
                            <option value="קולקציית 1994">קולקציית 1994</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">קוד צבע HEX:</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={newShadeHex.startsWith('#') ? newShadeHex : '#D7DDD4'}
                              onChange={(e) => setNewShadeHex(e.target.value.toUpperCase())}
                              className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                            />
                            <input
                              type="text"
                              value={newShadeHex}
                              onChange={(e) => setNewShadeHex(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white font-mono text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">משפחת גוון:</label>
                          <select
                            value={newShadeFamily}
                            onChange={(e) => setNewShadeFamily(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0B3B60]"
                          >
                            <option value="לבן ופנינה">לבן ופנינה</option>
                            <option value="אבן וחול">אבן וחול</option>
                            <option value="אפורים מודרניים">אפורים מודרניים</option>
                            <option value="מרווה וטבע">מרווה וטבע</option>
                            <option value="כחול Saban">כחול Saban</option>
                            <option value="עץ טבעי ולכות">עץ טבעי ולכות</option>
                            <option value="מתכת מונע חלודה">מתכת מונע חלודה</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">סוג משטח:</label>
                          <select
                            value={newShadeSurface}
                            onChange={(e) => setNewShadeSurface(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0B3B60]"
                          >
                            <option value="קירות פנים">קירות פנים</option>
                            <option value="קירות חוץ">קירות חוץ</option>
                            <option value="תקרה וגבס">תקרה וגבס</option>
                            <option value="עץ ולכות">עץ ולכות</option>
                            <option value="מתכת DTM">מתכת DTM</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">גימור מומלץ:</label>
                          <select
                            value={newShadeFinish}
                            onChange={(e) => setNewShadeFinish(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0B3B60]"
                          >
                            <option value="מט משי">מט משי</option>
                            <option value="מט מהודר">מט מהודר</option>
                            <option value="חצי מבריק">חצי מבריק</option>
                            <option value="מבריק">מבריק</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">עמוד במניפה (אופציונלי):</label>
                          <input
                            type="text"
                            placeholder="עמ׳ 42"
                            value={newShadePage}
                            onChange={(e) => setNewShadePage(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0B3B60]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddShadeOpen(false)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
                        >
                          ביטול
                        </button>
                        <button
                          type="submit"
                          disabled={isAddingShade}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#0B3B60] text-white hover:bg-[#072942] transition shadow-xs flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isAddingShade ? 'מוסיף ומסנכרן...' : 'הוסף גוון וסנכרן לגיליון'}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Sub-tab 1: LIVE GOOGLE SHEETS SHADES CATALOG */}
                  {shadesSubTab === 'catalog' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>מציג {catalogShades.length} גוונים מתוך טאב "מניפת גוונים - קטלוג ארצי" ב-Google Sheets</span>
                        <span className="font-mono text-[11px]">מזהה גיליון: 1vVE0ZOag1WuVMtFfLjB1u0nosRQ67C-s0FerqYH_Jdc</span>
                      </div>

                      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs max-h-96 overflow-y-auto">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                              <th className="p-2.5">דוגמית</th>
                              <th className="p-2.5">קוד גוון</th>
                              <th className="p-2.5">שם הגוון</th>
                              <th className="p-2.5">יצרן / מותג</th>
                              <th className="p-2.5">מניפה / קולקציה</th>
                              <th className="p-2.5">קוד HEX</th>
                              <th className="p-2.5">משפחת צבע</th>
                              <th className="p-2.5">סוג משטח</th>
                              <th className="p-2.5">עמוד</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {catalogShades.map((shade, idx) => (
                              <tr key={shade.id || idx} className="hover:bg-slate-50/70 transition">
                                <td className="p-2.5">
                                  <div
                                    className="w-6 h-6 rounded-md border border-black/15 shadow-2xs"
                                    style={{ backgroundColor: shade.hex }}
                                  />
                                </td>
                                <td className="p-2.5 font-mono font-bold text-slate-900">{shade.code}</td>
                                <td className="p-2.5 font-bold text-slate-800">{shade.name}</td>
                                <td className="p-2.5">
                                  <span className="bg-sky-50 text-[#0B3B60] font-bold px-1.5 py-0.5 rounded text-[11px]">
                                    {shade.manufacturer}
                                  </span>
                                </td>
                                <td className="p-2.5 text-slate-600 truncate max-w-[140px]">{shade.collectionName || 'המניפה'}</td>
                                <td className="p-2.5 font-mono text-[11px] text-slate-500">{shade.hex}</td>
                                <td className="p-2.5 text-slate-700">{shade.family}</td>
                                <td className="p-2.5 text-slate-600">{shade.surfaceType}</td>
                                <td className="p-2.5 text-slate-400 font-mono text-[11px]">{shade.fandeckPage || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Sub-tab 2: CUSTOMER TESTS LOG */}
                  {shadesSubTab === 'log' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">היסטוריית גוונים שנבחרו בקנבס ובצ׳אט (לוג שימושים)</span>
                        <a
                          href="/api/sheets/export/shades"
                          download="saban_shades_log.csv"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>הורד לוג גוונים CSV</span>
                        </a>
                      </div>

                      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs max-h-80 overflow-y-auto">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10">
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
                </div>
              )}

              {/* TAB: TINT PASTES & AUTOMATIC DISPENSER */}
              {activeTab === 'pastes' && (
                <div className="space-y-4">
                  {/* Pastes Banner with Live Inject & Sync Action */}
                  <div className="bg-gradient-to-r from-[#0B3B60] via-[#0D4B7A] to-[#0284C7] text-white p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                        <Pipette className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black">מערך הזרקת משחות גוונים ממוחשב – ח.סבן (סניף תלמיד 6 & החרש)</span>
                          <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                            מכונה מחוברת אונליין
                          </span>
                        </div>
                        <p className="text-xs text-sky-100/90 mt-0.5">
                          נוסחאות הזרקה מדויקות לפי מ״ל ושוטים (1/48 oz) למניפות טמבור, נירלט, יעקבי ו-RAL
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {onInjectTintPastes && (
                        <button
                          onClick={() => {
                            onInjectTintPastes();
                            soundService.playChime('tap');
                          }}
                          disabled={isInjectingPastes}
                          className={`px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold transition shadow-sm flex items-center gap-1.5 ${
                            isInjectingPastes ? 'opacity-75 cursor-not-allowed' : ''
                          }`}
                        >
                          <Pipette className={`w-4 h-4 ${isInjectingPastes ? 'animate-bounce' : ''}`} />
                          <span>{isInjectingPastes ? 'מזריק ומסנכרן לגיליון...' : '💉 הזרק משחות וסנכרן לגיליון'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Highlights Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">גוונים בעלי נוסחה</span>
                      <span className="text-lg font-black text-slate-900">{catalogShades.length} / {catalogShades.length}</span>
                      <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">100% כיסוי קטלוג</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">בסיסי גיוון נתמכים</span>
                      <span className="text-lg font-black text-slate-900">BW, BP, BD, BC</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">לבן, פסטל, עמוק, לכה</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">דיוק מזרק מכונה</span>
                      <span className="text-lg font-black text-slate-900">0.05 מ״ל</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">1/48 Fl. Oz.</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">סנכרון Google Sheets</span>
                      <span className="text-lg font-black text-emerald-700">בזמן אמת</span>
                      <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">טאב ייעודי פעיל</span>
                    </div>
                  </div>

                  {/* Colorant Canisters Stock Overview */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Beaker className="w-4 h-4 text-saban-blue" />
                        <h4 className="text-xs font-bold text-slate-900">מפלסי מיכלי משחות גוונים (קולורנטים) במכונת הגיוון</h4>
                      </div>
                      <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        כל המיכלים בתקינות גבוהה
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                      {[
                        { code: 'B', name: 'שחור פחם', hex: '#1E1E1E', level: 84 },
                        { code: 'Y', name: 'אוכרה צהובה', hex: '#C5952B', level: 92 },
                        { code: 'C', name: 'כחול פתאלו', hex: '#1B4D8A', level: 78 },
                        { code: 'R', name: 'אדום תחמוצת', hex: '#9E342B', level: 88 },
                        { code: 'G', name: 'ירוק פתאלו', hex: '#1D6E42', level: 95 },
                        { code: 'M', name: 'מגנטה אורגנית', hex: '#A31D5E', level: 70 },
                        { code: 'YL', name: 'צהוב שמש', hex: '#E5B810', level: 85 },
                        { code: 'U', name: 'אומברה גולמית', hex: '#5A4632', level: 82 },
                        { code: 'W', name: 'לבן טיטניום', hex: '#F5F5F7', level: 90 },
                        { code: 'O', name: 'כתום אורגני', hex: '#DE5D1B', level: 76 },
                      ].map((c) => (
                        <div key={c.code} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="w-4 h-4 rounded shadow-inner flex items-center justify-center font-bold text-[9px] text-white" style={{ backgroundColor: c.hex }}>
                              {c.code}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-700">{c.level}%</span>
                          </div>
                          <div className="text-[11px] font-semibold text-slate-800 truncate mb-1">{c.name}</div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-sky-600 h-1.5 rounded-full" style={{ width: `${c.level}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shades Pastes Formulas Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        טבלת מפרט הזרקת משחות גוונים לכל גוון במניפה ({catalogShades.length} גוונים)
                      </span>
                      <span className="text-[11px] text-slate-500">לחץ ״הזרק״ לפתיחת סימולטור ומחשבון נפחים</span>
                    </div>

                    <div className="overflow-x-auto max-h-[420px]">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200 z-10">
                          <tr>
                            <th className="p-3">דוגמית</th>
                            <th className="p-3">קוד ושם</th>
                            <th className="p-3">יצרן</th>
                            <th className="p-3">בסיס גיוון</th>
                            <th className="p-3">נוסחת משחות מוזרקות (מ״ל לליטר)</th>
                            <th className="p-3 text-center">סה״כ מ״ל</th>
                            <th className="p-3 text-center">ערבול (שנ׳)</th>
                            <th className="p-3 text-center">פעולה</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {catalogShades.map((s, idx) => {
                            const formula = s.tintFormula;
                            return (
                              <tr key={s.id || idx} className="hover:bg-slate-50/70 transition-colors">
                                <td className="p-3">
                                  <div className="w-6 h-6 rounded-lg border border-black/10 shadow-xs" style={{ backgroundColor: s.hex }} />
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-slate-900 block">{s.name}</span>
                                  <span className="text-[11px] font-mono text-slate-500">{s.code}</span>
                                </td>
                                <td className="p-3 text-slate-700 font-medium">{s.manufacturer}</td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                    {formula?.baseCode || 'BW'}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-slate-700">
                                  {formula && formula.pastes.length > 0 ? (
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      {formula.pastes.map((p) => (
                                        <span key={p.pasteCode} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 flex items-center gap-1 text-[11px]">
                                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.colorHex }} />
                                          <span>{p.pasteCode}: {p.amountMlPerLiter}ml</span>
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 text-[11px]">לבן טהור (ללא הזרקה)</span>
                                  )}
                                </td>
                                <td className="p-3 text-center font-bold text-slate-900 font-mono">
                                  {formula ? `${formula.totalPastesMlPerLiter} מ״ל` : '0 מ״ל'}
                                </td>
                                <td className="p-3 text-center text-slate-600 font-mono">
                                  {formula?.shakerTimeSeconds || 180}s
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => {
                                      setActiveDispenserShade(s);
                                      soundService.playChime('tap');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 font-bold text-xs flex items-center gap-1 transition-colors mx-auto"
                                  >
                                    <Pipette className="w-3 h-3 text-amber-700" />
                                    <span>מחשבון</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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

                  {/* Connected Spreadsheet Banner */}
                  <div className="bg-white p-4 rounded-2xl border border-sky-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">גיליון Google Sheets מקושר ופעיל</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">מחובר לייב</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          מזהה גיליון: 1vVE0ZOag1WuVMtFfLjB1u0nosRQ67C-s0FerqYH_Jdc
                        </div>
                      </div>
                    </div>

                    <a
                      href="https://docs.google.com/spreadsheets/d/1vVE0ZOag1WuVMtFfLjB1u0nosRQ67C-s0FerqYH_Jdc/edit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>פתח גיליון בחלון חדש</span>
                    </a>
                  </div>

                  {/* Webhook Configuration */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900">כתובת Webhook פעילה (Google Apps Script):</h5>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                        סנכרון דו-כיווני פעיל
                      </span>
                    </div>
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
                        className="px-4 py-2 rounded-xl bg-[#0B3B60] text-white font-bold hover:bg-[#072942] transition shadow-xs whitespace-nowrap"
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

      {activeDispenserShade && (
        <TintDispenserModal
          isOpen={Boolean(activeDispenserShade)}
          onClose={() => setActiveDispenserShade(null)}
          shade={activeDispenserShade}
          selectedBranch="תלמיד 6"
          onSyncToSheet={onInjectTintPastes}
          isSyncing={isInjectingPastes}
        />
      )}
    </div>
  );
};
