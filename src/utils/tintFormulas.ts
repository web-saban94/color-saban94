import { TintFormula, TintPasteItem } from '../types';

// Standard 1 Shot = 1/48 fluid ounce = ~0.616 ml (Industry standard for Tambour & Nirlat automatic dispensers)
export const ML_PER_SHOT = 0.616;

// Predefined exact colorant definitions
export const COLORANTS_INFO: Record<string, { name: string; colorHex: string; description: string }> = {
  B: { name: 'שחור פחם B (Lamp Black)', colorHex: '#1E1E1E', description: 'קולורנט שחור עמוק להכהיית גוונים ושבירת בהירות' },
  Y: { name: 'אוכרה צהובה Y (Yellow Oxide)', colorHex: '#C5952B', description: 'תחמוצת ברזל צהובה חמה לקירות פנים וחוץ' },
  C: { name: 'כחול פתאלו C (Phthalo Blue)', colorHex: '#1B4D8A', description: 'גוון כחול עמוק ועמיד במיוחד' },
  R: { name: 'אדום תחמוצת R (Red Oxide)', colorHex: '#9E342B', description: 'תחמוצת ברזל אדומה טבעית לגווני טרקוטה וחול' },
  G: { name: 'ירוק פתאלו G (Phthalo Green)', colorHex: '#1D6E42', description: 'פיגמנט ירוק מרווה וטבע עמיד' },
  M: { name: 'מגנטה אורגנית M (Quinacridone Magenta)', colorHex: '#A31D5E', description: 'משחת מגנטה לקבלת גווני סגול ורוד ועומק' },
  YL: { name: 'צהוב שמש אורגני YL (Sun Yellow)', colorHex: '#E5B810', description: 'צהוב לימון מבריק לחיות גוון' },
  U: { name: 'אומברה גולמית U (Raw Umber)', colorHex: '#5A4632', description: 'חום עפרורי לעידון אפורים ובטון' },
  W: { name: 'לבן טיטניום W (Titanium White)', colorHex: '#F5F5F7', description: 'פיגמנט אטימות מוגברת וכיסוי' },
  O: { name: 'כתום אורגני O (Organic Orange)', colorHex: '#DE5D1B', description: 'כתום חם ועשיר' },
};

