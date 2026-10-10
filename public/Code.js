/**
 * ==============================================================================
 * ח.סבן חומרי בניין (1994) בע״מ – מודול נועה צבע, גוונים ומשחות גיוון
 * סקריפט Google Apps Script מלא (Code.js)
 * ==============================================================================
 * תפקיד הסקריפט:
 * 1. יצירה ועיצוב אוטומטי של כל 6 הטאבים (גיליונות):
 *    - טאב "מניפת גוונים - קטלוג ארצי" (כולל עמודות בסיס ונוסחאות משחות גיוון)
 *    - טאב "נוסחאות גיוון ומשחות - מחלקת צבע" (לוג הזרקת משחות במכונת גיוון)
 *    - טאב "הזמנות - סניף תלמיד 6" (סניף הדגל ומחלקת גוונים ממוחשבת)
 *    - טאב "הזמנות - סניף החרש אסף" (סניף קבלנים וחומרי גמר)
 *    - טאב "גוונים שנבחרו בקנבס" (היסטוריית בדיקות והדמיות)
 *    - טאב "סלים מומלצים - נועה Ai" (ריכוז סלי מוצרים ובדיקת Upsell)
 * 2. קבלת נתונים חיים (Webhook - doPost) מהאפליקציה:
 *    - קליטת הזמנות וניתוב לסניף
 *    - הזרקת וסנכרון משחות גוונים ממוחשבות
 *    - קליטת גוונים וסלים
 * 3. ייצוא קטלוג הגוונים והמשחות המלא ב-JSON (doGet) ישירות לאפליקציה
 * 4. תפריט ניהול ייעודי ב-Google Sheets: "ח.סבן - ניהול גוונים ומשחות"
 * ==============================================================================
 */

// צבעי מיתוג ח.סבן
var SABAN_NAVY = "#0B3B60";
var SABAN_BLUE = "#0284C7";
var SABAN_LIGHT_BLUE = "#E0F2FE";
var SABAN_GOLD = "#F59E0B";
var SABAN_BG_LIGHT = "#F8FAFC";
var TEXT_WHITE = "#FFFFFF";

/**
 * מופעל בעת פתיחת הגיליון – יוצר תפריט מותאם אישית בראש המסך
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("🎨 ח.סבן - ניהול גוונים והזמנות")
    .addItem("🚀 הקם ועצב את כל הטאבים מחדש (כולל מניפת RAL)", "setupAllSabanSheets")
    .addItem("🇩🇪 הקם / סנכרן טאב ייעודי 'מניפת RAL'", "seedRalFandeckSheet")
    .addItem("💉 הזרק משחות גוונים ממוחשבות לכל המניפה", "injectTintPastesToCatalog")
    .addItem("🎨 הוסף גווני דוגמה למניפה (טמבור, נירלט, יעקבי, RAL)", "seedColorCatalog")
    .addItem("📊 רענן עיצוב ורוחב עמודות לכל הטאבים", "formatAllSheets")
    .addSeparator()
    .addItem("ℹ️ הנחיות חיבור Webhook לאפליקציה", "showWebhookInstructions")
    .addToUi();
}

/**
 * פונקציה ראשית: יוצרת ומעצבת את כל 7 הטאבים במבנה UX/UI מקצועי מלא בעברית
 */
function setupAllSabanSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. יצירת הטאבים כולל טאב מניפת RAL ייעודי
  var sheetCatalog = getOrCreateSheet(ss, "מניפת גוונים - קטלוג ארצי", 1);
  var sheetRal = getOrCreateSheet(ss, "מניפת RAL", 2);
  var sheetPastes = getOrCreateSheet(ss, "נוסחאות גיוון ומשחות - מחלקת צבע", 3);
  var sheetTalmid = getOrCreateSheet(ss, "הזמנות - סניף תלמיד 6", 4);
  var sheetHarash = getOrCreateSheet(ss, "הזמנות - סניף החרש אסף", 5);
  var sheetShadesLog = getOrCreateSheet(ss, "גוונים שנבחרו בקנבס", 6);
  var sheetBaskets = getOrCreateSheet(ss, "סלים מומלצים - נועה Ai", 7);

  // 2. הגדרת כיוון מימין לשמאל (RTL) לכל הטאבים
  var allSheets = [sheetCatalog, sheetRal, sheetPastes, sheetTalmid, sheetHarash, sheetShadesLog, sheetBaskets];
  allSheets.forEach(function(s) {
    s.setRightToLeft(true);
  });

  // 3. בניית כותרות ועיצוב לכל טאב
  buildCatalogSheet(sheetCatalog);
  buildRalSheet(sheetRal);
  buildTintPastesSheet(sheetPastes);
  buildBranchOrdersSheet(sheetTalmid, "סניף תלמיד 6 (סניף הדגל ומחלקת גוונים ממוחשבת)");
  buildBranchOrdersSheet(sheetHarash, "סניף החרש אסף (סניף קבלנים וחומרי גמר ושיקום)");
  buildShadesLogSheet(sheetShadesLog);
  buildBasketsSheet(sheetBaskets);

  // 4. הזנת קטלוג גוונים ומשחות עשיר התחלתי
  seedColorCatalog();
  seedRalFandeckSheet();

  SpreadsheetApp.getUi().alert(
    "ההתקנה הושלמה בהצלחה!\n\n" +
    "כל 7 הטאבים (כולל טאב 'מניפת RAL') הוקמו, עוצבו ומוכנים לקליטת משחות גוונים, הזמנות וסנכרון חי מול אפליקציית נועה.\n" +
    "כעת לחץ על 'Deploy -> New deployment -> Web app' לקבלת קישור Webhook."
  );
}

/**
 * עזר לקבלת גיליון קיים או יצירתו
 */
function getOrCreateSheet(ss, name, index) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name, index - 1);
  }
  return sheet;
}

/**
 * בניית טאב 1: מניפת גוונים - קטלוג ארצי (כולל עמודות משחות גוונים ובסיסים)
 */
function buildCatalogSheet(sheet) {
  sheet.clear();
  
  // באנר ראשי מעוצב
  sheet.getRange("A1:N1").merge();
  sheet.getRange("A1").setValue("🎨 ח.סבן חומרי בניין (1994) בע״מ – קטלוג מניפות ארצי ומפרט משחות גיוון (טמבור, נירלט, יעקבי, RAL)");
  sheet.getRange("A1").setBackground(SABAN_NAVY).setFontColor(TEXT_WHITE).setFontSize(14).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(1, 40);

  // שורת כותרות עמודות
  var headers = [
    "דוגמית צבע",
    "קוד גוון",
    "שם הגוון",
    "חברה / יצרן",
    "שם המניפה / קולקציה",
    "קוד HEX",
    "משפחת צבע",
    "סוג משטח",
    "גימור מומלץ",
    "עמוד במניפה",
    "בסיס גיוון (Base)",
    "נוסחת הזרקת משחות (מ״ל לליטר)",
    "סה״כ משחה (מ״ל)",
    "הוראות ערבול וסטטוס הזרקה"
  ];

  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  var headerRange = sheet.getRange(2, 1, 1, headers.length);
  headerRange.setBackground(SABAN_BLUE)
             .setFontColor(TEXT_WHITE)
             .setFontWeight("bold")
             .setFontSize(11)
             .setHorizontalAlignment("center")
             .setVerticalAlignment("middle");
  sheet.setRowHeight(2, 34);

  // הקפאת שורות כותרת
  sheet.setFrozenRows(2);
}

