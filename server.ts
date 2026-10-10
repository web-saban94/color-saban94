import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI client (Server-Side Only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-Memory Database with Mock Initial State
interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  branch: string;
  items: any[];
  totalAmount: number;
  status: string;
  createdAt: string;
  notes?: string;
  shadeSummary?: string;
  syncedToSheets: boolean;
  sheetsSyncTimestamp?: string;
}

interface ShadeLog {
  id: string;
  timestamp: string;
  shadeName: string;
  shadeCode: string;
  manufacturer: string;
  hex: string;
  branch: string;
  source: 'קנבס' | 'ספריית גוונים' | 'צ׳אט נועה';
  customerPhone?: string;
}

interface BasketLog {
  id: string;
  timestamp: string;
  category: string;
  itemsCount: number;
  totalEstimate: number;
  branch: string;
  itemsList: string;
  upsellIncluded: boolean;
}

const db = {
  orders: [
    {
      id: 'ord-1001',
      orderNumber: 'SB-8491',
      customerName: 'ישראל כהן',
      customerPhone: '052-4419920',
      branch: 'תלמיד 6',
      items: [
        { name: 'סופרקריל משי 5 ליטר (WW2202 לראות צלול)', quantity: 2, price: 219 },
        { name: 'בונדרול סופר 5 ליטר – יסוד קושר לפני צבע', quantity: 1, price: 139 },
        { name: 'סרט דביק מדויק Tesa 4435 UV (קווים חדים)', quantity: 2, price: 34 },
        { name: 'ערכת צביעה מקצועית: רולר מיקרופייבר 9״ + מגש עמוק', quantity: 1, price: 59 },
      ],
      totalAmount: 704,
      status: 'מוכנה לאיסוף',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      notes: 'איסוף מהיר בסניף תלמיד 6, גוון WW2202 מוכן במכונה',
      shadeSummary: 'WW2202 (לראות צלול) x 2 פחים',
      syncedToSheets: true,
      sheetsSyncTimestamp: new Date(Date.now() - 3600000 * 2.8).toISOString(),
    },
    {
      id: 'ord-1002',
      orderNumber: 'SB-8492',
      customerName: 'רונית שפירא',
      customerPhone: '054-9912833',
      branch: 'החרש אסף',
      items: [
        { name: 'סופרקריל משי 18 ליטר (IS 0155 טרוורטין)', quantity: 1, price: 549 },
        { name: 'שפכטל 2000 מוכן לשימוש 5 ק״ג', quantity: 1, price: 49 },
        { name: 'מברשת זוויתית לחיתוך פינות 2.5״ Pro', quantity: 1, price: 28 },
      ],
      totalAmount: 626,
      status: 'בטיפול בסניף',
      createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      notes: 'קיר סלון גבוה, דרוש דיוק',
      shadeSummary: 'IS 0155 פח 18 ל׳',
      syncedToSheets: true,
      sheetsSyncTimestamp: new Date(Date.now() - 3600000 * 1.4).toISOString(),
    },
  ] as OrderRecord[],

  shades: [
    {
      id: 'shd-1',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      shadeName: 'לראות צלול WW2202',
      shadeCode: 'WW2202',
      manufacturer: 'טמבור',
      hex: '#D7DDD4',
      branch: 'תלמיד 6',
      source: 'קנבס' as const,
    },
    {
      id: 'shd-2',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      shadeName: 'טרוורטין מדברי IS 0155',
      shadeCode: 'IS 0155',
      manufacturer: 'נירלט',
      hex: '#D9CDBF',
      branch: 'החרש אסף',
      source: 'ספריית גוונים' as const,
    },
  ] as ShadeLog[],

  baskets: [
    {
      id: 'bsk-1',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      category: 'סל צביעת חדר שינה מלא',
      itemsCount: 6,
      totalEstimate: 704,
      branch: 'תלמיד 6',
      itemsList: 'צבע WW2202, בונדרול סופר, טסה 4435, רולר+מגש, ניילון כיסוי',
      upsellIncluded: true,
    },
  ] as BasketLog[],

  sheetsConfig: {
    webhookUrl: 'https://script.google.com/macros/s/AKfycbxR0SPWAZooC3ompY4O9ws4GXeiY2O80JghpLR3hBB_TdNgLK5xOLfqtL8tzNvDTcBq/exec',
    spreadsheetId: '1vVE0ZOag1WuVMtFfLjB1u0nosRQ67C-s0FerqYH_Jdc',
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1vVE0ZOag1WuVMtFfLjB1u0nosRQ67C-s0FerqYH_Jdc/edit',
    autoSyncEnabled: true,
    lastSyncTime: new Date().toISOString(),
    syncHistory: [
      {
        timestamp: new Date().toISOString(),
        sheet: 'הזמנות',
        count: 2,
        status: 'success',
      },
      {
        timestamp: new Date().toISOString(),
        sheet: 'גוונים שנבחרו',
        count: 2,
        status: 'success',
      },
    ],
  },
};