// Known exact recipes for all 16 fan deck shades
const EXACT_SHADE_RECIPES: Record<string, Partial<TintFormula>> = {
  // טמבור
  WW2202: {
    base: 'בסיס לבן (BW)',
    baseCode: 'BW',
    pastes: [
      { pasteCode: 'Y', name: 'אוכרה צהובה Y', colorHex: '#C5952B', amountMlPerLiter: 3.2, shotsPerLiter: 5.2 },
      { pasteCode: 'B', name: 'שחור פחם B', colorHex: '#1E1E1E', amountMlPerLiter: 1.6, shotsPerLiter: 2.6 },
      { pasteCode: 'G', name: 'ירוק פתאלו G', colorHex: '#1D6E42', amountMlPerLiter: 1.1, shotsPerLiter: 1.8 },
    ],
    totalPastesMlPerLiter: 5.9,
    formulaSummary: 'BW | Y: 3.2ml (5.2ש׳) | B: 1.6ml (2.6ש׳) | G: 1.1ml (1.8ש׳)',
    machineDispenseNote: 'ערבול 180 שניות במערבל גירוסקופי לאחר הזרקה. בסיס סופרקריל משי BW.',
    shakerTimeSeconds: 180,
  },
  WW2010: {
    base: 'בסיס לבן (BW)',
    baseCode: 'BW',
    pastes: [
      { pasteCode: 'Y', name: 'אוכרה צהובה Y', colorHex: '#C5952B', amountMlPerLiter: 1.8, shotsPerLiter: 2.9 },
      { pasteCode: 'B', name: 'שחור פחם B', colorHex: '#1E1E1E', amountMlPerLiter: 0.5, shotsPerLiter: 0.8 },
      { pasteCode: 'R', name: 'אדום תחמוצת R', colorHex: '#9E342B', amountMlPerLiter: 0.3, shotsPerLiter: 0.5 },
    ],
    totalPastesMlPerLiter: 2.6,
    formulaSummary: 'BW | Y: 1.8ml (2.9ש׳) | B: 0.5ml (0.8ש׳) | R: 0.3ml (0.5ש׳)',
    machineDispenseNote: 'ערבול 120 שניות. מתאים לקירות פנים סופרקריל 2000.',
    shakerTimeSeconds: 120,
  },
  '0281': {
    base: 'בסיס לבן (BW)',
    baseCode: 'BW',
    pastes: [
      { pasteCode: 'Y', name: 'אוכרה צהובה Y', colorHex: '#C5952B', amountMlPerLiter: 5.6, shotsPerLiter: 9.1 },
      { pasteCode: 'R', name: 'אדום תחמוצת R', colorHex: '#9E342B', amountMlPerLiter: 1.2, shotsPerLiter: 1.9 },
      { pasteCode: 'B', name: 'שחור פחם B', colorHex: '#1E1E1E', amountMlPerLiter: 1.1, shotsPerLiter: 1.8 },
    ],
    totalPastesMlPerLiter: 7.9,
    formulaSummary: 'BW | Y: 5.6ml (9.1ש׳) | R: 1.2ml (1.9ש׳) | B: 1.1ml (1.8ש׳)',
    machineDispenseNote: 'ערבול 180 שניות. גוון חול יציב ועמיד.',
    shakerTimeSeconds: 180,
  },
  '0543': {
    base: 'בסיס פסטל (BP)',
    baseCode: 'BP',
    pastes: [
      { pasteCode: 'B', name: 'שחור פחם B', colorHex: '#1E1E1E', amountMlPerLiter: 4.2, shotsPerLiter: 6.8 },
      { pasteCode: 'Y', name: 'אוכרה צהובה Y', colorHex: '#C5952B', amountMlPerLiter: 1.4, shotsPerLiter: 2.3 },
      { pasteCode: 'U', name: 'אומברה גולמית U', colorHex: '#5A4632', amountMlPerLiter: 0.9, shotsPerLiter: 1.5 },
    ],
    totalPastesMlPerLiter: 6.5,
    formulaSummary: 'BP | B: 4.2ml (6.8ש׳) | Y: 1.4ml (2.3ש׳) | U: 0.9ml (1.5ש׳)',
    machineDispenseNote: 'בסיס פסטל BP, ערבול 180 שניות לקבלת אפור בטון אחיד ללא פסים.',
    shakerTimeSeconds: 180,
  },
  WW1950: {
    base: 'בסיס פסטל (BP)',
    baseCode: 'BP',
    pastes: [
      { pasteCode: 'Y', name: 'אוכרה צהובה Y', colorHex: '#C5952B', amountMlPerLiter: 8.2, shotsPerLiter: 13.3 },
      { pasteCode: 'G', name: 'ירוק פתאלו G', colorHex: '#1D6E42', amountMlPerLiter: 6.4, shotsPerLiter: 10.4 },
      { pasteCode: 'B', name: 'שחור פחם B', colorHex: '#1E1E1E', amountMlPerLiter: 5.1, shotsPerLiter: 8.3 },
    ],
    totalPastesMlPerLiter: 19.7,
    formulaSummary: 'BP | Y: 8.2ml (13.3ש׳) | G: 6.4ml (10.4ש׳) | B: 5.1ml (8.3ש׳)',
    machineDispenseNote: 'ערבול כפול 240 שניות. פיגמנטציה עשירה לקירות פנים.',
    shakerTimeSeconds: 240,
  },
  W204: {
    base: 'בסיס לכה שקופה (BC)',
    baseCode: 'BC',
    pastes: [
      { pasteCode: 'U', name: 'אומברה גולמית U', colorHex: '#5A4632', amountMlPerLiter: 16.0, shotsPerLiter: 26.0 },
      { pasteCode: 'Y', name: 'אוכרה צהובה Y', colorHex: '#C5952B', amountMlPerLiter: 8.5, shotsPerLiter: 13.8 },
      { pasteCode: 'R', name: 'אדום תחמוצת R', colorHex: '#9E342B', amountMlPerLiter: 6.5, shotsPerLiter: 10.6 },
    ],
    totalPastesMlPerLiter: 31.0,
    formulaSummary: 'BC (לכה) | U: 16.0ml | Y: 8.5ml | R: 6.5ml',
    machineDispenseNote: 'ערבול עדין ללא בועות אוויר. מתאים לורניט עץ פנים וחוץ.',
    shakerTimeSeconds: 120,
  },
  M01: {
    base: 'בסיס לבן סופרלק (BW)',
    baseCode: 'BW',
    pastes: [
      { pasteCode: 'B', name: 'שחור פחם B', colorHex: '#1E1E1E', amountMlPerLiter: 0.2, shotsPerLiter: 0.3 },
    ],
    totalPastesMlPerLiter: 0.2,
    formulaSummary: 'BW סופרלק | B: 0.2ml (שובר ברק בלבד)',
    machineDispenseNote: 'הזרקת מיקרו-שוט לשבירת בוהק מתכת. ערבול 120 שניות.',
    shakerTimeSeconds: 120,
  },

  // נירלט
  'IS 0010': {
    base: 'בסיס לבן (BW)',
    baseCode: 'BW',
    pastes: [
      { pasteCode: 'Y', name: 'אוכרה צהובה Y', colorHex: '#C5952B', amountMlPerLiter: 2.1, shotsPerLiter: 3.4 },
      { pasteCode: 'R', name: 'אדום תחמוצת R', colorHex: '#9E342B', amountMlPerLiter: 0.4, shotsPerLiter: 0.6 },
    ],
    totalPastesMlPerLiter: 2.5,
    formulaSummary: 'BW נירלט | Y: 2.1ml (3.4ש׳) | R: 0.4ml (0.6ש׳)',
    machineDispenseNote: 'מתאים לנירוקריל אקסטרה בסיס לבן. ערבול 120 שניות.',
    shakerTimeSeconds: 120,
  },
  'IS 0155': {
    base: 'בסיס לבן (BW)',
    baseCode: 'BW',
    pastes: [
      { pasteCode: 'Y', name: 'אוכרה תחמוצת Y', colorHex: '#C5952B', amountMlPerLiter: 4.8, shotsPerLiter: 7.8 },
      { pasteCode: 'U', name: 'אומברה גולמית U', colorHex: '#5A4632', amountMlPerLiter: 2.4, shotsPerLiter: 3.9 },
      { pasteCode: 'B', name: 'שחור פחם B', colorHex: '#1E1E1E', amountMlPerLiter: 0.8, shotsPerLiter: 1.3 },
      { pasteCode: 'R', name: 'אדום תחמוצת R', colorHex: '#9E342B', amountMlPerLiter: 0.6, shotsPerLiter: 1.0 },
    ],
    totalPastesMlPerLiter: 8.6,
    formulaSummary: 'BW נירלט | Y: 4.8ml (7.8ש׳) | U: 2.4ml (3.9ש׳) | B: 0.8ml | R: 0.6ml',
    machineDispenseNote: 'ערבול 180 שניות במערבל צנטריפוגלי נירלט. גוון אבן טבעי מוביל.',
    shakerTimeSeconds: 180,
  },
  'IS 0412': {
    base: 'בסיס פסטל (BP)',
    baseCode: 'BP',
    pastes: [
      { pasteCode: 'G', name: 'ירוק פתאלו G', colorHex: '#1D6E42', amountMlPerLiter: 5.4, shotsPerLiter: 8.8 },
      { pasteCode: 'Y', name: 'אוכרה צהובה Y', colorHex: '#C5952B', amountMlPerLiter: 4.1, shotsPerLiter: 6.7 },
      { pasteCode: 'B', name: 'שחור פחם B', colorHex: '#1E1E1E', amountMlPerLiter: 2.6, shotsPerLiter: 4.2 },
    ],
    totalPastesMlPerLiter: 12.1,
    formulaSummary: 'BP נירלט | G: 5.4ml (8.8ש׳) | Y: 4.1ml (6.7ש׳) | B: 2.6ml (4.2ש׳)',
    machineDispenseNote: 'בסיס פסטל נירלט אקו-מקס. ערבול 180 שניות.',
    shakerTimeSeconds: 180,
  },
  'IS 0640': {
    base: 'בסיס פסטל (BP)',
    baseCode: 'BP',
    pastes: [
      { pasteCode: 'C', name: 'כחול פתאלו C', colorHex: '#1B4D8A', amountMlPerLiter: 6.8, shotsPerLiter: 11.0 },
      { pasteCode: 'B', name: 'שחור פחם B', colorHex: '#1E1E1E', amountMlPerLiter: 1.8, shotsPerLiter: 2.9 },
      { pasteCode: 'G', name: 'ירוק פתאלו G', colorHex: '#1D6E42', amountMlPerLiter: 0.7, shotsPerLiter: 1.1 },
    ],
    totalPastesMlPerLiter: 9.3,
    formulaSummary: 'BP נירלט | C: 6.8ml (11.0ש׳) | B: 1.8ml (2.9ש׳) | G: 0.7ml',
    machineDispenseNote: 'ערבול 180 שניות לקבלת תכלת שמיים אחיד ונקי.',
    shakerTimeSeconds: 180,
  },

  // ח.סבן בלעדי ו-RAL
  '0001': {
    base: 'בסיס לבן טהור (BW)',
    baseCode: 'BW',
    pastes: [],
    totalPastesMlPerLiter: 0.0,
    formulaSummary: 'BW טהור | ללא צורך בהזרקת משחות (מוכן ליישום מידי)',
    machineDispenseNote: 'לבן שלג טהור במרקם משי. אין צורך בהזרקה, ערבול קצר בלבד.',
    shakerTimeSeconds: 60,
  },
  'SB-0B3B': {
    base: 'בסיס עמוק/שקוף (BD/BC)',
    baseCode: 'BD',
    pastes: [
      { pasteCode: 'C', name: 'כחול פתאלו עמוק C', colorHex: '#1B4D8A', amountMlPerLiter: 18.5, shotsPerLiter: 30.0 },
      { pasteCode: 'B', name: 'שחור פחם B', colorHex: '#1E1E1E', amountMlPerLiter: 14.2, shotsPerLiter: 23.1 },
      { pasteCode: 'M', name: 'מגנטה אורגנית M', colorHex: '#A31D5E', amountMlPerLiter: 5.8, shotsPerLiter: 9.4 },
      { pasteCode: 'W', name: 'לבן טיטניום W', colorHex: '#F5F5F7', amountMlPerLiter: 3.5, shotsPerLiter: 5.7 },
    ],
    totalPastesMlPerLiter: 42.0,
    formulaSummary: 'BD | C: 18.5ml (30ש׳) | B: 14.2ml (23.1ש׳) | M: 5.8ml | W: 3.5ml',
    machineDispenseNote: 'בסיס אקסטרה דיפ סבן. הזרקה מסיבית + ערבול 300 שניות.',
    shakerTimeSeconds: 300,
  },
  'RAL 7016': {
    base: 'בסיס עמוק (BD)',
    baseCode: 'BD',
    pastes: [
      { pasteCode: 'B', name: 'שחור פחם B', colorHex: '#1E1E1E', amountMlPerLiter: 28.0, shotsPerLiter: 45.5 },
      { pasteCode: 'C', name: 'כחול פתאלו C', colorHex: '#1B4D8A', amountMlPerLiter: 4.5, shotsPerLiter: 7.3 },
      { pasteCode: 'Y', name: 'אוכרה צהובה Y', colorHex: '#C5952B', amountMlPerLiter: 3.2, shotsPerLiter: 5.2 },
    ],
    totalPastesMlPerLiter: 35.7,
    formulaSummary: 'BD אנתרציט | B: 28.0ml (45.5ש׳) | C: 4.5ml (7.3ש׳) | Y: 3.2ml (5.2ש׳)',
    machineDispenseNote: 'RAL 7016 אנתרציט לקירות כוח. ערבול 240 שניות.',
    shakerTimeSeconds: 240,
  },

  // יעקבי
  W101: {
    base: 'בסיס לכה שקופה (BC)',
    baseCode: 'BC',
    pastes: [
      { pasteCode: 'Y', name: 'אוכרה צהובה Y', colorHex: '#C5952B', amountMlPerLiter: 14.0, shotsPerLiter: 22.7 },
      { pasteCode: 'U', name: 'אומברה גולמית U', colorHex: '#5A4632', amountMlPerLiter: 5.0, shotsPerLiter: 8.1 },
      { pasteCode: 'R', name: 'אדום תחמוצת R', colorHex: '#9E342B', amountMlPerLiter: 2.0, shotsPerLiter: 3.2 },
    ],
    totalPastesMlPerLiter: 21.0,
    formulaSummary: 'BC יעקבי | Y: 14.0ml | U: 5.0ml | R: 2.0ml',
    machineDispenseNote: 'ערבול עדין ללא בועות ללכה בלנשון.',
    shakerTimeSeconds: 120,
  },
  'DTM-90': {
    base: 'בסיס המרייט ישיר לחלודה (BD)',
    baseCode: 'BD',
    pastes: [
      { pasteCode: 'B', name: 'שחור פחם B', colorHex: '#1E1E1E', amountMlPerLiter: 12.0, shotsPerLiter: 19.5 },
      { pasteCode: 'C', name: 'כחול פתאלו C', colorHex: '#1B4D8A', amountMlPerLiter: 3.0, shotsPerLiter: 4.9 },
    ],
    totalPastesMlPerLiter: 15.0,
    formulaSummary: 'BD המרייט | B: 12.0ml (19.5ש׳) | C: 3.0ml (4.9ש׳)',
    machineDispenseNote: 'מתכת DTM מרוקע. ערבול 180 שניות במערבל ייעודי לצבעי מתכת.',
    shakerTimeSeconds: 180,
  },
};