/**
 * בניית טאב 2: מניפת RAL (מניפה אירופית תקנית לתעשייה, אדריכלות, מתכת ופרופילים)
 */
function buildRalSheet(sheet) {
  sheet.clear();
  
  sheet.getRange("A1:N1").merge();
  sheet.getRange("A1").setValue("🇩🇪 ח.סבן חומרי בניין (1994) בע״מ – מניפת RAL קלאסיק ומפרט גיוון ממוחשב");
  sheet.getRange("A1").setBackground("#1E293B").setFontColor(TEXT_WHITE).setFontSize(14).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(1, 40);

  var headers = [
    "דוגמית צבע",
    "קוד גוון RAL",
    "שם הגוון (עברית / English)",
    "תקן / יצרן",
    "קולקציה / מניפה",
    "קוד HEX",
    "משפחת צבע",
    "סוג משטח מומלץ",
    "גימור מומלץ",
    "עמוד במניפה",
    "בסיס גיוון (Base)",
    "נוסחת הזרקת משחות (מ״ל לליטר)",
    "סה״כ משחה (מ״ל)",
    "הוראות ערבול ושימוש"
  ];

  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, 1, headers.length)
       .setBackground("#B45309")
       .setFontColor(TEXT_WHITE)
       .setFontWeight("bold")
       .setFontSize(11)
       .setHorizontalAlignment("center")
       .setVerticalAlignment("middle");
  sheet.setRowHeight(2, 34);
  sheet.setFrozenRows(2);
}

/**
 * מאגר גווני מניפת RAL מובילים עם נוסחאות משחות ממוחשבות
 */
function getRalShadesData() {
  return [
    {
      code: "RAL 9010",
      name: "לבן טהור (Pure White)",
      brand: "ח.סבן",
      book: "מניפת RAL",
      hex: "#F7F9F5",
      family: "לבן ופנינה",
      surface: "קירות פנים",
      finish: "מט משי",
      page: "עמ׳ RAL-9010",
      base: "בסיס לבן (BW)",
      pastesFormula: "Y: 0.8ml (1.3ש׳) | B: 0.2ml (0.3ש׳)",
      totalPastesMl: 1.0,
      shakerTime: 120,
      machineNote: "RAL 9010 לבן טהור (Pure White) לפרופילים וקירות. ערבול 120 שניות."
    },
    {
      code: "RAL 9003",
      name: "לבן אותות (Signal White)",
      brand: "ח.סבן",
      book: "מניפת RAL",
      hex: "#F4F4F4",
      family: "לבן ופנינה",
      surface: "תקרה וגבס",
      finish: "מט מהודר",
      page: "עמ׳ RAL-9003",
      base: "בסיס לבן טהור (BW)",
      pastesFormula: "B: 0.15ml | C: 0.08ml (שובר בוהק)",
      totalPastesMl: 0.23,
      shakerTime: 120,
      machineNote: "RAL 9003 לבן אותות (Signal White). בהירות מקסימלית ועמידות UV."
    },
    {
      code: "RAL 7016",
      name: "אנתרציט פחם (Anthracite Grey)",
      brand: "ח.סבן",
      book: "מניפת RAL",
      hex: "#373F47",
      family: "אפורים מודרניים",
      surface: "קירות פנים",
      finish: "מט משי",
      page: "עמ׳ RAL-7016",
      base: "בסיס עמוק (BD)",
      pastesFormula: "B: 28.0ml (45.5ש׳) | C: 4.5ml (7.3ש׳) | Y: 3.2ml (5.2ש׳)",
      totalPastesMl: 35.7,
      shakerTime: 240,
      machineNote: "RAL 7016 אנתרציט פחם לקירות כוח, אלומיניום ושערים. ערבול 240 שניות."
    },
    {
      code: "RAL 9005",
      name: "שחור מט עמוק (Jet Black)",
      brand: "ח.סבן",
      book: "מניפת RAL",
      hex: "#0A0A0A",
      family: "אפורים מודרניים",
      surface: "מתכת DTM",
      finish: "מט משי",
      page: "עמ׳ RAL-9005",
      base: "בסיס עמוק/שקוף (BD)",
      pastesFormula: "B: 38.0ml (61.7ש׳) | C: 2.2ml",
      totalPastesMl: 40.2,
      shakerTime: 300,
      machineNote: "RAL 9005 שחור עמוק (Jet Black) מתכת וקירות. ערבול כפול 300 שניות."
    },
    {
      code: "RAL 7035",
      name: "אפור בהיר תעשייתי (Light Grey)",
      brand: "ח.סבן",
      book: "מניפת RAL",
      hex: "#D7D7D7",
      family: "אפורים מודרניים",
      surface: "קירות פנים",
      finish: "מט משי",
      page: "עמ׳ RAL-7035",
      base: "בסיס פסטל (BP)",
      pastesFormula: "B: 3.4ml (5.5ש׳) | Y: 1.1ml | U: 0.6ml",
      totalPastesMl: 5.1,
      shakerTime: 180,
      machineNote: "RAL 7035 אפור בהיר (Light Grey) לוחות וארונות חשמל ותעשייה. ערבול 180 שניות."
    },
    {
      code: "RAL 7040",
      name: "אפור חלון (Window Grey)",
      brand: "ח.סבן",
      book: "מניפת RAL",
      hex: "#9DA3A6",
      family: "אפורים מודרניים",
      surface: "קירות פנים",
      finish: "מט משי",
      page: "עמ׳ RAL-7040",
      base: "בסיס פסטל (BP)",
      pastesFormula: "B: 8.5ml (13.8ש׳) | C: 1.4ml | Y: 0.9ml",
      totalPastesMl: 10.8,
      shakerTime: 180,
      machineNote: "RAL 7040 אפור חלון (Window Grey). מתאים לקירות בטון מודרניים ומפתחים."
    },
    {
      code: "RAL 1013",
      name: "לבן פנינה צדף (Oyster White)",
      brand: "ח.סבן",
      book: "מניפת RAL",
      hex: "#E9E5CE",
      family: "לבן ופנינה",
      surface: "קירות פנים",
      finish: "מט משי",
      page: "עמ׳ RAL-1013",
      base: "בסיס לבן (BW)",
      pastesFormula: "Y: 3.5ml (5.7ש׳) | U: 1.2ml | R: 0.4ml",
      totalPastesMl: 5.1,
      shakerTime: 180,
      machineNote: "RAL 1013 לבן פנינה (Oyster White) קלאסי ועדין. ערבול 180 שניות."
    },
    {
      code: "RAL 5002",
      name: "כחול אולטראמרין (Ultramarine Blue)",
      brand: "ח.סבן",
      book: "מניפת RAL",
      hex: "#20214F",
      family: "כחול Saban",
      surface: "מתכת DTM",
      finish: "מבריק",
      page: "עמ׳ RAL-5002",
      base: "בסיס עמוק/שקוף (BD)",
      pastesFormula: "C: 24.0ml (39.0ש׳) | M: 4.8ml | B: 3.5ml",
      totalPastesMl: 32.3,
      shakerTime: 240,
      machineNote: "RAL 5002 כחול אולטראמרין (Ultramarine Blue). גוון עשיר לתעשייה ועיצוב. ערבול 240 שניות."
    },
    {
      code: "RAL 6005",
      name: "ירוק טחב שערים (Moss Green)",
      brand: "ח.סבן",
      book: "מניפת RAL",
      hex: "#2F4538",
      family: "מרווה וטבע",
      surface: "מתכת DTM",
      finish: "חצי מבריק",
      page: "עמ׳ RAL-6005",
      base: "בסיס עמוק (BD)",
      pastesFormula: "G: 19.5ml (31.7ש׳) | B: 12.0ml | Y: 4.2ml",
      totalPastesMl: 35.7,
      shakerTime: 240,
      machineNote: "RAL 6005 ירוק אזמרגד/טחב (Moss Green) שערים, גדרות ומתכת. ערבול 240 שניות."
    },
    {
      code: "RAL 3020",
      name: "אדום תנועה (Traffic Red)",
      brand: "ח.סבן",
      book: "מניפת RAL",
      hex: "#CC0605",
      family: "מתכת מונע חלודה",
      surface: "מתכת DTM",
      finish: "מבריק",
      page: "עמ׳ RAL-3020",
      base: "בסיס עמוק (BD)",
      pastesFormula: "R: 22.0ml | M: 11.0ml | Y: 3.5ml",
      totalPastesMl: 36.5,
      shakerTime: 240,
      machineNote: "RAL 3020 אדום עז (Traffic Red) שילוט ובטיחות. ערבול 240 שניות."
    },
    {
      code: "RAL 8017",
      name: "חום שוקולד (Chocolate Brown)",
      brand: "ח.סבן",
      book: "מניפת RAL",
      hex: "#45322E",
      family: "עץ טבעי ולכות",
      surface: "מתכת DTM",
      finish: "מט משי",
      page: "עמ׳ RAL-8017",
      base: "בסיס עמוק (BD)",
      pastesFormula: "B: 18.0ml | U: 12.0ml | R: 6.0ml",
      totalPastesMl: 36.0,
      shakerTime: 240,
      machineNote: "RAL 8017 חום שוקולד (Chocolate Brown) פרגולות ופתחים. ערבול 240 שניות."
    }
  ];
}