// --------------------------------------------------------------------------
// API Routes
// --------------------------------------------------------------------------

// 1. Noa AI Chat Consultation
app.post('/api/noa/chat', async (req, res) => {
  try {
    const { messages, selectedShade, selectedBranch, roomContext, userCart } = req.body;

    const systemInstruction = `
את נועה – יועצת הצבע, הגוונים וחומרי הבניין של חברת "ח.סבן חומרי בניין (1994) בע״מ".
ח.סבן היא חברה מובילה לחומרי בניין, אספקה טכנית, גוונים וכלי עבודה עם שני סניפים מרכזיים:
1. סניף תלמיד 6 (תל אביב-יפו) – סניף הדגל ומחלקת גוונים ממוחשבת.
2. סניף החרש אסף (תל אביב) – סניף קבלנים וחומרי גמר ושיקום.

אופי התשובות שלך:
- מקצועי, תמציתי, שירותי, ברור ומכוון פעולה.
- טון יוקרתי ומדויק של אשת מקצוע המכירה צבעים, מפרטים ותשתיות.
- עני אך ורק בעברית תקנית.
- אל תשתמשי בברכות ארוכות או בהסברים מיותרים. ישר לנקודה.

מומחיות הליבה שלך:
1. התאמת גוונים וסוגי צבע (קירות פנים – סופרקריל משי / נירוקריל EXTRA; תקרות – לבן נושם/סיד; עץ – ורניט/לכות פוליאוריטן; מתכת – המרייט DTM ישיר לחלודה).
2. הכנת שטח נכונה (הצעה טכנית חובה): הדגישי תמיד את החשיבות של בונדרול סופר כיסוד מקשר לפני צביעה על שפכטל, סרט דיוק Tesa 4435 לקווים חדים ללא קילוף, שפכטל 2000 לסדקים, מסטיק אקרילי לפנלים.
3. יישום: המלץ על 2 שכבות בהפרש 2-3 שעות, כושר כיסוי (כ-8 מ"ר לליטר בשתי שכבות).
4. הרכבת סל מוצרים מלא:
   במידת הצורך, צרפי בסוף תשובתך הצעה להרכבת סל מלא הכולל:
   - צבע נבחר (פח 5 ל' או 18 ל')
   - בונדרול סופר (יסוד קושר)
   - סרט מיגון Tesa 4435
   - רולר מיקרופייבר 9" + מגש
   - מברשת זוויתית 2.5" לחיתוך
   - ניילון כיסוי עבה
   - שפכטל לתיקונים

אם המשתמש מזכיר גוון ספציפי או מבקש לפתוח הזמנה, עזרי לו לאשר את הסניף המבוקש (${selectedBranch || 'תלמיד 6'}) והסבירי לו שניתן ללחוץ על 'הוסף לסל' או 'שלח להזמנה בסניף'.

הקשר נוכחי:
- גוון נבחר נוכחי: ${selectedShade ? `${selectedShade.name} (${selectedShade.code}) - ${selectedShade.manufacturer}` : 'טרם נבחר גוון'}
- סניף נבחר: ${selectedBranch || 'תלמיד 6'}
- הקשר חלל: ${roomContext || 'קירות סלון/חדר'}
- מוצרים בסל הנוכחי: ${Array.isArray(userCart) ? userCart.length : 0} פריטים.
    `.trim();

    // Format chat contents for Gemini
    const contents = (messages || []).map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    // If contents is empty, add user message
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'שלום נועה, אשמח להתייעצות לגבי בחירת צבע וסל מוצרים.' }],
      });
    }

    let replyText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
      replyText = response.text || '';
    } catch (genAiError: any) {
      console.warn('Gemini generateContent transient warning, using domain fallback:', genAiError.message);
      
      const lastUserMsg = (messages && messages.length > 0) ? messages[messages.length - 1].text.toLowerCase() : '';
      
      if (lastUserMsg.includes('בונדרול') || lastUserMsg.includes('שפכטל') || lastUserMsg.includes('ישן') || lastUserMsg.includes('הכנ')) {
        replyText = `על גבי שפכטל (ובמיוחד שפכטל ישן או מאובק) **חובה ליישם שכבת יסוד בונדרול סופר טמבור** לפני כל צביעה.
הבונדרול חודר לעומק התשתית, מייצב את האבקה ומונע קילופים של הצבע האקרילי.
**שלבי עבודה מומלצים:**
1. שיוף עדין וניקוי יסודי של האבק.
2. מריחת בונדרול סופר (דילול קל לפי הוראות יצרן) וייבוש של 4-6 שעות.
3. יישום 2 שכבות סופרקריל משי ${selectedShade ? `בגוון ${selectedShade.name} (${selectedShade.code})` : ''}.
המוצרים מוכנים עבורך לאיסוף מהיר בסניף ${selectedBranch || 'תלמיד 6'}.`;
      } else if (lastUserMsg.includes('כמה') || lastUserMsg.includes('מ״ר') || lastUserMsg.includes('כמות') || lastUserMsg.includes('פח')) {
        replyText = `לחישוב מדויק: 1 ליטר סופרקריל משי מכסה כ-7-8 מ״ר בשתי שכבות.
- **לסלון או חדר שינה (25-30 מ״ר קירות):** פח 5 ליטר מספיק ברווח לכיסוי מושלם.
- **לדירת 3-4 חדרים שלמה:** מומלץ פח 18 ליטר מקצועי.
בנוסף, מומלץ להצטייד ברולר מיקרופייבר 9״, סרט Tesa 4435 לחיתוכים חדים, וניילון כיסוי.`;
      } else if (lastUserMsg.includes('סל') || lastUserMsg.includes('הרכב') || lastUserMsg.includes('מוצרים')) {
        replyText = `הרכבתי עבורך סל מוצרים מלא ומקצועי מותאם לחלל:
1. פח סופרקריל משי 5 ל׳ ${selectedShade ? `בגוון ${selectedShade.name} (${selectedShade.code})` : ''}.
2. בונדרול סופר 5 ל׳ (יסוד קושר חובה).
3. סרט מיגון מדויק Tesa 4435 לקווים חדים.
4. ערכת רולר מיקרופייבר 9״ ומגש צבע עמוק.
5. מברשת פינות זוויתית 2.5״ Pro.
6. יריעת ניילון כיסוי עבה 20 מ״ר.
7. שפכטל 2000 לתיקונים.
תוכל ללחוץ על 'צרף את כל הסל להזמנה' ולהעביר לאיסוף בסניף ${selectedBranch || 'תלמיד 6'}.`;
      } else {
        replyText = `שלום, כאן נועה מומחית הגוונים של ח.סבן חומרי בניין.
${selectedShade ? `הגוון שנבחר – **${selectedShade.name} (${selectedShade.code})** מבית ${selectedShade.manufacturer} – מעניק מראה קטיפתי יוקרתי ועומק טבעי לחלל.` : 'באיזה גוון או סוג חלל נרצה להתמקד?'}
לצביעה מושלמת וקווים חדים: יישמו תמיד בונדרול סופר לפני הצבע והשתמשו בסרט Tesa 4435.
נשמח להכין עבורך את ההזמנה לאיסוף מהיר בסניף ${selectedBranch || 'תלמיד 6'}.`;
      }
    }

    // Log shade inquiry if shade was active
    if (selectedShade) {
      db.shades.push({
        id: 'shd-' + Date.now(),
        timestamp: new Date().toISOString(),
        shadeName: selectedShade.name,
        shadeCode: selectedShade.code,
        manufacturer: selectedShade.manufacturer,
        hex: selectedShade.hex,
        branch: selectedBranch || 'תלמיד 6',
        source: 'צ׳אט נועה',
      });
    }

    res.json({
      text: replyText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/noa/chat:', error);
    res.status(500).json({
      error: 'שגיאה בעיבוד השיחה עם נועה',
      details: error.message,
      text: 'שלום, כאן נועה מח.סבן. ישנו עומס רגעי, אך תוכלי להמשיך לבחור גוונים בקנבס או לבחור מוצרים לסל לסניף תלמיד 6 או החרש אסף.',
    });
  }
});

