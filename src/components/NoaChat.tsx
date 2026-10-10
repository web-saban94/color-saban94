import React, { useState, useRef, useEffect } from 'react';
import { Shade, ProductItem, BranchId } from '../types';
import { soundService } from '../utils/audioChime';
import { 
  Send, 
  Sparkles, 
  PackageCheck, 
  Check, 
  ShoppingBag,
  ExternalLink,
  Store,
  RefreshCw
} from 'lucide-react';

interface ChatMessageUI {
  id: string;
  sender: 'user' | 'noa';
  text: string;
  timestamp: string;
  shade?: Shade;
  recommendedBasket?: ProductItem[];
}

interface NoaChatProps {
  activeShade?: Shade;
  activeBranch: BranchId;
  onAddToCart: (product: ProductItem, shade?: Shade, qty?: number) => void;
  onOpenCheckout: () => void;
  allProducts: ProductItem[];
}

export const NoaChat: React.FC<NoaChatProps> = ({
  activeShade,
  activeBranch,
  onAddToCart,
  onOpenCheckout,
  allProducts,
}) => {
  const [messages, setMessages] = useState<ChatMessageUI[]>([
    {
      id: 'msg-init',
      sender: 'noa',
      text: 'שלום, אני נועה מח.סבן חומרי בניין (1994) בע״מ. אני כאן לסייע לך בבחירת גוון מדויק, חישוב כמויות, הנחיות הכנת שטח (בונדרול ושפכטל), והרכבת סל מוצרים מלא לאיסוף בסניף תלמיד 6 או החרש אסף.',
      timestamp: 'עכשיו',
      shade: activeShade,
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedShade, setAttachedShade] = useState<Shade | undefined>(activeShade);
  const [basketAdded, setBasketAdded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeShade) {
      setAttachedShade(activeShade);
    }
  }, [activeShade]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    'כמה צבע צריך לסלון 25 מ״ר?',
    'האם חובה בונדרול סופר לפני הצבע?',
    'איך מגיעים לקווים חדים עם Tesa 4435?',
    'הרכיבי לי סל מוצרים מלא לחדר',
    'ספרי לי על שעות הפעילות בסניפים',
  ];

  // Helper to construct a full recommended cart
  const buildFullBasket = (): ProductItem[] => {
    return [
      allProducts.find((p) => p.sku === 'TB-SCMS-5L') || allProducts[3], // סופרקריל משי 5 ל'
      allProducts.find((p) => p.sku === 'TB-BOND-5L') || allProducts[0], // בונדרול סופר
      allProducts.find((p) => p.sku === 'TS-4435-38') || allProducts[1], // טסה 4435
      allProducts.find((p) => p.sku === 'SB-KIT-ROLL9') || allProducts[6], // רולר ומגש
      allProducts.find((p) => p.sku === 'RB-BR-25') || allProducts[7], // מברשת פינות
      allProducts.find((p) => p.sku === 'SB-NY-20M') || allProducts[8], // ניילון כיסוי
      allProducts.find((p) => p.sku === 'SB-SP2000-5KG') || allProducts[2], // שפכטל 2000
    ];
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessageUI = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      shade: attachedShade,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    soundService.playChime('tap');

    try {
      const response = await fetch('/api/noa/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          selectedShade: attachedShade,
          selectedBranch: activeBranch,
          roomContext: 'קירות חלל מגורים',
        }),
      });

      const data = await response.json();

      // Check if user asked for a full basket or advice requires full basket
      const textLower = text.toLowerCase();
      const needsBasket = textLower.includes('סל') || textLower.includes('הרכב') || textLower.includes('מוצרים') || textLower.includes('הזמנה');

      const noaMessage: ChatMessageUI = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'noa',
        text: data.text || 'מענה מקצועי מאת נועה התקבל.',
        timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        shade: attachedShade,
        recommendedBasket: needsBasket ? buildFullBasket() : undefined,
      };

      setMessages((prev) => [...prev, noaMessage]);
      soundService.playChime('notification');
    } catch {
      const fallbackMsg: ChatMessageUI = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'noa',
        text: `רשמתי לפניי. לגבי הגוון ${attachedShade?.name || 'שנבחר'}, מומלץ למרוח שכבת בונדרול סופר כפריימר מייצב, להדביק Tesa 4435 לאורך הפנלים, ולצבוע ב-2 שכבות סופרקריל משי בהפרש 2 שעות. סניף ${activeBranch} עומד לשירותך להכנת ההזמנה.`,
        timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        shade: attachedShade,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      soundService.playChime('notification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFullBasketToCart = (basket: ProductItem[]) => {
    basket.forEach((item) => {
      // If it's the paint, associate current shade
      if (item.category === 'צבע וגמר') {
        onAddToCart(item, attachedShade, 1);
      } else {
        onAddToCart(item, undefined, 1);
      }
    });
    setBasketAdded(true);
    soundService.playChime('order');
    setTimeout(() => setBasketAdded(false), 3500);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-gradient-to-l from-slate-900 to-[#0B3B60] text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-sky-200 text-lg">
              נ
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0B3B60] rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white leading-tight">נועה · יועצת צבע וגוונים</h3>
              <span className="text-[10px] bg-sky-500/30 text-sky-200 px-2 py-0.5 rounded-full font-semibold border border-sky-400/30">
                Ai מומחה ח.סבן
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-sky-100/80 mt-0.5">
              <Store className="w-3 h-3 text-sky-300" />
              <span>מקושרת לסניף {activeBranch}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'msg-reset',
                sender: 'noa',
                text: 'השיחה אופסה. כיצד אוכל לסייע לך בפרויקט הצביעה הבא?',
                timestamp: 'עכשיו',
              },
            ]);
            soundService.playChime('tap');
          }}
          title="אפס שיחה"
          className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Active Shade Banner (if selected) */}
      {attachedShade && (
        <div className="bg-sky-50/90 border-b border-sky-100 px-4 py-2 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-5 h-5 rounded-md border border-black/10 shadow-xs shrink-0"
              style={{ backgroundColor: attachedShade.hex }}
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800">{attachedShade.name}</span>
              <span className="text-slate-500 mr-1.5">({attachedShade.code} · {attachedShade.manufacturer})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSendMessage(`אני מעוניין לפתוח הזמנה על בסיס הגוון ${attachedShade.name} לסניף ${activeBranch}`)}
              className="text-xs font-bold text-[#0B3B60] bg-white border border-sky-200 px-2.5 py-1 rounded-lg hover:bg-sky-100 transition shadow-xs whitespace-nowrap"
            >
              פתח הזמנה על בסיס גוון זה
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/60">
        {messages.map((msg) => {
          const isNoa = msg.sender === 'noa';
          return (
            <div key={msg.id} className={`flex flex-col ${isNoa ? 'items-start' : 'items-end'}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                  isNoa
                    ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tr-sm'
                    : 'bg-[#0B3B60] text-white rounded-tl-sm'
                }`}
              >
                {/* Attached Shade Mini Card inside User Message */}
                {msg.shade && !isNoa && (
                  <div className="bg-white/10 border border-white/20 rounded-xl p-2 mb-2 flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded shadow-xs shrink-0"
                      style={{ backgroundColor: msg.shade.hex }}
                    />
                    <span className="font-semibold text-sky-100 text-[11px]">
                      גוון מבוקש: {msg.shade.name} ({msg.shade.code})
                    </span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Render Recommended Full Basket Card if provided by Noa */}
                {msg.recommendedBasket && (
                  <div className="mt-3.5 bg-gradient-to-br from-amber-50 to-sky-50 border border-amber-200/90 rounded-2xl p-3.5 space-y-2.5 text-slate-800">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                      <div className="flex items-center gap-1.5">
                        <PackageCheck className="w-4 h-4 text-[#0B3B60]" />
                        <span className="font-bold text-xs text-slate-900">סל מוצרים מלא מומלץ</span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        7 פריטים
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {msg.recommendedBasket.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-[11px] bg-white/80 p-1.5 rounded-lg border border-slate-100">
                          <span className="font-medium text-slate-700 truncate max-w-[190px]">{item.name}</span>
                          <span className="font-bold text-slate-900 shrink-0 font-mono">₪{item.price}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">סה״כ סל מושלם</span>
                        <span className="text-sm font-extrabold text-[#0B3B60] font-mono">
                          ₪{msg.recommendedBasket.reduce((sum, i) => sum + i.price, 0)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddFullBasketToCart(msg.recommendedBasket!)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                          basketAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#0B3B60] text-white hover:bg-[#072942]'
                        }`}
                      >
                        {basketAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                        <span>{basketAdded ? 'הסל נוסף!' : 'צרף את כל הסל להזמנה'}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className={`text-[10px] mt-1.5 text-left ${isNoa ? 'text-slate-400' : 'text-sky-200'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 max-w-xs shadow-xs text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-sky-600 animate-spin" />
            <span>נועה מנתחת את השאלה ומכינה מענה מקצועי...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 whitespace-nowrap transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200/80 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="שאלי את נועה על גוונים, שפכטל, פריימר או סל מוצרים..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0B3B60] focus:ring-1 focus:ring-[#0B3B60] transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#0B3B60] text-white hover:bg-[#072942] disabled:opacity-40 transition shadow-xs shrink-0"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>

          <button
            type="button"
            onClick={onOpenCheckout}
            className="p-2.5 rounded-xl bg-sky-50 text-[#0B3B60] border border-sky-200 hover:bg-sky-100 transition shadow-xs shrink-0"
            title="עבור לסל הקניות וההזמנה"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
