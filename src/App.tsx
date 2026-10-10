import React, { useState, useEffect } from 'react';
import { 
  Shade, 
  ProductItem, 
  CartItem, 
  BranchId, 
  Order 
} from './types';
import { 
  BRANCHES, 
  PRODUCTS, 
  SHADES, 
  INITIAL_ORDERS 
} from './data/mockData';
import { RoomCanvas } from './components/RoomCanvas';
import { ShadeLibrary } from './components/ShadeLibrary';
import { NoaChat } from './components/NoaChat';
import { WallAiScanner } from './components/WallAiScanner';
import { CartCheckoutModal } from './components/CartCheckoutModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PWAInstallButton } from './components/PWAInstallButton';
import { soundService } from './utils/audioChime';
import { 
  Palette, 
  Eye, 
  MessageSquare, 
  Sparkles, 
  ShoppingBag, 
  Store, 
  Lock, 
  ChevronDown,
  Building2,
  CheckCircle2,
  WifiOff
} from 'lucide-react';

export default function App() {
  // Application State
  const [activeTab, setActiveTab] = useState<'canvas' | 'library' | 'chat' | 'scanner'>('canvas');
  const [selectedShade, setSelectedShade] = useState<Shade>(SHADES[0]); // WW2202 "לראות צלול"
  const [selectedBranch, setSelectedBranch] = useState<BranchId>('תלמיד 6');
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  // Cart State (Persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('saban_noa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Scanner image carry-over
  const [scannerImage, setScannerImage] = useState<string | undefined>(undefined);

  // Online status
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('saban_noa_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn(e);
    }
  }, [cart]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch live orders from backend
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart operations
  const handleAddToCart = (product: ProductItem, shade?: Shade, qty: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.product.id === product.id && i.shadeCode === (shade?.code || undefined)
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += qty;
        return next;
      } else {
        return [
          ...prev,
          {
            product,
            quantity: qty,
            shadeCode: shade?.code,
            shadeName: shade?.name,
          },
        ];
      }
    });

    showToast(`נוסף לסל: ${product.name}${shade ? ` (${shade.name})` : ''}`);
    soundService.playChime('tap');
  };

  const handleUpdateQuantity = (productId: string, shadeCode: string | undefined, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.shadeCode === shadeCode) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string, shadeCode?: string) => {
    setCart((prev) => prev.filter((i) => !(i.product.id === productId && i.shadeCode === shadeCode)));
    soundService.playChime('tap');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Interactions between tabs
  const handleSelectShadeForCanvas = (shade: Shade) => {
    setSelectedShade(shade);
    setActiveTab('canvas');
    showToast(`הגוון ${shade.name} נטען לקנבס`);

    // Log shade choice to backend
    fetch('/api/shades/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shadeName: shade.name,
        shadeCode: shade.code,
        manufacturer: shade.manufacturer,
        hex: shade.hex,
        branch: selectedBranch,
        source: 'ספריית גוונים',
      }),
    }).catch(() => {});
  };

  const handleSendShadeToChat = (shade: Shade, customPrompt?: string) => {
    setSelectedShade(shade);
    setActiveTab('chat');
    showToast(`הגוון ${shade.name} הועבר להתייעצות עם נועה`);
  };

  const handleOpenScannerWithImage = (imgSrc: string) => {
    setScannerImage(imgSrc);
    setActiveTab('scanner');
    showToast('תמונת הקיר נטענה לסורק ה-Ai');
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`הזמנה ${newOrder.orderNumber} נשלחה בהצלחה לסניף ${newOrder.branch}!`);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
        showToast(`סטטוס הזמנה עודכן ל: ${newStatus}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const bonderolProduct = PRODUCTS[0];
  const tesaProduct = PRODUCTS[1];
  const wallPaintProduct = PRODUCTS[3];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col font-['Assistant',sans-serif]">
      {/* Top Embedded Integration Shell Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-slate-200">
            ח.סבן חומרי בניין (1994) בע״מ
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 hidden sm:inline">
            מודול נועה – צבע וגוונים (PWA)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isOnline && (
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <WifiOff className="w-3 h-3" />
              <span>מצב לא מקוון (Offline)</span>
            </span>
          )}

          <button
            onClick={() => {
              setIsAdminOpen(true);
              soundService.playChime('tap');
            }}
            className="flex items-center gap-1 text-slate-300 hover:text-white hover:bg-slate-800 px-2 py-0.5 rounded transition"
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span>ניהול ו-Sheets</span>
          </button>
        </div>
      </div>

      {/* Main Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#0B3B60] p-1.5 flex items-center justify-center shadow-xs">
              {/* Brand Logo SVG */}
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <path d="M50 10 L80 30 L80 80 L50 65 Z" fill="#60A5FA" />
                <path d="M50 10 L20 30 L20 80 L50 65 Z" fill="#2563EB" />
                <path d="M50 65 L80 80 L50 95 L20 80 Z" fill="#1D4ED8" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-[#0B3B60] leading-none">
                  ח.סבן
                </span>
                <span className="text-xs font-bold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded">
                  נועה
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold block leading-none mt-0.5">
                בחירת גוון וצבע לחדר
              </span>
            </div>
          </div>

          {/* Nav Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/70">
            <button
              onClick={() => { setActiveTab('canvas'); soundService.playChime('tap'); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'canvas'
                  ? 'bg-white text-[#0B3B60] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-sky-600" />
              <span>המחשת חדר (קנבס)</span>
            </button>

            <button
              onClick={() => { setActiveTab('library'); soundService.playChime('tap'); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'library'
                  ? 'bg-white text-[#0B3B60] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-amber-600" />
              <span>ספריית גוונים</span>
            </button>

            <button
              onClick={() => { setActiveTab('chat'); soundService.playChime('tap'); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'chat'
                  ? 'bg-white text-[#0B3B60] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>צ׳אט נועה Ai</span>
            </button>

            <button
              onClick={() => { setActiveTab('scanner'); soundService.playChime('tap'); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === 'scanner'
                  ? 'bg-white text-[#0B3B60] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>סורק סדקים Ai</span>
            </button>
          </nav>

          {/* Right Action Zone: Branch Selector + Cart + PWA */}
          <div className="flex items-center gap-2">
            {/* Branch Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition shadow-xs"
              >
                <Store className="w-3.5 h-3.5 text-[#0B3B60]" />
                <span className="hidden sm:inline">סניף:</span>
                <span>{selectedBranch}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isBranchDropdownOpen && (
                <div className="absolute left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-right animate-in fade-in slide-in-from-top-2">
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase">
                    בחר סניף לאיסוף הזמנה:
                  </div>
                  {BRANCHES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBranch(b.id);
                        setIsBranchDropdownOpen(false);
                        soundService.playChime('tap');
                        showToast(`נבחר סניף ${b.id}`);
                      }}
                      className={`w-full text-right p-2.5 rounded-xl transition text-xs mb-1 ${
                        selectedBranch === b.id
                          ? 'bg-sky-50 text-[#0B3B60] font-bold border border-sky-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{b.name}</span>
                        {selectedBranch === b.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#0B3B60]" />}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">{b.address}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Trigger Button */}
            <button
              onClick={() => {
                setIsCartOpen(true);
                soundService.playChime('tap');
              }}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B3B60] text-white hover:bg-[#072942] transition shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="text-xs font-bold font-mono">₪{totalCartAmount}</span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* PWA In-App Install Button */}
            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-20 md:pb-8">
        {/* VIEW 1: ROOM CANVAS VIEW */}
        {activeTab === 'canvas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Main Column: Room Visualizer Canvas */}
            <div className="lg:col-span-8">
              <RoomCanvas
                currentShade={selectedShade}
                onSelectShade={setSelectedShade}
                onSendToChat={handleSendShadeToChat}
                onAddToCart={handleAddToCart}
                onAnalyzeWallPhoto={handleOpenScannerWithImage}
                bonderolProduct={bonderolProduct}
                tesaProduct={tesaProduct}
                wallPaintProduct={wallPaintProduct}
              />
            </div>

            {/* Right Column: Quick Shade Palette & Noa Assistant Teaser */}
            <div className="lg:col-span-4 space-y-4">
              {/* Quick Popular Shades Fan */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#0B3B60]" />
                    <span>המניפה המובילה · גוונים נבחרים</span>
                  </h4>
                  <button
                    onClick={() => { setActiveTab('library'); soundService.playChime('tap'); }}
                    className="text-[11px] font-bold text-[#0B3B60] hover:underline"
                  >
                    כל הספרייה ({SHADES.length})
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {SHADES.slice(0, 6).map((shade) => {
                    const isSelected = selectedShade.id === shade.id;
                    return (
                      <button
                        key={shade.id}
                        onClick={() => {
                          setSelectedShade(shade);
                          soundService.playChime('tap');
                        }}
                        className={`p-2 rounded-2xl border text-right transition flex items-center gap-2 ${
                          isSelected
                            ? 'border-[#0B3B60] bg-sky-50/70 ring-1 ring-[#0B3B60]'
                            : 'border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-lg shadow-xs border border-black/10 shrink-0"
                          style={{ backgroundColor: shade.hex }}
                        />
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold text-slate-800 truncate leading-tight">
                            {shade.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {shade.code}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Noa AI Quick Consultation Card */}
              <div className="bg-gradient-to-br from-slate-900 to-[#0B3B60] text-white p-5 rounded-3xl shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sky-200 text-sm">
                    נ
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">התייעצות מקצועית עם נועה</h5>
                    <span className="text-[10px] text-sky-200">מומחית צבעים, כמויות והכנת שטח</span>
                  </div>
                </div>

                <p className="text-xs text-sky-100/90 leading-relaxed">
                  מתלבטים לגבי גוון <strong>{selectedShade.name}</strong>? נועה תחשב כמויות צבע לפי גודל החדר, תמליץ על בונדרול, ותרכיב סל מוצרים מלא.
                </p>

                <button
                  onClick={() => {
                    setActiveTab('chat');
                    soundService.playChime('tap');
                  }}
                  className="w-full py-2 rounded-xl bg-white text-[#0B3B60] text-xs font-bold hover:bg-sky-50 transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>פתח שיחה עם נועה על הגוון הנבחר</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SHADE LIBRARY */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-black text-slate-900">ספריית גוונים ומניפות צבע</h3>
                <p className="text-xs text-slate-500">קולקציות טמבור, נירלט, יעקבי וח.סבן לקירות פנים, עץ ומתכת</p>
              </div>
              <button
                onClick={() => { setActiveTab('canvas'); soundService.playChime('tap'); }}
                className="text-xs font-bold text-[#0B3B60] bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition"
              >
                חזרה להמחשת חלל (קנבס)
              </button>
            </div>

            <ShadeLibrary
              shades={SHADES}
              activeShade={selectedShade}
              onSelectShadeForCanvas={handleSelectShadeForCanvas}
              onSendToChat={handleSendShadeToChat}
              onAddToCart={handleAddToCart}
              wallPaintProduct={wallPaintProduct}
            />
          </div>
        )}

        {/* VIEW 3: NOA AI CHAT */}
        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto space-y-3">
            <NoaChat
              activeShade={selectedShade}
              activeBranch={selectedBranch}
              onAddToCart={handleAddToCart}
              onOpenCheckout={() => setIsCartOpen(true)}
              allProducts={PRODUCTS}
            />
          </div>
        )}

        {/* VIEW 4: WALL AI VISION SCANNER */}
        {activeTab === 'scanner' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <WallAiScanner
              initialImage={scannerImage}
              allProducts={PRODUCTS}
              allShades={SHADES}
              onAddToCart={handleAddToCart}
              onSelectShadeForCanvas={handleSelectShadeForCanvas}
              onBackToCanvas={() => setActiveTab('canvas')}
            />
          </div>
        )}
      </main>

      {/* Mobile Ergonomic Bottom Tab Bar (as per mobile-touch reference) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
        <div className="grid grid-cols-4 items-center h-16">
          <button
            onClick={() => { setActiveTab('canvas'); soundService.playChime('tap'); }}
            className={`flex flex-col items-center justify-center h-full transition ${
              activeTab === 'canvas' ? 'text-[#0B3B60] font-bold' : 'text-slate-500'
            }`}
          >
            <Eye className="w-5 h-5" />
            <span className="text-[10px] mt-1">קנבס חדר</span>
          </button>

          <button
            onClick={() => { setActiveTab('library'); soundService.playChime('tap'); }}
            className={`flex flex-col items-center justify-center h-full transition ${
              activeTab === 'library' ? 'text-[#0B3B60] font-bold' : 'text-slate-500'
            }`}
          >
            <Palette className="w-5 h-5" />
            <span className="text-[10px] mt-1">גוונים</span>
          </button>

          <button
            onClick={() => { setActiveTab('chat'); soundService.playChime('tap'); }}
            className={`flex flex-col items-center justify-center h-full transition ${
              activeTab === 'chat' ? 'text-[#0B3B60] font-bold' : 'text-slate-500'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] mt-1">צ׳אט נועה</span>
          </button>

          <button
            onClick={() => { setActiveTab('scanner'); soundService.playChime('tap'); }}
            className={`flex flex-col items-center justify-center h-full transition ${
              activeTab === 'scanner' ? 'text-[#0B3B60] font-bold' : 'text-slate-500'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-1">סורק סדקים</span>
          </button>
        </div>
      </div>

      {/* Cart and Checkout Modal */}
      <CartCheckoutModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        selectedBranch={selectedBranch}
        onSelectBranch={setSelectedBranch}
        branches={BRANCHES}
        bonderolProduct={bonderolProduct}
        tesaProduct={tesaProduct}
        onAddToCart={handleAddToCart}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Admin Dashboard Modal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