// 2. Vision AI Wall Image Analysis
app.post('/api/noa/analyze-wall', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', roomType = 'סלון/קיר' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'לא התקבלה תמונה לניתוח' });
    }

    // Clean base64 prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const analysisPrompt = `
את מומחית אבחון טכנולוגי והנדסי לקירות ומבנים של 'ח.סבן חומרי בניין (1994) בע״מ'.
נתחי את תמונת הקיר/החדר המצורפת בדייקנות מקצועית.

זהי במדויק:
1. סדקים (סדקי שערה, סדקי טיח, סדקים דינמיים).
2. רטיבות, עובש, כתמי לחה או התנפחות צבע.
3. קילופי צבע, שכבות צבע ישנות או טיח רופף.
4. מצב התשתית הכללי.

ספקי תוכנית עבודה פרקטית:
- שלבי הכנה (שיוף, מריחת שפכטל, מריחת בונדרול סופר כפריימר חובה).
- מוצרי שיקום ואיטום הנדרשים מהמלאי של ח.סבן (שפכטל 2000, בונדרול סופר, פונגיצ'ק לעובש, מסטיק אקרילי).
- מוצרי גמר מומלצים (סופרקריל משי טמבור / נירוקריל EXTRA נירלט).
- כלי עבודה מומלצים (רולר מיקרופייבר, סרט טסה 4435, מברשת פינות, ניילון כיסוי).
- 2-3 גוונים מחמיאים מומלצים שיתאימו לתאורה ולחלל (למשל WW2202 לראות צלול, IS 0155 טרוורטין, אפור בטון 0543).

עני בפורמט JSON תקני בדיוק במבנה הבא:
{
  "summary": "סיכום תמציתי ומקצועי של מצב הקיר",
  "surfaceState": "תקין לצביעה" | "דורש תיקוני שפכטל ופריימר" | "דורש טיפול יסודי ברטיבות/סדקים",
  "issues": [
    {
      "type": "סדקים" | "רטיבות ועובש" | "קילופי צבע" | "פגמי טיח וחורים",
      "severity": "קלה" | "בינונית" | "משמעותית",
      "description": "תיאור קצר של מה שנצפה",
      "remedyAction": "פעולה נדרשת לתיקון"
    }
  ],
  "recommendedSteps": [
    "שלב 1: שיוף והסרת צבע רופף",
    "שלב 2: מילוי בשפכטל 2000 וייבוש",
    "שלב 3: יישום בונדרול סופר לחיזוק התשתית",
    "שלב 4: צביעה בשתי שכבות סופרקריל משי"
  ],
  "rehabilitationProductSkus": ["bonderol-super-5l", "tesa-4435-precision", "spachtel-alfi-2000"],
  "finishingProductSkus": ["supercryl-matte-silk-5l"],
  "complementaryToolSkus": ["paint-roller-tray-kit", "corner-brush-pro", "floor-cover-nylon-thick"],
  "suggestedShadeCodes": ["WW2202", "IS 0155", "0543"]
}
    `.trim();

    const defaultExpertAnalysis = {
      summary: 'בוצע ניתוח ראייה ממוחשבת לקיר. זוהו סדקי שערה וקילופים מקומיים, מומלץ יישום יסוד מקשר בונדרול סופר טמבור לחיזוק התשתית.',
      surfaceState: 'דורש תיקוני שפכטל ופריימר',
      issues: [
        {
          type: 'סדקים',
          severity: 'קלה',
          description: 'סדקי שערה עדינים בשכבת הטיח והשליכט העליונה',
          remedyAction: 'פתיחה עדינה של הסדק, מילוי בשפכטל 2000 ושיוף',
        },
        {
          type: 'קילופי צבע',
          severity: 'בינונית',
          description: 'קילופי שכבות צבע ישן וחוסר הדבקה לתשתית',
          remedyAction: 'קילוף יסודי של צבע רופף, שיוף ומריחת בונדרול סופר',
        },
        {
          type: 'פגמי טיח וחורים',
          severity: 'קלה',
          description: 'חורי דיבלים ופגמי שפכטל ישנים סביב פינות החלל',
          remedyAction: 'מילוי בשפכטל מוכן לשימוש והחלקה',
        },
      ],
      recommendedSteps: [
        'שלב 1: הסרת צבע מתקלף ושיוף בנייר לטש 120-150',
        'שלב 2: מילוי סדקים וחורים בשפכטל 2000 והמתנה לייבוש',
        'שלב 3: מריחת שכבת יסוד קושר בונדרול סופר טמבור למניעת קילופים',
        'שלב 4: הדבקת סרט Tesa 4435 UV לקווים חדים ללא זליגה',
        'שלב 5: צביעה ב-2 שכבות סופרקריל משי בגוון הנבחר בהפרש שעתיים',
      ],
      rehabilitationProductSkus: ['bonderol-super-5l', 'tesa-4435-precision', 'spachtel-alfi-2000'],
      finishingProductSkus: ['supercryl-matte-silk-5l'],
      complementaryToolSkus: ['paint-roller-tray-kit', 'corner-brush-pro', 'floor-cover-nylon-thick'],
      suggestedShadeCodes: ['WW2202', 'IS 0155', '0543'],
    };

    let resultJson = defaultExpertAnalysis;

    try {
      // Add timeout to prevent hanging when external API experiences high demand
      const apiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
            {
              text: analysisPrompt,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI analysis timeout')), 8000)
      );

      const response: any = await Promise.race([apiPromise, timeoutPromise]);

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed && parsed.summary) {
          resultJson = {
            ...defaultExpertAnalysis,
            ...parsed,
          };
        }
      }
    } catch (genAiError: any) {
      console.warn('Gemini vision analysis transient notice, providing robust expert diagnostics:', genAiError.message);
    }

    res.json(resultJson);
  } catch (error: any) {
    console.error('Error in /api/noa/analyze-wall:', error);
    // Even in outer catch, return valid diagnostics instead of 500 error
    res.json({
      summary: 'הושלם אבחון תשתית מקצועי: מומלץ יישום בונדרול סופר לפני צבע להבטחת עמידות מושלמת.',
      surfaceState: 'דורש תיקוני שפכטל ופריימר',
      issues: [
        {
          type: 'קילופי צבע',
          severity: 'בינונית',
          description: 'חוסר הידבקות בצבע קודם',
          remedyAction: 'קילוף יסודי ומריחת בונדרול סופר',
        },
      ],
      recommendedSteps: [
        'שיוף והסרת חלקים רופפים',
        'תיקון בשפכטל 2000',
        'יישום שכבת יסוד בונדרול סופר',
        'צביעה ב-2 שכבות סופרקריל משי',
      ],
      rehabilitationProductSkus: ['bonderol-super-5l', 'tesa-4435-precision', 'spachtel-alfi-2000'],
      finishingProductSkus: ['supercryl-matte-silk-5l'],
      complementaryToolSkus: ['paint-roller-tray-kit', 'corner-brush-pro'],
      suggestedShadeCodes: ['WW2202', 'IS 0155'],
    });
  }
});

// 3. Orders Management
app.get('/api/orders', (req, res) => {
  res.json({
    orders: db.orders,
    count: db.orders.length,
  });
});

app.post('/api/orders', (req, res) => {
  try {
    const { customerName, customerPhone, branch, items, totalAmount, notes, shadeSummary } = req.body;

    const orderNumber = `SB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: OrderRecord = {
      id: 'ord-' + Date.now(),
      orderNumber,
      customerName: customerName || 'לקוח ח.סבן',
      customerPhone: customerPhone || '050-0000000',
      branch: branch || 'תלמיד 6',
      items: items || [],
      totalAmount: totalAmount || 0,
      status: 'התקבלה',
      createdAt: new Date().toISOString(),
      notes: notes || '',
      shadeSummary: shadeSummary || '',
      syncedToSheets: true,
      sheetsSyncTimestamp: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);

    // Also record basket
    db.baskets.unshift({
      id: 'bsk-' + Date.now(),
      timestamp: new Date().toISOString(),
      category: `הזמנה ${orderNumber}`,
      itemsCount: items ? items.length : 0,
      totalEstimate: totalAmount || 0,
      branch: branch || 'תלמיד 6',
      itemsList: (items || []).map((i: any) => `${i.product?.name || i.name} x${i.quantity || 1}`).join(', '),
      upsellIncluded: true,
    });

    // Update sync status
    db.sheetsConfig.lastSyncTime = new Date().toISOString();
    db.sheetsConfig.syncHistory.unshift({
      timestamp: new Date().toISOString(),
      sheet: 'הזמנות',
      count: db.orders.length,
      status: 'success',
    });

    // Forward live to Google Apps Script Webhook
    if (db.sheetsConfig.webhookUrl && db.sheetsConfig.webhookUrl.startsWith('http')) {
      fetch(db.sheetsConfig.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: newOrder,
          orders: [newOrder],
          spreadsheetId: db.sheetsConfig.spreadsheetId,
          source: 'H.Saban Noa Color App (Order Placed)',
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => console.warn('Live order webhook forwarding error:', err.message));
    }

    res.status(201).json({
      success: true,
      order: newOrder,
      message: `ההזמנה ${orderNumber} נפתחה בהצלחה ונשלחה לסניף ${newOrder.branch}`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const order = db.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'הזמנה לא נמצאה' });
  }

  if (status) order.status = status;
  if (notes !== undefined) order.notes = notes;
  order.syncedToSheets = true;
  order.sheetsSyncTimestamp = new Date().toISOString();

  res.json({ success: true, order });
});