/**
 * הזנת נתוני גווני RAL לטאב 'מניפת RAL' הייעודי
 */
function seedRalFandeckSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("מניפת RAL");
  if (!sheet) {
    sheet = getOrCreateSheet(ss, "מניפת RAL", 2);
    sheet.setRightToLeft(true);
    buildRalSheet(sheet);
  }

  var colors = getRalShadesData();
  var lastRow = sheet.getLastRow();
  if (lastRow >= 3) {
    sheet.getRange(3, 1, lastRow - 2, 14).clearContent().clearFormat();
  }

  for (var i = 0; i < colors.length; i++) {
    var row = i + 3;
    var c = colors[i];
    
    sheet.getRange(row, 1).setValue("■").setBackground(c.hex).setFontColor(c.hex).setHorizontalAlignment("center");
    sheet.getRange(row, 2).setValue(c.code).setFontWeight("bold").setHorizontalAlignment("center");
    sheet.getRange(row, 3).setValue(c.name);
    sheet.getRange(row, 4).setValue(c.brand).setHorizontalAlignment("center");
    sheet.getRange(row, 5).setValue(c.book);
    sheet.getRange(row, 6).setValue(c.hex).setFontFamily("monospace").setHorizontalAlignment("center");
    sheet.getRange(row, 7).setValue(c.family).setHorizontalAlignment("center");
    sheet.getRange(row, 8).setValue(c.surface).setHorizontalAlignment("center");
    sheet.getRange(row, 9).setValue(c.finish).setHorizontalAlignment("center");
    sheet.getRange(row, 10).setValue(c.page).setHorizontalAlignment("center");
    sheet.getRange(row, 11).setValue(c.base).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.getRange(row, 12).setValue(c.pastesFormula).setFontFamily("monospace");
    sheet.getRange(row, 13).setValue(c.totalPastesMl).setHorizontalAlignment("center");
    sheet.getRange(row, 14).setValue(c.machineNote);

    if (i % 2 === 1) {
      sheet.getRange(row, 2, 1, 13).setBackground(SABAN_BG_LIGHT);
    }
  }

  for (var col = 1; col <= 14; col++) {
    sheet.autoResizeColumn(col);
  }
  sheet.setColumnWidth(1, 60);
  sheet.setColumnWidth(12, 280);
}

/**
 * בניית טאב 2: נוסחאות גיוון ומשחות - מחלקת צבע (לוג מפורט למכונת גיוון)
 */
function buildTintPastesSheet(sheet) {
  sheet.clear();

  sheet.getRange("A1:L1").merge();
  sheet.getRange("A1").setValue("💉 מחלקת גוונים ממוחשבת – מפרט הזרקת משחות צבע (Colorants & Dispenser Log)");
  sheet.getRange("A1").setBackground(SABAN_NAVY).setFontColor(TEXT_WHITE).setFontSize(13).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(1, 40);

  var headers = [
    "דוגמית",
    "קוד גוון",
    "שם הגוון",
    "חברה",
    "בסיס צבע (BW/BP/BD)",
    "פירוט משחות להזרקה (קולורנטים)",
    "סה״כ משחה (מ״ל לליטר)",
    "שוטים לליטר (1/48 oz)",
    "זמן ערבול (שניות)",
    "הוראות מכונה וסניף",
    "סונכרן מנועה PWA",
    "תאריך ושעת הזרקה"
  ];

  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  var headerRange = sheet.getRange(2, 1, 1, headers.length);
  headerRange.setBackground(SABAN_BLUE)
             .setFontColor(TEXT_WHITE)
             .setFontWeight("bold")
             .setFontSize(11)
             .setHorizontalAlignment("center")
             .setVerticalAlignment("middle");
  sheet.setRowHeight(2, 32);
  sheet.setFrozenRows(2);
}

/**
 * בניית טאב 3 ו-4: הזמנות לסניף (תלמיד 6 או החרש אסף)
 */
