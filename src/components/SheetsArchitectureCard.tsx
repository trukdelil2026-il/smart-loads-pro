import * as React from "react";
import {
  FileSpreadsheet,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Database,
  ExternalLink,
} from "lucide-react";

export function SheetsArchitectureCard() {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-5">
      {/* Chapter 6 Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Database className="size-5" />
            </span>
            <h2 className="text-xl font-black text-foreground">
              פרק 6: ארכיטקטורת נתונים, גיליונות ומדיניות אינטגרציה
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            מיפוי הגיליונות הפעילים והמאושרים · אכיפת חוק הברזל על השבתת noaBrain כארכיון היסטורי
            בלבד
          </p>
        </div>

        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
          ארכיטקטורה מאומתת ✓
        </span>
      </div>

      {/* Strict Prohibition Banner - חוק ברזל */}
      <div className="rounded-2xl border-2 border-rose-500/40 bg-rose-500/10 p-4 space-y-2 shadow-xs">
        <div className="flex items-center gap-2.5 text-rose-800 dark:text-rose-300 font-black text-sm">
          <AlertOctagon className="size-5 text-rose-600 shrink-0" />
          <span>חוק ברזל מערכתי (Strict Prohibition)</span>
        </div>
        <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
          גיליון <strong>noaBrain</strong> מושבת ומוגדר כארכיון היסטורי בלבד. חל איסור מוחלט על
          הזרקת נתונים, כתיבה או ביצוע שינויים בו. כל הפעולות מבוצעות אך ורק בגיליונות הפעילים
          והמיועדים לכך.
        </p>
      </div>

      {/* Active & Approved Sheets Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Sheet 1 */}
        <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-emerald-600 text-white">
                <FileSpreadsheet className="size-4" />
              </span>
              <div>
                <h3 className="font-black text-sm text-foreground">
                  מערכת מאוחדת - הזמנות, תעודות משלוח והצלבה
                </h3>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  גיליון ה-Core המבצעי הרשמי
                </span>
              </div>
            </div>
            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
              פעיל
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            הגיליון המרכזי המנהל את כל רשומות ההזמנות, התעודות הסרוקות, ההצלבות ומעקב הדלק.
          </p>

          <div className="border-t border-border/50 pt-2.5 space-y-1.5 text-xs">
            <span className="font-bold text-foreground block">לשוניות מאושרות:</span>
            <div className="flex flex-wrap gap-1.5">
              {["הזמנות", "תעודות_משלוח", "הצלבה_ובקרה", "מעקב_דלק", "לוג תעודות סרוקות"].map(
                (tab, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-background px-2.5 py-1 text-[11px] font-bold text-foreground border border-border"
                  >
                    📄 {tab}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Core Sheet 2 */}
        <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-blue-600 text-white">
                <FileSpreadsheet className="size-4" />
              </span>
              <div>
                <h3 className="font-black text-sm text-foreground">נועה Ai</h3>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                  גיליון הסידור היומי ומעקב סבבים
                </span>
              </div>
            </div>
            <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-black text-blue-700 dark:text-blue-300">
              פעיל
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            גיליון ניהול הסידור היומי, שיבוצי משאיות חכמת ועלי, מעקב ציר תנועה וסבבי חלוקה.
          </p>

          <div className="border-t border-border/50 pt-2.5 space-y-1.5 text-xs">
            <span className="font-bold text-foreground block">לשוניות מאושרות:</span>
            <div className="flex flex-wrap gap-1.5">
              {["סידור_יומי_חכמת", "סידור_יומי_עלי", "מעקב_סבבים", "סטטיסטיקת_קווים"].map(
                (tab, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-background px-2.5 py-1 text-[11px] font-bold text-foreground border border-border"
                  >
                    🚛 {tab}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