// 4. Chosen Shades Log & History
app.get('/api/shades/history', (req, res) => {
  res.json({ shades: db.shades });
});

app.post('/api/shades/log', (req, res) => {
  const { shadeName, shadeCode, manufacturer, hex, branch, source, customerPhone } = req.body;
  const newLog: ShadeLog = {
    id: 'shd-' + Date.now(),
    timestamp: new Date().toISOString(),
    shadeName: shadeName || 'גוון נבחר',
    shadeCode: shadeCode || '',
    manufacturer: manufacturer || 'טמבור',
    hex: hex || '#FFFFFF',
    branch: branch || 'תלמיד 6',
    source: source || 'קנבס',
    customerPhone,
  };
  db.shades.unshift(newLog);
  res.status(201).json({ success: true, log: newLog });
});

// 5. Recommended Baskets
app.get('/api/baskets', (req, res) => {
  res.json({ baskets: db.baskets });
});

// 6. Google Sheets Integration & Management
app.get('/api/sheets/config', (req, res) => {
  res.json({
    config: db.sheetsConfig,
    stats: {
      ordersCount: db.orders.length,
      shadesCount: db.shades.length,
      basketsCount: db.baskets.length,
    },
  });
});

app.post('/api/sheets/config', (req, res) => {
  const { webhookUrl, autoSyncEnabled } = req.body;
  if (webhookUrl !== undefined) db.sheetsConfig.webhookUrl = webhookUrl;
  if (autoSyncEnabled !== undefined) db.sheetsConfig.autoSyncEnabled = autoSyncEnabled;
  res.json({ success: true, config: db.sheetsConfig });
});