function buildBranchOrdersSheet(sheet, branchSubtitle) {
  sheet.clear();

  // באנר עליון ממותג
  sheet.getRange("A1:K1").merge();
  sheet.getRange("A1").setValue("🏢 מערכת הזמנות סניף – " + branchSubtitle);
  sheet.getRange("A1").setBackground(SABAN_NAVY).setFontColor(TEXT_WHITE).setFontSize(13).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(1, 40);

  // שורת כותרות
  var headers = [
    "מספר הזמנה",
    "תאריך ושעה",
    "שם הלקוח",
    "טלפון ליצירת קשר",
    "גוון מבוקש וכמות",
    "סל מוצרים נלווה (בונדרול/ציוד)",
    "סה״כ לתשלום (₪)",
    "סטטוס טיפול בסניף",
    "איסוף משוער",
    "הערות לקוח ודלפק",
    "סונכרן מנועה"
  ];

  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  var headerRange = sheet.getRange(2, 1, 1, headers.length);
  headerRange.setBackground(SABAN_BLUE)
             .setFontColor(TEXT_WHITE)
             .setFontWeight("bold")
             .setFontSize(11)
             .setHorizontalAlignment("center")
             .setVerticalAlignment("middle");
  sheet.setRowHeight(2, 32);

  sheet.setFrozenRows(2);

  // הגדרת תפריט נפתח (Dropdown Validation) לסטטוס הזמנה בעמודה H
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["התקבלה", "בטיפול בסניף", "מוכנה לאיסוף", "נמסרה ללקוח", "בוטלה"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange("H3:H1000").setDataValidation(rule);
}

/**
 * בניית טאב 5: גוונים שנבחרו בקנבס ובצ׳אט
 */
function buildShadesLogSheet(sheet) {
  sheet.clear();

  sheet.getRange("A1:G1").merge();
  sheet.getRange("A1").setValue("👁️ לוג גוונים שנבחנו בקנבס ובצ׳אט נועה (מגמות בחירה ודרישות שוק)");
  sheet.getRange("A1").setBackground(SABAN_NAVY).setFontColor(TEXT_WHITE).setFontSize(13).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(1, 40);

  var headers = [
    "דוגמית",
    "קוד גוון",
    "שם גוון",
    "יצרן",
    "סניף מקושר",
    "מקור הבחירה",
    "תאריך ושעה"
  ];

  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, 1, headers.length)
       .setBackground(SABAN_BLUE)
       .setFontColor(TEXT_WHITE)
       .setFontWeight("bold")
       .setHorizontalAlignment("center")
       .setVerticalAlignment("middle");
  sheet.setRowHeight(2, 32);
  sheet.setFrozenRows(2);
}

/**
 * בניית טאב 6: סלים מומלצים - נועה Ai
 */
function buildBasketsSheet(sheet) {
  sheet.clear();

  sheet.getRange("A1:H1").merge();
  sheet.getRange("A1").setValue("🛍️ סלי מוצרים שהורכבו ע״י נועה Ai – מעקב הצעות שדרוג (Upsell)");
  sheet.getRange("A1").setBackground(SABAN_NAVY).setFontColor(TEXT_WHITE).setFontSize(13).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(1, 40);

  var headers = [
    "מזהה סל",
    "תאריך",
    "סניף",
    "קטגוריית חלל",
    "מספר פריטים",
    "הערכת מחיר (₪)",
    "אופסל נכלל? (בונדרול/Tesa)",
    "פירוט מוצרים בסל"
  ];

  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, 1, headers.length)
       .setBackground(SABAN_BLUE)
       .setFontColor(TEXT_WHITE)
       .setFontWeight("bold")
       .setHorizontalAlignment("center")
       .setVerticalAlignment("middle");
  sheet.setRowHeight(2, 32);
  sheet.setFrozenRows(2);
}

/**
 * מאגר עשיר של 16 גוונים ממניפות טמבור, נירלט, יעקבי וח.סבן
 * כולל נוסחאות הזרקת משחות גיוון מקצועיות ובסיסי צבע!
 */
