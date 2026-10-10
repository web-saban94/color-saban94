/**
 * ==============================================================================
 * ח.סבן חומרי בניין (1994) בע״מ – מודול נועה צבע וגוונים
 * סקריפט Google Apps Script מלא (Code.js)
 * ==============================================================================
 * תפקיד הסקריפט:
 * 1. יצירה ועיצוב אוטומטי של כל הטאבים (גיליונות):
 *    - טאב "מניפת גוונים - קטלוג ארצי" (טמבור, נירלט, יעקבי, סבן, RAL, NCS) עם תאי צבע HEX צבועים
 *    - טאב "הזמנות - סניף תלמיד 6" (סניף הדגל ומחלקת גוונים)
 *    - טאב "הזמנות - סניף החרש אסף" (סניף קבלנים וחומרי גמר)
 *    - טאב "גוונים שנבחרו בקנבס" (היסטוריית בדיקות והדמיות)
 *    - טאב "סלים מומלצים - נועה Ai" (ריכוז סלי מוצרים ובדיקת Upsell)
 * 2. קבלת נתונים חיים (Webhook - doPost) מהאפליקציה וניתוב אוטומטי לסניף הרלוונטי
 * 3. ייצוא קטלוג הגוונים המלא ב-JSON (doGet) ישירות לאפליקציה
 * 4. תפריט ניהול ייעודי ב-Google Sheets: "ח.סבן - ניהול גוונים"
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
    .addItem("🚀 הקם ועצב את כל הטאבים מחדש (התקנה ראשונית)", "setupAllSabanSheets")
    .addItem("🎨 הוסף גווני דוגמה למניפה (טמבור, נירלט, יעקבי)", "seedColorCatalog")
    .addItem("📊 רענן עיצוב ורוחב עמודות לכל הטאבים", "formatAllSheets")
    .addSeparator()
    .addItem("ℹ️ הנחיות חיבור Webhook לאפליקציה", "showWebhookInstructions")
    .addToUi();
}

/**
 * פונקציה ראשית: יוצרת ומעצבת את כל 5 הטאבים במבנה UX/UI מקצועי מלא בעברית
 */
function setupAllSabanSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. יצירת הטאבים
  var sheetCatalog = getOrCreateSheet(ss, "מניפת גוונים - קטלוג ארצי", 1);
  var sheetTalmid = getOrCreateSheet(ss, "הזמנות - סניף תלמיד 6", 2);
  var sheetHarash = getOrCreateSheet(ss, "הזמנות - סניף החרש אסף", 3);
  var sheetShadesLog = getOrCreateSheet(ss, "גוונים שנבחרו בקנבס", 4);
  var sheetBaskets = getOrCreateSheet(ss, "סלים מומלצים - נועה Ai", 5);

  // 2. הגדרת כיוון מימין לשמאל (RTL) לכל הטאבים
  var allSheets = [sheetCatalog, sheetTalmid, sheetHarash, sheetShadesLog, sheetBaskets];
  allSheets.forEach(function(s) {
    s.setRightToLeft(true);
  });

  // 3. בניית כותרות ועיצוב לכל טאב
  buildCatalogSheet(sheetCatalog);
  buildBranchOrdersSheet(sheetTalmid, "סניף תלמיד 6 (סניף הדגל ומחלקת גוונים ממוחשבת)");
  buildBranchOrdersSheet(sheetHarash, "סניף החרש אסף (סניף קבלנים וחומרי גמר ושיקום)");
  buildShadesLogSheet(sheetShadesLog);
  buildBasketsSheet(sheetBaskets);

  // 4. הזנת קטלוג גוונים עשיר התחלתי
  seedColorCatalog();

  SpreadsheetApp.getUi().alert(
    "ההתקנה הושלמה בהצלחה!\n\n" +
    "כל הטאבים הוקמו, עוצבו ומוכנים לקליטת הזמנות וסנכרון מול אפליקציית נועה.\n" +
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
 * בניית טאב 1: מניפת גוונים - קטלוג ארצי
 */
function buildCatalogSheet(sheet) {
  sheet.clear();
  
  // באנר ראשי מעוצב
  sheet.getRange("A1:J1").merge();
  sheet.getRange("A1").setValue("🎨 ח.סבן חומרי בניין (1994) בע״מ – קטלוג מניפות ארצי (טמבור, נירלט, יעקבי, RAL)");
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
    "עמוד במניפה"
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

  // הקפאת שורות כותרת
  sheet.setFrozenRows(2);
}

/**
 * בניית טאב 2 ו-3: הזמנות לסניף (תלמיד 6 או החרש אסף)
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
 * בניית טאב 4: גוונים שנבחרו בקנבס ובצ׳אט
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
 * בניית טאב 5: סלים מומלצים - נועה Ai
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
 * הזנת מאגר עשיר של גוונים ממניפות טמבור, נירלט, יעקבי וח.סבן
 * כולל צביעת תאי הדוגמית ב-HEX האמיתי!
 */
function seedColorCatalog() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("מניפת גוונים - קטלוג ארצי");
  if (!sheet) return;

  var colors = [
    // טמבור – המניפה
    { code: "WW2202", name: "לראות צלול", brand: "טמבור", book: "המניפה – טמבור 2026", hex: "#D7DDD4", family: "לבן ופנינה", surface: "קירות פנים", finish: "מט משי", page: "עמ׳ 42" },
    { code: "WW2010", name: "כותנה מנחמת", brand: "טמבור", book: "המניפה – טמבור", hex: "#EFECE6", family: "לבן ופנינה", surface: "קירות פנים", finish: "מט משי", page: "עמ׳ 38" },
    { code: "0281", name: "חול ים זהוב", brand: "טמבור", book: "המניפה – טמבור", hex: "#E2D5C3", family: "אבן וחול", surface: "קירות פנים", finish: "מט משי", page: "עמ׳ 55" },
    { code: "0543", name: "בטון מעודן", brand: "טמבור", book: "המניפה – אורבני", hex: "#C8CCCB", family: "אפורים מודרניים", surface: "קירות פנים", finish: "מט מהודר", page: "עמ׳ 84" },
    { code: "WW1950", name: "מטע זיתים עתיק", brand: "טמבור", book: "המניפה – טמבור", hex: "#8D9B85", family: "מרווה וטבע", surface: "קירות פנים", finish: "מט משי", page: "עמ׳ 92" },
    { code: "W204", name: "אגוז אמריקאי עמוק", brand: "טמבור", book: "ורניט לכות", hex: "#5E402B", family: "עץ טבעי ולכות", surface: "עץ ולכות", finish: "מט משי", page: "עמ׳ 12" },
    { code: "M01", name: "לבן מתכת מבריק", brand: "טמבור", book: "סופרלק מתכת", hex: "#F0F3F5", family: "מתכת מונע חלודה", surface: "מתכת DTM", finish: "מבריק", page: "עמ׳ 4" },

    // נירלט
    { code: "IS 0010", name: "שמנת קטיפתית", brand: "נירלט", book: "Natural Whites", hex: "#F4EFE6", family: "לבן ופנינה", surface: "קירות פנים", finish: "מט מהודר", page: "עמ׳ 10" },
    { code: "IS 0155", name: "טרוורטין מדברי", brand: "נירלט", book: "אבני ארץ", hex: "#D9CDBF", family: "אבן וחול", surface: "קירות פנים", finish: "מט משי", page: "עמ׳ 24" },
    { code: "IS 0412", name: "אקליפטוס גלילי", brand: "נירלט", book: "צבעי הטבע", hex: "#A7B7A3", family: "מרווה וטבע", surface: "קירות פנים", finish: "מט משי", page: "עמ׳ 67" },
    { code: "IS 0640", name: "תכלת ים תיכוני", brand: "נירלט", book: "נירלט ים תיכון", hex: "#96B9CC", family: "כחול Saban", surface: "קירות פנים", finish: "מט משי", page: "עמ׳ 72" },

    // ח.סבן בלעדי ו-RAL
    { code: "0001", name: "לבן שלג מוחלט", brand: "ח.סבן", book: "סבן בסיס מושלם", hex: "#FFFFFF", family: "לבן ופנינה", surface: "תקרה וגבס", finish: "מט משי", page: "עמ׳ 1" },
    { code: "SB-0B3B", name: "כחול ח.סבן מורשת", brand: "ח.סבן", book: "קולקציית 1994", hex: "#0B3B60", family: "כחול Saban", surface: "קירות פנים", finish: "מט משי", page: "עמ׳ 3" },
    { code: "RAL 7016", name: "אנתרציט פחם", brand: "ח.סבן", book: "Accent Wall", hex: "#373F47", family: "אפורים מודרניים", surface: "קירות פנים", finish: "מט משי", page: "עמ׳ 16" },

    // יעקבי
    { code: "W101", name: "אלון אירופאי טבעי", brand: "יעקבי", book: "בלנשון ולכות", hex: "#B88656", family: "עץ טבעי ולכות", surface: "עץ ולכות", finish: "חצי מבריק", page: "עמ׳ 8" },
    { code: "DTM-90", name: "גרפיט מרוקע מגן", brand: "יעקבי", book: "המרייט ישיר לחלודה", hex: "#4A4E51", family: "מתכת מונע חלודה", surface: "מתכת DTM", finish: "מבריק", page: "עמ׳ 2" }
  ];

  // ניקוי נתונים ישנים משורה 3 ומטה
  var lastRow = sheet.getLastRow();
  if (lastRow >= 3) {
    sheet.getRange(3, 1, lastRow - 2, 10).clearContent().clearFormat();
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

    // צבע רקע זברה עדין
    if (i % 2 === 1) {
      sheet.getRange(row, 2, 1, 9).setBackground(SABAN_BG_LIGHT);
    }
  }

  // התאמת רוחב עמודות אוטומטי
  for (var col = 1; col <= 10; col++) {
    sheet.autoResizeColumn(col);
  }
  sheet.setColumnWidth(1, 60); // דוגמית
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
 * Webhook Endpoint ראשי: קליטת הזמנות, גוונים וסלים מאפליקציית נועה
 * ==============================================================================
 */
function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. קליטת הזמנות
    if (data.orders && Array.isArray(data.orders)) {
      data.orders.forEach(function(order) {
        insertOrderToBranchSheet(ss, order);
      });
    } else if (data.order) {
      insertOrderToBranchSheet(ss, data.order);
    }

    // 2. קליטת גוונים שנבחרו
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

    // 3. קליטת סלים מומלצים
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

  // הדגשת שורת ההזמנה החדשה
  sheet.getRange(row, 1).setFontWeight("bold").setFontColor(SABAN_NAVY);
  sheet.getRange(row, 7).setFontWeight("bold").setFontFamily("monospace");
}

/**
 * Endpoint ב-GET: מאפשר לאפליקציה למשוך את קטלוג המניפות המלא ב-JSON ישירות מ-Google Sheets!
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("מניפת גוונים - קטלוג ארצי");
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ error: "הקטלוג טרם הוקם" })).setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getDataRange().getValues();
  var shades = [];

  // שורות נתונים מתחילות משורה 3
  for (var i = 2; i < data.length; i++) {
    var r = data[i];
    if (r[1]) { // אם יש קוד גוון
      shades.push({
        code: r[1],
        name: r[2],
        manufacturer: r[3],
        collectionName: r[4],
        hex: r[5],
        family: r[6],
        surfaceType: r[7],
        finishType: r[8],
        fandeckPage: r[9]
      });
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: "success", count: shades.length, shades: shades }))
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
