import * as React from "react";
import {
  parseContractorOrder,
  COMAX_CATALOG,
  DEPOSITS,
  type NormalizationReport,
} from "@/lib/skuConverter";
import {
  Package,
  Box,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Scale,
  ClipboardCheck,
} from "lucide-react";
import { shekel } from "@/lib/pricing";

interface SkuDepositConverterProps {
  onApplyWeightToQuote?: (weightKg: number) => void;
}

export function SkuDepositConverter({ onApplyWeightToQuote }: SkuDepositConverterProps) {
  const [inputText, setInputText] = React.useState(
    "ראמי בוקר טוב תעמיס לי דחוף: 4 בלות טיט, 2 בלות חול ים, 2 משטחי מלט שחור, 20 שק דבק 603, ו-2 גליל רשת אינטרגלס",
  );
  const [truckKind, setTruckKind] = React.useState<"crane" | "flatbed">("crane");
  const [manualOffload, setManualOffload] = React.useState(false);

  // Field returns state
  const [returnedBales, setReturnedBales] = React.useState<number>(0);
  const [returnedPallets, setReturnedPallets] = React.useState<number>(0);

  const report: NormalizationReport = React.useMemo(() => {
    return parseContractorOrder(inputText, truckKind, manualOffload);
  }, [inputText, truckKind, manualOffload]);

  const returnRefundTotal =
    returnedBales * DEPOSITS.BALE_PRICE + returnedPallets * DEPOSITS.PALLET_PRICE;
  const finalBalanceAfterReturns = Math.max(0, report.grandTotal - returnRefundTotal);

  const samples = [
    {
      title: "הזמנת שלד מנוף",
      text: "4 בלות טיט, 2 בלות חול, 3 משטחי מלט אפור נשר, 25 דבק 603, 2 רשת אינטרגלס",
      truck: "crane" as const,
    },
    {
      title: "הובלת פלטה עלי (פטור מבלות)",
      text: "2 משטחי בלוק 20, 30 שק דבק 109, 1 בלה סומסום (הורדה ידנית עלי)",
      truck: "flatbed" as const,
    },
    {
      title: "הזמנת תפזורת נקייה",
      text: "3 בלות חול ים, 2 בלות עדש, 1 בלת טיע אדמת גן",
      truck: "crane" as const,
    },
  ];

  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Package className="size-5" />
            </span>
            <h2 className="text-xl font-black text-foreground">
              פרק 2: מודול קטלוג, נירמול פריטים ופקדונות
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            פענוח טקסט חופשי מוואטסאפ קבלנים למק״ט קומקס רשמי · חישוב אוטומטי של בלות (60002) ומשטחי
            עץ (60060) · זיכוי החזרות בשטח
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTruckKind("crane")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
              truckKind === "crane"
                ? "bg-brand text-brand-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Truck className="size-3.5" />
            <span>מרצדס מנוף (חכמת)</span>
          </button>
          <button
            onClick={() => setTruckKind("flatbed")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
              truckKind === "flatbed"
                ? "bg-brand text-brand-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Truck className="size-3.5" />
            <span>איסוזו פלטה (עלי)</span>
          </button>
        </div>
      </div>

      {/* WhatsApp input area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>הזנת טקסט וואטסאפ / הזמנת קבלן חופשית לפענוח:</span>
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">דוגמאות מהירות:</span>
            {samples.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(s.text);
                  setTruckKind(s.truck);
                }}
                className="rounded-lg bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground hover:bg-muted/80"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="הדבק כאן הודעת וואטסאפ מקבלן, למשל: 4 בלות טיט, 2 בלות חול, 2 משטחי מלט..."
          className="w-full rounded-2xl border border-input bg-background p-3 text-sm font-medium outline-none focus:ring-2 focus:ring-brand leading-relaxed"
        />

        {truckKind === "flatbed" && (
          <div className="rounded-xl bg-cyan-500/10 p-2.5 text-xs text-cyan-800 dark:text-cyan-300 flex items-center gap-2 border border-cyan-500/20">
            <ShieldCheck className="size-4 shrink-0 text-cyan-600" />
            <span>
              <strong>כלל פטור מפקדונות מופעל:</strong> הובלות פלטה של עלי בהורדה ידנית זוכות לפטור
              אוטומטי מחיוב פקדון בלות (מק״ט 60002).
            </span>
          </div>
        )}
      </div>

      {/* Normalized Comax Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-black text-foreground">
          <span>פריטים מפוענחים לקומקס ({report.items.length} שורות)</span>
          <span className="text-muted-foreground">
            משקל כולל: {report.totalWeightKg.toLocaleString()} ק״ג
          </span>
        </div>

        {report.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            לא זוהו פריטים מוכרים בטקסט. נסה מילים כמו "טיט", "חול", "מלט", "דבק 603", "רשת".
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/70 text-muted-foreground font-black">
                <tr>
                  <th className="p-2.5">מק״ט קומקס</th>
                  <th className="p-2.5">תיאור פריט</th>
                  <th className="p-2.5">כמות</th>
                  <th className="p-2.5">משקל מוערך</th>
                  <th className="p-2.5">אריזה נדרשת</th>
                  <th className="p-2.5">מחיר פריט</th>
                  <th className="p-2.5">סה״כ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {report.items.map((item, i) => (
                  <tr key={i} className="hover:bg-muted/40 transition-colors">
                    <td className="p-2.5 font-mono font-bold text-brand">{item.sku}</td>
                    <td className="p-2.5 font-bold text-foreground">{item.name}</td>
                    <td className="p-2.5 font-black">
                      {item.qty} {item.unit}
                    </td>
                    <td className="p-2.5">{item.totalWeightKg.toLocaleString()} ק״ג</td>
                    <td className="p-2.5">
                      {item.requiresBale && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                          <Box className="size-3" />
                          {item.balesCount} בלה (60002)
                        </span>
                      )}
                      {item.requiresPallet && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                          <Package className="size-3" />
                          {item.palletsCount} משטח (60060)
                        </span>
                      )}
                      {!item.requiresBale && !item.requiresPallet && (
                        <span className="text-muted-foreground">ללא פקדון</span>
                      )}
                    </td>
                    <td className="p-2.5">{shekel(item.unitPrice)}</td>
                    <td className="p-2.5 font-black text-foreground">{shekel(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposits & Returns Calculator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deposits Charge Breakdown */}
        <div className="rounded-2xl border border-border bg-muted/30 p-3.5 space-y-2.5">
          <div className="text-xs font-black text-foreground flex items-center gap-1.5">
            <Box className="size-4 text-brand" />
            <span>חיוב פקדונות ואריזות חוזרות</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">שק גדול בלה (מק״ט 60002):</span>
              <span className="font-bold">
                {report.balesCharged} יח׳ × {DEPOSITS.BALE_PRICE} ₪ ={" "}
                <span className="font-black text-foreground">{shekel(report.balesDepositSum)}</span>
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">משטח עץ סבן (מק״ט 60060):</span>
              <span className="font-bold">
                {report.palletsCharged} יח׳ × {DEPOSITS.PALLET_PRICE} ₪ ={" "}
                <span className="font-black text-foreground">
                  {shekel(report.palletsDepositSum)}
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 font-bold">
              <span>סה״כ פקדונות לחיוב בתעודה:</span>
              <span className="text-sm font-black text-brand">
                {shekel(report.balesDepositSum + report.palletsDepositSum)}
              </span>
            </div>
          </div>
        </div>

        {/* Returns from site */}
        <div className="rounded-2xl border border-border bg-emerald-500/5 p-3.5 space-y-2.5">
          <div className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <RotateCcw className="size-4 text-emerald-600" />
            <span>בקרת החזרות בשטח (ע״י הנהג מתעודת המשלוח)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">
                בלות שהוחזרו באתר (60002):
              </label>
              <input
                type="number"
                min={0}
                value={returnedBales}
                onChange={(e) => setReturnedBales(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border border-input bg-background px-2.5 py-1 text-xs font-bold"
              />
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                זיכוי: {shekel(returnedBales * DEPOSITS.BALE_PRICE)}
              </span>
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">
                משטחים שהוחזרו באתר (60060):
              </label>
              <input
                type="number"
                min={0}
                value={returnedPallets}
                onChange={(e) => setReturnedPallets(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border border-input bg-background px-2.5 py-1 text-xs font-bold"
              />
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                זיכוי: {shekel(returnedPallets * DEPOSITS.PALLET_PRICE)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-emerald-500/20 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <span>זיכוי כרטסת לקוח בגין החזרות:</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              -{shekel(returnRefundTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Footer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/60 p-3.5 border border-border">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block">משקל מטען כולל:</span>
            <span className="text-sm font-black text-foreground">
              {report.totalWeightKg.toLocaleString()} ק״ג
            </span>
          </div>
          <div className="h-7 w-px bg-border" />
          <div>
            <span className="text-muted-foreground block">עלות חומרים:</span>
            <span className="text-sm font-bold text-foreground">
              {shekel(report.totalItemsPrice)}
            </span>
          </div>
          <div className="h-7 w-px bg-border" />
          <div>
            <span className="text-muted-foreground block">מאזן לתעודה סופית (נטו פקדונות):</span>
            <span className="text-sm font-black text-brand">
              {shekel(finalBalanceAfterReturns)}
            </span>
          </div>
        </div>

        {onApplyWeightToQuote && (
          <button
            onClick={() => onApplyWeightToQuote(report.totalWeightKg)}
            className="flex items-center gap-1.5 rounded-xl bg-brand px-3 py-1.5 text-xs font-black text-brand-foreground shadow-sm transition hover:opacity-95"
          >
            <Scale className="size-3.5" />
            <span>העבר משקל {report.totalWeightKg.toLocaleString()} ק״ג למחירון</span>
          </button>
        )}
      </div>
    </div>
  );
}