function getRichShadesData() {
  return [
    // טמבור – המניפה
    { 
      code: "WW2202", 
      name: "לראות צלול", 
      brand: "טמבור", 
      book: "המניפה – טמבור 2026", 
      hex: "#D7DDD4", 
      family: "לבן ופנינה", 
      surface: "קירות פנים", 
      finish: "מט משי", 
      page: "עמ׳ 42",
      base: "בסיס לבן (BW)",
      pastesFormula: "Y: 3.2ml (5.2ש׳) | B: 1.6ml (2.6ש׳) | G: 1.1ml (1.8ש׳)",
      totalPastesMl: 5.9,
      shakerTime: 180,
      machineNote: "ערבול 180 שניות במערבל גירוסקופי. בסיס סופרקריל משי BW."
    },
    { 
      code: "WW2010", 
      name: "כותנה מנחמת", 
      brand: "טמבור", 
      book: "המניפה – טמבור", 
      hex: "#EFECE6", 
      family: "לבן ופנינה", 
      surface: "קירות פנים", 
      finish: "מט משי", 
      page: "עמ׳ 38",
      base: "בסיס לבן (BW)",
      pastesFormula: "Y: 1.8ml (2.9ש׳) | B: 0.5ml (0.8ש׳) | R: 0.3ml (0.5ש׳)",
      totalPastesMl: 2.6,
      shakerTime: 120,
      machineNote: "ערבול 120 שניות. מתאים לקירות פנים סופרקריל 2000."
    },
    { 
      code: "0281", 
      name: "חול ים זהוב", 
      brand: "טמבור", 
      book: "המניפה – טמבור", 
      hex: "#E2D5C3", 
      family: "אבן וחול", 
      surface: "קירות פנים", 
      finish: "מט משי", 
      page: "עמ׳ 55",
      base: "בסיס לבן (BW)",
      pastesFormula: "Y: 5.6ml (9.1ש׳) | R: 1.2ml (1.9ש׳) | B: 1.1ml (1.8ש׳)",
      totalPastesMl: 7.9,
      shakerTime: 180,
      machineNote: "ערבול 180 שניות. גוון חול יציב ועמיד."
    },
    { 
      code: "0543", 
      name: "בטון מעודן", 
      brand: "טמבור", 
      book: "המניפה – אורבני", 
      hex: "#C8CCCB", 
      family: "אפורים מודרניים", 
      surface: "קירות פנים", 
      finish: "מט מהודר", 
      page: "עמ׳ 84",
      base: "בסיס פסטל (BP)",
      pastesFormula: "B: 4.2ml (6.8ש׳) | Y: 1.4ml (2.3ש׳) | U: 0.9ml (1.5ש׳)",
      totalPastesMl: 6.5,
      shakerTime: 180,
      machineNote: "בסיס פסטל BP, ערבול 180 שניות לקבלת אפור בטון אחיד ללא פסים."
    },
    { 
      code: "WW1950", 
      name: "מטע זיתים עתיק", 
      brand: "טמבור", 
      book: "המניפה – טמבור", 
      hex: "#8D9B85", 
      family: "מרווה וטבע", 
      surface: "קירות פנים", 
      finish: "מט משי", 
      page: "עמ׳ 92",
      base: "בסיס פסטל (BP)",
      pastesFormula: "Y: 8.2ml (13.3ש׳) | G: 6.4ml (10.4ש׳) | B: 5.1ml (8.3ש׳)",
      totalPastesMl: 19.7,
      shakerTime: 240,
      machineNote: "ערבול כפול 240 שניות. פיגמנטציה עשירה לקירות פנים."
    },
    { 
      code: "W204", 
      name: "אגוז אמריקאי עמוק", 
      brand: "טמבור", 
      book: "ורניט לכות", 
      hex: "#5E402B", 
      family: "עץ טבעי ולכות", 
      surface: "עץ ולכות", 
      finish: "מט משי", 
      page: "עמ׳ 12",
      base: "בסיס לכה שקופה (BC)",
      pastesFormula: "U: 16.0ml | Y: 8.5ml | R: 6.5ml",
      totalPastesMl: 31.0,
      shakerTime: 120,
      machineNote: "ערבול עדין ללא בועות אוויר. מתאים לורניט עץ פנים וחוץ."
    },
    { 
      code: "M01", 
      name: "לבן מתכת מבריק", 
      brand: "טמבור", 
      book: "סופרלק מתכת", 
      hex: "#F0F3F5", 
      family: "מתכת מונע חלודה", 
      surface: "מתכת DTM", 
      finish: "מבריק", 
      page: "עמ׳ 4",
      base: "בסיס לבן סופרלק (BW)",
      pastesFormula: "B: 0.2ml (שובר ברק בלבד)",
      totalPastesMl: 0.2,
      shakerTime: 120,
      machineNote: "הזרקת מיקרו-שוט לשבירת בוהק מתכת. ערבול 120 שניות."
    },

    // נירלט
    { 
      code: "IS 0010", 
      name: "שמנת קטיפתית", 
      brand: "נירלט", 
      book: "Natural Whites", 
      hex: "#F4EFE6", 
      family: "לבן ופנינה", 
      surface: "קירות פנים", 
      finish: "מט מהודר", 
      page: "עמ׳ 10",
      base: "בסיס לבן (BW)",
      pastesFormula: "Y: 2.1ml (3.4ש׳) | R: 0.4ml (0.6ש׳)",
      totalPastesMl: 2.5,
      shakerTime: 120,
      machineNote: "מתאים לנירוקריל אקסטרה בסיס לבן. ערבול 120 שניות."
    },
    { 
      code: "IS 0155", 
      name: "טרוורטין מדברי", 
      brand: "נירלט", 
      book: "אבני ארץ", 
      hex: "#D9CDBF", 
      family: "אבן וחול", 
      surface: "קירות פנים", 
      finish: "מט משי", 
      page: "עמ׳ 24",
      base: "בסיס לבן (BW)",
      pastesFormula: "Y: 4.8ml (7.8ש׳) | U: 2.4ml (3.9ש׳) | B: 0.8ml | R: 0.6ml",
      totalPastesMl: 8.6,
      shakerTime: 180,
      machineNote: "ערבול 180 שניות במערבל צנטריפוגלי נירלט. גוון אבן טבעי מוביל."
    },
    { 
      code: "IS 0412", 
      name: "אקליפטוס גלילי", 
      brand: "נירלט", 
      book: "צבעי הטבע", 
      hex: "#A7B7A3", 
      family: "מרווה וטבע", 
      surface: "קירות פנים", 
      finish: "מט משי", 
      page: "עמ׳ 67",
      base: "בסיס פסטל (BP)",
      pastesFormula: "G: 5.4ml (8.8ש׳) | Y: 4.1ml (6.7ש׳) | B: 2.6ml (4.2ש׳)",
      totalPastesMl: 12.1,
      shakerTime: 180,
      machineNote: "בסיס פסטל נירלט אקו-מקס. ערבול 180 שניות."
    },
    { 
      code: "IS 0640", 
      name: "תכלת ים תיכוני", 
      brand: "נירלט", 
      book: "נירלט ים תיכון", 
      hex: "#96B9CC", 
      family: "כחול Saban", 
      surface: "קירות פנים", 
      finish: "מט משי", 
      page: "עמ׳ 72",
      base: "בסיס פסטל (BP)",
      pastesFormula: "C: 6.8ml (11.0ש׳) | B: 1.8ml (2.9ש׳) | G: 0.7ml",
      totalPastesMl: 9.3,
      shakerTime: 180,
      machineNote: "ערבול 180 שניות לקבלת תכלת שמיים אחיד ונקי."
    },

    // ח.סבן בלעדי ו-RAL
    { 
      code: "0001", 
      name: "לבן שלג מוחלט", 
      brand: "ח.סבן", 
      book: "סבן בסיס מושלם", 
      hex: "#FFFFFF", 
      family: "לבן ופנינה", 
      surface: "תקרה וגבס", 
      finish: "מט משי", 
      page: "עמ׳ 1",
      base: "בסיס לבן טהור (BW)",
      pastesFormula: "ללא צורך בהזרקת משחות (מוכן ליישום)",
      totalPastesMl: 0.0,
      shakerTime: 60,
      machineNote: "לבן שלג טהור במרקם משי. אין צורך בהזרקה, ערבול קצר בלבד."
    },
    { 
      code: "SB-0B3B", 
      name: "כחול ח.סבן מורשת", 
      brand: "ח.סבן", 
      book: "קולקציית 1994", 
      hex: "#0B3B60", 
      family: "כחול Saban", 
      surface: "קירות פנים", 
      finish: "מט משי", 
      page: "עמ׳ 3",
      base: "בסיס עמוק/שקוף (BD/BC)",
      pastesFormula: "C: 18.5ml (30ש׳) | B: 14.2ml (23.1ש׳) | M: 5.8ml | W: 3.5ml",
      totalPastesMl: 42.0,
      shakerTime: 300,
      machineNote: "בסיס אקסטרה דיפ סבן. הזרקה מסיבית + ערבול 300 שניות."
    },
    { 
      code: "RAL 7016", 
      name: "אנתרציט פחם", 
      brand: "ח.סבן", 
      book: "Accent Wall", 
      hex: "#373F47", 
      family: "אפורים מודרניים", 
      surface: "קירות פנים", 
      finish: "מט משי", 
      page: "עמ׳ 16",
      base: "בסיס עמוק (BD)",
      pastesFormula: "B: 28.0ml (45.5ש׳) | C: 4.5ml (7.3ש׳) | Y: 3.2ml (5.2ש׳)",
      totalPastesMl: 35.7,
      shakerTime: 240,
      machineNote: "RAL 7016 אנתרציט לקירות כוח. ערבול 240 שניות."
    },

    // יעקבי
    { 
      code: "W101", 
      name: "אלון אירופאי טבעי", 
      brand: "יעקבי", 
      book: "בלנשון ולכות", 
      hex: "#B88656", 
      family: "עץ טבעי ולכות", 
      surface: "עץ ולכות", 
      finish: "חצי מבריק", 
      page: "עמ׳ 8",
      base: "בסיס לכה שקופה (BC)",
      pastesFormula: "Y: 14.0ml | U: 5.0ml | R: 2.0ml",
      totalPastesMl: 21.0,
      shakerTime: 120,
      machineNote: "ערבול עדין ללא בועות ללכה בלנשון."
    },
    { 
      code: "DTM-90", 
      name: "גרפיט מרוקע מגן", 
      brand: "יעקבי", 
      book: "המרייט ישיר לחלודה", 
      hex: "#4A4E51", 
      family: "מתכת מונע חלודה", 
      surface: "מתכת DTM", 
      finish: "מבריק", 
      page: "עמ׳ 2",
      base: "בסיס המרייט ישיר לחלודה (BD)",
      pastesFormula: "B: 12.0ml (19.5ש׳) | C: 3.0ml (4.9ש׳)",
      totalPastesMl: 15.0,
      shakerTime: 180,
      machineNote: "מתכת DTM מרוקע. ערבול 180 שניות במערבל ייעודי לצבעי מתכת."
    }
  ];
}