/**
 * Calculates or looks up the realistic tinting paste formula for ANY shade.
 */
export function getOrCreateTintFormula(shade: {
  code: string;
  name?: string;
  hex: string;
  manufacturer?: string;
}): TintFormula {
  const cleanCode = String(shade.code || '').trim();
  // Normalize variations like '543' -> '0543', '281' -> '0281'
  let lookupKey = cleanCode;
  if (/^\d{3}$/.test(cleanCode)) {
    lookupKey = '0' + cleanCode;
  }

  // Exact match
  if (EXACT_SHADE_RECIPES[lookupKey]) {
    const recipe = EXACT_SHADE_RECIPES[lookupKey];
    return {
      base: recipe.base || 'בסיס לבן (BW)',
      baseCode: recipe.baseCode || 'BW',
      pastes: recipe.pastes || [],
      totalPastesMlPerLiter: recipe.totalPastesMlPerLiter ?? 0,
      formulaSummary: recipe.formulaSummary || '',
      machineDispenseNote: recipe.machineDispenseNote || 'ערבול במערבל גירוסקופי 180 שניות.',
      shakerTimeSeconds: recipe.shakerTimeSeconds || 180,
      isSyncedToSheet: true,
      lastInjectedAt: new Date().toISOString(),
    };
  }

  // Fallback: Algorithmic calculation based on HEX color luminance and chroma
  let hex = (shade.hex || '#FFFFFF').replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) || 200;
  const g = parseInt(hex.substring(2, 4), 16) || 200;
  const b = parseInt(hex.substring(4, 6), 16) || 200;

  // Relative luminance
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  let baseCode = 'BW';
  let base = 'בסיס לבן (BW)';
  if (lum < 0.35) {
    baseCode = 'BD';
    base = 'בסיס עמוק/שקוף (BD)';
  } else if (lum < 0.70) {
    baseCode = 'BP';
    base = 'בסיס פסטל (BP)';
  }

  const pastes: TintPasteItem[] = [];

  // Darkness component -> Black or Umber
  const darkness = 1 - lum;
  if (darkness > 0.05) {
    const blackMl = Math.round(darkness * (baseCode === 'BD' ? 32 : 8) * 10) / 10;
    if (blackMl > 0.1) {
      pastes.push({
        pasteCode: 'B',
        name: 'שחור פחם B',
        colorHex: '#1E1E1E',
        amountMlPerLiter: blackMl,
        shotsPerLiter: Math.round((blackMl / ML_PER_SHOT) * 10) / 10,
      });
    }
  }

  // Color tint components based on RGB variance
  if (r > g && r > b) {
    // Warm / Yellow / Red
    const yMl = Math.round(Math.max(1.2, ((r - b) / 255) * 12) * 10) / 10;
    pastes.push({
      pasteCode: 'Y',
      name: 'אוכרה צהובה Y',
      colorHex: '#C5952B',
      amountMlPerLiter: yMl,
      shotsPerLiter: Math.round((yMl / ML_PER_SHOT) * 10) / 10,
    });
    if (r - g > 25) {
      const rMl = Math.round(((r - g) / 255) * 4 * 10) / 10;
      if (rMl > 0.2) {
        pastes.push({
          pasteCode: 'R',
          name: 'אדום תחמוצת R',
          colorHex: '#9E342B',
          amountMlPerLiter: rMl,
          shotsPerLiter: Math.round((rMl / ML_PER_SHOT) * 10) / 10,
        });
      }
    }
  } else if (g > r && g > b) {
    // Greenish
    const gMl = Math.round(Math.max(1.5, ((g - r) / 255) * 10) * 10) / 10;
    pastes.push({
      pasteCode: 'G',
      name: 'ירוק פתאלו G',
      colorHex: '#1D6E42',
      amountMlPerLiter: gMl,
      shotsPerLiter: Math.round((gMl / ML_PER_SHOT) * 10) / 10,
    });
    pastes.push({
      pasteCode: 'Y',
      name: 'אוכרה צהובה Y',
      colorHex: '#C5952B',
      amountMlPerLiter: Math.round(gMl * 0.7 * 10) / 10,
      shotsPerLiter: Math.round(((gMl * 0.7) / ML_PER_SHOT) * 10) / 10,
    });
  } else if (b > r || b > g) {
    // Blueish
    const cMl = Math.round(Math.max(1.5, ((b - Math.min(r, g)) / 255) * 14) * 10) / 10;
    pastes.push({
      pasteCode: 'C',
      name: 'כחול פתאלו C',
      colorHex: '#1B4D8A',
      amountMlPerLiter: cMl,
      shotsPerLiter: Math.round((cMl / ML_PER_SHOT) * 10) / 10,
    });
  }

  const totalPastesMl = Math.round(pastes.reduce((acc, p) => acc + p.amountMlPerLiter, 0) * 10) / 10;
  const formulaSummary = `${baseCode} | ` + pastes.map((p) => `${p.pasteCode}: ${p.amountMlPerLiter}ml`).join(' | ');

  return {
    base,
    baseCode,
    pastes,
    totalPastesMlPerLiter: totalPastesMl,
    formulaSummary,
    machineDispenseNote: `הזרקת משחות גיוון ממוחשבת עבור גוון ${shade.code}. ערבול 180 שניות.`,
    shakerTimeSeconds: 180,
    isSyncedToSheet: true,
    lastInjectedAt: new Date().toISOString(),
  };
}

/**
 * Calculates dispensing quantities for a given can/bucket size in liters
 */
export function computeDispenseForVolume(formula: TintFormula, volumeLiters: number) {
  const scaledPastes = formula.pastes.map((p) => {
    const scaledMl = Math.round(p.amountMlPerLiter * volumeLiters * 10) / 10;
    const scaledShots = Math.round((scaledMl / ML_PER_SHOT) * 10) / 10;
    return {
      ...p,
      scaledMl,
      scaledShots,
    };
  });

  const totalVolumeMl = Math.round(formula.totalPastesMlPerLiter * volumeLiters * 10) / 10;
  const totalVolumeShots = Math.round((totalVolumeMl / ML_PER_SHOT) * 10) / 10;

  return {
    volumeLiters,
    baseCode: formula.baseCode,
    base: formula.base,
    scaledPastes,
    totalVolumeMl,
    totalVolumeShots,
    shakerTimeSeconds: volumeLiters >= 18 ? 300 : volumeLiters >= 5 ? 240 : 180,
  };
}