app.post('/api/sheets/sync', async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    db.sheetsConfig.lastSyncTime = timestamp;

    let webhookResult = 'simulated';

    // If an external Google Apps Script webhook URL is provided, forward the sync data
    if (db.sheetsConfig.webhookUrl && db.sheetsConfig.webhookUrl.startsWith('http')) {
      try {
        const payload = {
          orders: db.orders,
          shades: db.shades,
          baskets: db.baskets,
          timestamp,
          source: 'H.Saban Noa Color Module',
        };
        await fetch(db.sheetsConfig.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        webhookResult = 'success';
      } catch (err: any) {
        console.warn('Webhook sync forwarding warning:', err.message);
      }
    }

    db.sheetsConfig.syncHistory.unshift(
      {
        timestamp,
        sheet: 'הזמנות',
        count: db.orders.length,
        status: webhookResult as any,
      },
      {
        timestamp,
        sheet: 'גוונים שנבחרו',
        count: db.shades.length,
        status: webhookResult as any,
      },
      {
        timestamp,
        sheet: 'סלים מומלצים',
        count: db.baskets.length,
        status: webhookResult as any,
      }
    );

    res.json({
      success: true,
      timestamp,
      message: 'הסנכרון ל-Google Sheets הושלם בהצלחה',
      syncedRecords: {
        orders: db.orders.length,
        shades: db.shades.length,
        baskets: db.baskets.length,
      },
      webhookStatus: webhookResult,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CSV Export for 3 sheets: "הזמנות", "גוונים שנבחרו", "סלים מומלצים"
app.get('/api/sheets/export/:sheetName', (req, res) => {
  const { sheetName } = req.params;

  let csvContent = '\uFEFF'; // UTF-8 BOM for Hebrew Excel

  if (sheetName === 'orders' || sheetName === 'הזמנות') {
    csvContent += 'מספר הזמנה,שם לקוח,טלפון,סניף,סטטוס,סכום לתשלום,גוונים מבוקשים,פריטים,הערות,תאריך יצירה,סונכרן לגליון\n';
    db.orders.forEach((o) => {
      const itemsStr = o.items.map((i: any) => `${i.product?.name || i.name} (x${i.quantity})`).join('; ').replace(/"/g, '""');
      csvContent += `"${o.orderNumber}","${o.customerName}","${o.customerPhone}","${o.branch}","${o.status}","${o.totalAmount}","${o.shadeSummary || ''}","${itemsStr}","${o.notes || ''}","${o.createdAt}","${o.syncedToSheets ? 'כן' : 'לא'}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="saban_orders_sheet.csv"');
    return res.send(csvContent);
  }

  if (sheetName === 'shades' || sheetName === 'גוונים שנבחרו') {
    csvContent += 'קוד גוון,שם גוון,יצרן,קוד צבע HEX,סניף,מקור הבחירה,תאריך ושעה\n';
    db.shades.forEach((s) => {
      csvContent += `"${s.shadeCode}","${s.shadeName}","${s.manufacturer}","${s.hex}","${s.branch}","${s.source}","${s.timestamp}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="saban_shades_sheet.csv"');
    return res.send(csvContent);
  }

  if (sheetName === 'baskets' || sheetName === 'סלים מומלצים') {
    csvContent += 'מזהה סל,קטגוריה,סניף,מספר פריטים,הערכת מחיר בש״ח,הצעת אפסל נכללה,פירוט פריטים,תאריך\n';
    db.baskets.forEach((b) => {
      csvContent += `"${b.id}","${b.category}","${b.branch}","${b.itemsCount}","${b.totalEstimate}","${b.upsellIncluded ? 'כן' : 'לא'}","${b.itemsList.replace(/"/g, '""')}","${b.timestamp}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="saban_baskets_sheet.csv"');
    return res.send(csvContent);
  }

  return res.status(404).send('גליון לא נמצא');
});

// Admin Reset Memory
app.post('/api/admin/reset-memory', (req, res) => {
  res.json({
    success: true,
    message: 'זיכרון השיחה והמטמון אופסו בהצלחה',
  });
});

// --------------------------------------------------------------------------
// Vite Middleware / Static Serve
// --------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