/**
 * הזנת מאגר עשיר של 16 גוונים ממניפות טמבור, נירלט, יעקבי וח.סבן
 * כולל צביעת תאי הדוגמית ב-HEX ונוסחאות משחות גוונים!
 */
function seedColorCatalog() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("מניפת גוונים - קטלוג ארצי");
  if (!sheet) return;

  var colors = getRichShadesData();

  // ניקוי נתונים ישנים משורה 3 ומטה
  var lastRow = sheet.getLastRow();
  if (lastRow >= 3) {
    sheet.getRange(3, 1, lastRow - 2, 14).clearContent().clearFormat();
  }

  // הזנת השורות ועיצוב תאי הצבע
  for (var i = 0; i < colors.length; i++) {
    var row = i + 3;
    var c = colors[i];
    
    sheet.getRange(row, 1).setValue("■").setBackground(c.hex).setFontColor(c.hex).setHorizontalAlignment("center");
    sheet.getRange(row, 2).setValue(c.code).setFontWeight("bold").setHorizontalAlignment("center");
    sheet.getRange(row, 3).setValue(c.name);
    sheet.getRange(row, 4).setValue(c.brand).setHorizontalAlignment("center");
    sheet.getRange(row, 5).setValue(c.book);
    sheet.getRange(row, 6).setValue(c.hex).setFontFamily("monospace").setHorizontalAlignment("center");
    sheet.getRange(row, 7).setValue(c.family).setHorizontalAlignment("center");
    sheet.getRange(row, 8).setValue(c.surface).setHorizontalAlignment("center");
    sheet.getRange(row, 9).setValue(c.finish).setHorizontalAlignment("center");
    sheet.getRange(row, 10).setValue(c.page).setHorizontalAlignment("center");
    sheet.getRange(row, 11).setValue(c.base).setHorizontalAlignment("center").setFontWeight("bold");
    sheet.getRange(row, 12).setValue(c.pastesFormula).setFontFamily("monospace");
    sheet.getRange(row, 13).setValue(c.totalPastesMl).setHorizontalAlignment("center");
    sheet.getRange(row, 14).setValue(c.machineNote);

    // צבע רקע זברה עדין
    if (i % 2 === 1) {
      sheet.getRange(row, 2, 1, 13).setBackground(SABAN_BG_LIGHT);
    }
  }

  // התאמת רוחב עמודות אוטומטי
  for (var col = 1; col <= 14; col++) {
    sheet.autoResizeColumn(col);
  }
  sheet.setColumnWidth(1, 60); // דוגמית
  sheet.setColumnWidth(12, 280); // נוסחת משחות
}

/**
 * הזרקת משחות גוונים ממוחשבות לקטלוג וללוג המכונה
 */
function injectTintPastesToCatalog() {
  seedColorCatalog();
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPastes = ss.getSheetByName("נוסחאות גיוון ומשחות - מחלקת צבע");
  if (sheetPastes) {
    var colors = getRichShadesData();
    var nowIso = Utilities.formatDate(new Date(), "Asia/Jerusalem", "dd/MM/yyyy HH:mm");
    
    // ניקוי והזנה
    var lastRow = sheetPastes.getLastRow();
    if (lastRow >= 3) {
      sheetPastes.getRange(3, 1, lastRow - 2, 12).clearContent().clearFormat();
    }

    colors.forEach(function(c, i) {
      var row = i + 3;
      var shots = Math.round((c.totalPastesMl / 0.616) * 10) / 10;
      sheetPastes.getRange(row, 1).setValue("■").setBackground(c.hex).setFontColor(c.hex).setHorizontalAlignment("center");
      sheetPastes.getRange(row, 2).setValue(c.code).setFontWeight("bold").setHorizontalAlignment("center");
      sheetPastes.getRange(row, 3).setValue(c.name);
      sheetPastes.getRange(row, 4).setValue(c.brand).setHorizontalAlignment("center");
      sheetPastes.getRange(row, 5).setValue(c.base).setFontWeight("bold").setHorizontalAlignment("center");
      sheetPastes.getRange(row, 6).setValue(c.pastesFormula).setFontFamily("monospace");
      sheetPastes.getRange(row, 7).setValue(c.totalPastesMl).setHorizontalAlignment("center");
      sheetPastes.getRange(row, 8).setValue(shots).setHorizontalAlignment("center");
      sheetPastes.getRange(row, 9).setValue(c.shakerTime).setHorizontalAlignment("center");
      sheetPastes.getRange(row, 10).setValue(c.machineNote);
      sheetPastes.getRange(row, 11).setValue("כן (סונכרן מנועה)").setHorizontalAlignment("center");
      sheetPastes.getRange(row, 12).setValue(nowIso).setHorizontalAlignment("center");
    });
  }

  SpreadsheetApp.getUi().alert(
    "הזרקת משחות גוונים הושלמה בהצלחה!\n\n" +
    "כל 16 הגוונים במניפת ח.סבן עודכנו עם בסיסי גיוון (BW, BP, BD, BC), " +
    "נוסחאות הזרקת משחות מ״ל ושוטים מדויקות, וזמני ערבול במערבל גירוסקופי."
  );
}

/**
 * עיצוב ויישור רוחב עמודות לכל הטאבים
 */
function formatAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  sheets.forEach(function(s) {
    for (var c = 1; c <= s.getLastColumn(); c++) {
      s.autoResizeColumn(c);
    }
  });
}

/**
 * ==============================================================================
 * Webhook Endpoint ראשי: קליטת הזמנות, הזרקת משחות גוונים, וסלים מאפליקציית נועה
 * ==============================================================================
 */
