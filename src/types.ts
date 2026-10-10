export type SurfaceType = 'קירות פנים' | 'קירות חוץ' | 'עץ ולכות' | 'מתכת DTM' | 'תקרה וגבס';

export type BranchId = 'תלמיד 6' | 'החרש אסף';

export interface BranchInfo {
  id: BranchId;
  name: string;
  address: string;
  phone: string;
  hours: string;
  pickupTimeEstimate: string;
  badge: string;
}

export interface Shade {
  id: string;
  name: string;
  code: string;
  manufacturer: 'טמבור' | 'נירלט' | 'יעקבי' | 'ח.סבן';
  hex: string;
  family: 'לבן ופנינה' | 'אבן וחול' | 'אפורים מודרניים' | 'מרווה וטבע' | 'כחול Saban' | 'עץ טבעי ולכות' | 'מתכת מונע חלודה';
  surfaceType: SurfaceType;
  description: string;
  isPopular?: boolean;
  lightShadeHex?: string;
  darkShadeHex?: string;
  collectionName?: string;
  finishType?: 'מט משי' | 'מט מהודר' | 'חצי מבריק' | 'מבריק' | 'טקסטורה עדינה';
}

export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  sku: string;
  category: 'צבע וגמר' | 'פריימר ותיקון' | 'כלי צביעה' | 'מיגון וסרטי הדבקה' | 'איטום ושיקום';
  price: number;
  unit: string;
  description: string;
  imageUrl?: string;
  isUpsellMandatory?: boolean;
  badge?: string;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
  shadeCode?: string;
  shadeName?: string;
  selectedVariant?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  branch: BranchId;
  items: CartItem[];
  totalAmount: number;
  status: 'התקבלה' | 'בטיפול בסניף' | 'מוכנה לאיסוף' | 'נמסרה ללקוח';
  createdAt: string;
  notes?: string;
  shadeSummary?: string;
  syncedToSheets: boolean;
  sheetsSyncTimestamp?: string;
}

export interface WallIssue {
  type: 'סדקים' | 'רטיבות ועובש' | 'קילופי צבע' | 'פגמי טיח וחורים';
  severity: 'קלה' | 'בינונית' | 'משמעותית';
  description: string;
  remedyAction: string;
}

export interface WallAnalysisResult {
  summary: string;
  surfaceState: 'תקין לצביעה' | 'דורש תיקוני שפכטל ופריימר' | 'דורש טיפול יסודי ברטיבות/סדקים';
  issues: WallIssue[];
  recommendedSteps: string[];
  rehabilitationProducts: ProductItem[];
  finishingProducts: ProductItem[];
  complementaryTools: ProductItem[];
  suggestedShades: Shade[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'noa';
  text: string;
  timestamp: string;
  shadeAttachment?: Shade;
  cartAttachment?: ProductItem[];
  wallAnalysis?: WallAnalysisResult;
  suggestedReplies?: string[];
}

export interface SheetsSyncStatus {
  lastSyncTime: string | null;
  totalOrdersSynced: number;
  totalShadesSynced: number;
  totalBasketsSynced: number;
  webhookUrl: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  isConfigured: boolean;
  autoSyncEnabled: boolean;
  syncHistory: {
    timestamp: string;
    sheet: 'הזמנות' | 'גוונים שנבחרו' | 'סלים מומלצים';
    count: number;
    status: 'success' | 'simulated';
  }[];
}