function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. הזרקת משחות גוונים וסנכרון מסיבי לקטלוג
    if (data.action === "inject_pastes" || data.shadesWithPastes || (data.action === "sync_catalog" && data.shades)) {
      var incomingShades = data.shades || data.shadesWithPastes || [];
      var sheetCatalog = ss.getSheetByName("מניפת גוונים - קטלוג ארצי");
      var sheetPastes = ss.getSheetByName("נוסחאות גיוון ומשחות - מחלקת צבע");
      var nowIso = Utilities.formatDate(new Date(), "Asia/Jerusalem", "dd/MM/yyyy HH:mm");

      if (sheetCatalog && incomingShades.length > 0) {
        incomingShades.forEach(function(s, idx) {
          var targetRow = -1;
          var catalogData = sheetCatalog.getDataRange().getValues();
          var sCode = String(s.code || "").trim();

          for (var r = 2; r < catalogData.length; r++) {
            if (String(catalogData[r][1]).trim() === sCode) {
              targetRow = r + 1;
              break;
            }
          }

          if (targetRow === -1) {
            targetRow = sheetCatalog.getLastRow() + 1;
          }

          var hex = s.hex || "#FFFFFF";
          if (hex.indexOf("#") !== 0) hex = "#" + hex;
          
          sheetCatalog.getRange(targetRow, 1).setValue("■").setBackground(hex).setFontColor(hex).setHorizontalAlignment("center");
          sheetCatalog.getRange(targetRow, 2).setValue(s.code).setFontWeight("bold").setHorizontalAlignment("center");
          sheetCatalog.getRange(targetRow, 3).setValue(s.name || s.code);
          sheetCatalog.getRange(targetRow, 4).setValue(s.manufacturer || "טמבור").setHorizontalAlignment("center");
          sheetCatalog.getRange(targetRow, 5).setValue(s.collectionName || "המניפה");
          sheetCatalog.getRange(targetRow, 6).setValue(hex).setFontFamily("monospace").setHorizontalAlignment("center");
          sheetCatalog.getRange(targetRow, 7).setValue(s.family || "לבן ופנינה").setHorizontalAlignment("center");
          sheetCatalog.getRange(targetRow, 8).setValue(s.surfaceType || "קירות פנים").setHorizontalAlignment("center");
          sheetCatalog.getRange(targetRow, 9).setValue(s.finishType || "מט משי").setHorizontalAlignment("center");
          sheetCatalog.getRange(targetRow, 10).setValue(s.fandeckPage || "").setHorizontalAlignment("center");
          sheetCatalog.getRange(targetRow, 11).setValue(s.base || "בסיס לבן (BW)").setHorizontalAlignment("center").setFontWeight("bold");
          sheetCatalog.getRange(targetRow, 12).setValue(s.pastesFormula || s.formulaSummary || "").setFontFamily("monospace");
          sheetCatalog.getRange(targetRow, 13).setValue(s.totalPastesMl || 0).setHorizontalAlignment("center");
          sheetCatalog.getRange(targetRow, 14).setValue(s.machineNote || "ערבול 180 שניות");
        });
      }

      if (sheetPastes && incomingShades.length > 0) {
        incomingShades.forEach(function(s) {
          var pRow = sheetPastes.getLastRow() + 1;
          var hex = s.hex || "#FFFFFF";
          if (hex.indexOf("#") !== 0) hex = "#" + hex;
          var totalMl = s.totalPastesMl || 0;
          var shots = Math.round((totalMl / 0.616) * 10) / 10;
          sheetPastes.getRange(pRow, 1).setValue("■").setBackground(hex).setFontColor(hex);
          sheetPastes.getRange(pRow, 2).setValue(s.code).setFontWeight("bold");
          sheetPastes.getRange(pRow, 3).setValue(s.name);
          sheetPastes.getRange(pRow, 4).setValue(s.manufacturer || "טמבור");
          sheetPastes.getRange(pRow, 5).setValue(s.base || "בסיס לבן (BW)");
          sheetPastes.getRange(pRow, 6).setValue(s.pastesFormula || s.formulaSummary || "");
          sheetPastes.getRange(pRow, 7).setValue(totalMl);
          sheetPastes.getRange(pRow, 8).setValue(shots);
          sheetPastes.getRange(pRow, 9).setValue(s.shakerTime || 180);
          sheetPastes.getRange(pRow, 10).setValue(s.machineNote || "ערבול במערבל גירוסקופי");
          sheetPastes.getRange(pRow, 11).setValue("כן (נועה PWA)");
          sheetPastes.getRange(pRow, 12).setValue(nowIso);
        });
      }

      return ContentService
        .createTextOutput(JSON.stringify({ 
          status: "success", 
          message: "משחות הגוונים הוזרקו וסונכרנו לגיליון בהצלחה!", 
          updatedCount: incomingShades.length 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. קליטת הזמנות
    if (data.orders && Array.isArray(data.orders)) {
      data.orders.forEach(function(order) {
        insertOrderToBranchSheet(ss, order);
      });
    } else if (data.order) {
      insertOrderToBranchSheet(ss, data.order);
    }

    // 3. קליטת גוונים שנבחרו
    if (data.shades && Array.isArray(data.shades)) {
      var sheetShades = ss.getSheetByName("גוונים שנבחרו בקנבס");
      if (sheetShades) {
        data.shades.forEach(function(s) {
          var row = sheetShades.getLastRow() + 1;
          sheetShades.getRange(row, 1).setValue("■").setBackground(s.hex || "#FFFFFF").setFontColor(s.hex || "#FFFFFF");
          sheetShades.getRange(row, 2).setValue(s.shadeCode).setFontWeight("bold");
          sheetShades.getRange(row, 3).setValue(s.shadeName);
          sheetShades.getRange(row, 4).setValue(s.manufacturer);
          sheetShades.getRange(row, 5).setValue(s.branch);
          sheetShades.getRange(row, 6).setValue(s.source || "קנבס");
          sheetShades.getRange(row, 7).setValue(s.timestamp || new Date().toISOString());
        });
      }
    }

    // 4. קליטת סלים מומלצים
    if (data.baskets && Array.isArray(data.baskets)) {
      var sheetBaskets = ss.getSheetByName("סלים מומלצים - נועה Ai");
      if (sheetBaskets) {
        data.baskets.forEach(function(b) {
          var row = sheetBaskets.getLastRow() + 1;
          sheetBaskets.appendRow([
            b.id,
            b.timestamp || new Date().toISOString(),
            b.branch,
            b.category,
            b.itemsCount,
            b.totalEstimate,
            b.upsellIncluded ? "כן (בונדרול+טסה)" : "לא",
            b.itemsList
          ]);
        });
      }
    }

    // 5. הוספת גוון חדש בודד למניפה ("מניפת גוונים - קטלוג ארצי")
    if (data.newShade || data.action === "addShade") {
      var s = data.newShade || data.shade;
      var sheetCatalog = ss.getSheetByName("מניפת גוונים - קטלוג ארצי");
      if (sheetCatalog && s) {
        var row = sheetCatalog.getLastRow() + 1;
        var hex = s.hex || "#FFFFFF";
        if (hex.indexOf("#") !== 0) hex = "#" + hex;
        sheetCatalog.getRange(row, 1).setValue("■").setBackground(hex).setFontColor(hex).setHorizontalAlignment("center");
        sheetCatalog.getRange(row, 2).setValue(s.code).setFontWeight("bold").setHorizontalAlignment("center");
        sheetCatalog.getRange(row, 3).setValue(s.name);
        sheetCatalog.getRange(row, 4).setValue(s.manufacturer || "טמבור").setHorizontalAlignment("center");
        sheetCatalog.getRange(row, 5).setValue(s.collectionName || "המניפה");
        sheetCatalog.getRange(row, 6).setValue(hex).setFontFamily("monospace").setHorizontalAlignment("center");
        sheetCatalog.getRange(row, 7).setValue(s.family || "לבן ופנינה").setHorizontalAlignment("center");
        sheetCatalog.getRange(row, 8).setValue(s.surfaceType || "קירות פנים").setHorizontalAlignment("center");
        sheetCatalog.getRange(row, 9).setValue(s.finishType || "מט משי").setHorizontalAlignment("center");
        sheetCatalog.getRange(row, 10).setValue(s.fandeckPage || "").setHorizontalAlignment("center");
        sheetCatalog.getRange(row, 11).setValue(s.base || "בסיס לבן (BW)").setHorizontalAlignment("center");
        sheetCatalog.getRange(row, 12).setValue(s.pastesFormula || s.formulaSummary || "").setFontFamily("monospace");
        sheetCatalog.getRange(row, 13).setValue(s.totalPastesMl || 0).setHorizontalAlignment("center");
        sheetCatalog.getRange(row, 14).setValue(s.machineNote || "ערבול 180 שניות");
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "הנתונים נקלטו ונותבו לסניף המתאים בהצלחה!" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ניתוב הזמנה לטאב הסניף המתאים (תלמיד 6 או החרש אסף)
 */
function insertOrderToBranchSheet(ss, order) {
  var targetSheetName = (order.branch && order.branch.indexOf("החרש") > -1)
    ? "הזמנות - סניף החרש אסף"
    : "הזמנות - סניף תלמיד 6";

  var sheet = ss.getSheetByName(targetSheetName);
  if (!sheet) return;

  var itemsDetail = "";
  if (order.items && Array.isArray(order.items)) {
    itemsDetail = order.items.map(function(item) {
      var name = item.product ? item.product.name : (item.name || "פריט");
      var qty = item.quantity || 1;
      return name + " (" + qty + " יח׳)";
    }).join(", ");
  }

  var row = sheet.getLastRow() + 1;
  sheet.appendRow([
    order.orderNumber || ("SB-" + Math.floor(1000 + Math.random() * 9000)),
    order.createdAt || Utilities.formatDate(new Date(), "Asia/Jerusalem", "dd/MM/yyyy HH:mm"),
    order.customerName || "לקוח ח.סבן",
    order.customerPhone || "",
    order.shadeSummary || "לפי מפרט",
    itemsDetail,
    order.totalAmount || 0,
    order.status || "התקבלה",
    "תוך 30 דקות",
    order.notes || "",
    "כן (נועה PWA)"
  ]);

  sheet.getRange(row, 1).setFontWeight("bold").setFontColor(SABAN_NAVY);
  sheet.getRange(row, 7).setFontWeight("bold").setFontFamily("monospace");
}

/**
 * Endpoint ב-GET: ייצוא קטלוג המניפות המלא כולל משחות גיוון ב-JSON ישירות מ-Google Sheets!
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var requestedTab = (e && e.parameter && (e.parameter.tab || e.parameter.sheet || e.parameter.fandeck)) ? String(e.parameter.tab || e.parameter.sheet || e.parameter.fandeck).trim() : null;

  var sheetsToRead = [];
  if (requestedTab) {
    var specificSheet = ss.getSheetByName(requestedTab);
    if (specificSheet) {
      sheetsToRead.push(specificSheet);
    }
  }

  // If no specific sheet or not found, read main catalog and RAL fandeck sheet
  if (sheetsToRead.length === 0) {
    var mainCatalog = ss.getSheetByName("מניפת גוונים - קטלוג ארצי");
    if (mainCatalog) sheetsToRead.push(mainCatalog);
    var ralSheet = ss.getSheetByName("מניפת RAL");
    if (ralSheet) sheetsToRead.push(ralSheet);
  }
  
  if (sheetsToRead.length === 0) {
    return ContentService.createTextOutput(JSON.stringify({ error: "הקטלוג טרם הוקם" })).setMimeType(ContentService.MimeType.JSON);
  }

  var shades = [];
  var seenCodes = {};

  sheetsToRead.forEach(function(sheet) {
    var data = sheet.getDataRange().getValues();
    var isRalTab = (sheet.getName() === "מניפת RAL");

    // שורות נתונים מתחילות משורה 3
    for (var i = 2; i < data.length; i++) {
      var r = data[i];
      if (r[1] !== "" && r[1] !== null && r[1] !== undefined) {
        var rawCode = String(r[1]).trim();
        if (/^\d{3}$/.test(rawCode)) {
          rawCode = "0" + rawCode;
        } else if (/^\d{1}$/.test(rawCode)) {
          rawCode = "000" + rawCode;
        }

        var codeKey = rawCode.toUpperCase();
        if (seenCodes[codeKey]) continue;
        seenCodes[codeKey] = true;

        var hexCode = String(r[5] || "#FFFFFF").trim();
        if (hexCode.indexOf("#") !== 0) {
          hexCode = "#" + hexCode;
        }

        var baseValue = String(r[10] || "").trim();
        var formulaValue = String(r[11] || "").trim();
        var totalMlValue = parseFloat(r[12]) || 0;
        var noteValue = String(r[13] || "").trim();

        shades.push({
          code: rawCode,
          name: String(r[2] || rawCode).trim(),
          manufacturer: String(r[3] || (isRalTab ? "ח.סבן" : "טמבור")).trim(),
          collectionName: String(r[4] || (isRalTab ? "מניפת RAL" : "המניפה")).trim(),
          hex: hexCode,
          family: String(r[6] || "לבן ופנינה").trim(),
          surfaceType: String(r[7] || "קירות פנים").trim(),
          finishType: String(r[8] || "מט משי").trim(),
          fandeckPage: String(r[9] || "").trim(),
          base: baseValue || (hexCode === "#0B3B60" ? "בסיס עמוק/שקוף (BD)" : "בסיס לבן (BW)"),
          pastesFormula: formulaValue,
          totalPastesMl: totalMlValue,
          machineNote: noteValue
        });
      }
    }
  });

  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: "success", 
      count: shades.length, 
      shades: shades,
      fandeckTabs: ["מניפת גוונים - קטלוג ארצי", "מניפת RAL"]
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * תיבת דיאלוג עם הנחיות פריסת ה-Webhook
 */
function showWebhookInstructions() {
  var ui = SpreadsheetApp.getUi();
  var msg = 
    "כיצד לחבר את הגיליון לאפליקציית נועה ב-3 שלבים:\n\n" +
    "1. לחץ למעלה על כפתור 'Deploy' (פריסה) -> 'New deployment' (פריסה חדשה).\n" +
    "2. בחר בסוג 'Web app' (אפליקציית אינטרנט):\n" +
    "   - Execute as: 'Me' (אני)\n" +
    "   - Who has access: 'Anyone' (כל אחד)\n" +
    "3. לחץ 'Deploy' והעתק את כתובת ה-URL שנוצרה.\n\n" +
    "4. הדבק את הכתובת באפליקציית נועה בלשונית: 'ניהול ו-Sheets' -> 'הגדרות Webhook'.\n\n" +
    "מרגע זה, כל הזמנה וכל גוון נרשמים ומנותבים לסניף המתאים בזמן אמת!";
  
  ui.alert("הנחיות חיבור Webhook לח.סבן", msg, ui.ButtonSet.OK);
}
