import * as React from "react";
import {
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Truck,
  PackageCheck,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { shekel } from "@/lib/pricing";

export interface AlertOrderData {
  orderNumber: string;
  clientName: string;
  destination: string;
  truckKind: "crane" | "flatbed";
  requiresCraneDrop: boolean;
  bulkItemsCount: number; // e.g., sand/sumsum
  palletItemsCount: number; // e.g., blocks/cement
  baleDepositsCount: number; // 60002
  palletDepositsCount: number; // 60060
  totalWeightKg: number;
  barcode: number;
  unreturnedBalesCount: number;
}

const DEFAULT_SAMPLE_ORDER: AlertOrderData = {
  orderNumber: "ORD-8924",
  clientName: "יוסי ברקוביץ׳ (קבלן גמרים)",
  destination: "סוקולוב 15, רמת השרון",
  truckKind: "flatbed",
  requiresCraneDrop: true, // Conflict: flatbed truck but requires crane!
  bulkItemsCount: 3, // 3 bles of sand/sumsum
  palletItemsCount: 4, // 4 pallets of cement
  baleDepositsCount: 0, // Missing 60002!
  palletDepositsCount: 4, // 60060 ok
  totalWeightKg: 9800, // 9.8 tons on a 5.5 ton truck! Overload!
  barcode: 18060, // Crane barcode on flatbed truck!
  unreturnedBalesCount: 2,
};

interface RedAlertValidatorProps {
  orderData?: AlertOrderData;
  onApplyFix?: (updated: AlertOrderData) => void;
}

export function RedAlertValidator({
  orderData = DEFAULT_SAMPLE_ORDER,
  onApplyFix,
}: RedAlertValidatorProps) {
  const [data, setData] = React.useState<AlertOrderData>(orderData);

  React.useEffect(() => {
    setData(orderData);
  }, [orderData]);

  // Validation Rules:
  const isBulkMissingBale = data.bulkItemsCount > 0 && data.baleDepositsCount < data.bulkItemsCount;
  const isPalletMissingDeposit =
    data.palletItemsCount > 0 && data.palletDepositsCount < data.palletItemsCount;
  const isCraneConflict = data.requiresCraneDrop && data.truckKind === "flatbed";
  const maxWeight = data.truckKind === "crane" ? 12000 : 5500;
  const isOverweight = data.totalWeightKg > maxWeight;
  const isBarcodeMismatch =
    (data.truckKind === "crane" && data.barcode >= 800000) ||
    (data.truckKind === "flatbed" && data.barcode < 800000);

  const totalAlertsCount = [
    isBulkMissingBale,
    isPalletMissingDeposit,
    isCraneConflict,
    isOverweight,
    isBarcodeMismatch,
  ].filter(Boolean).length;

  const handleFixBaleDeposit = () => {
    const fixed = { ...data, baleDepositsCount: data.bulkItemsCount };
    setData(fixed);
    onApplyFix?.(fixed);
    toast.success(`תוקן אוטומטית: נוספו ${data.bulkItemsCount} שקי בלה (מק״ט 60002) להזמנה!`);
  };

  const handleFixTruckToCrane = () => {
    const fixed: AlertOrderData = {
      ...data,
      truckKind: "crane",
      barcode: data.barcode >= 800000 ? data.barcode - 800000 : data.barcode,
    };
    setData(fixed);
    onApplyFix?.(fixed);
    toast.success("תוקן אוטומטית: הוקצתה משאית מרצדס מנוף 12 טון (חכמת) עם סדרת ברקודים 18000");
  };

  const handleFixAllAlerts = () => {
    const fixed: AlertOrderData = {
      ...data,
      truckKind: "crane",
      baleDepositsCount: data.bulkItemsCount,
      palletDepositsCount: data.palletItemsCount,
      barcode: data.barcode >= 800000 ? data.barcode - 800000 : data.barcode,
    };
    setData(fixed);
    onApplyFix?.(fixed);
    toast.success("כל ההתראות תוקנו במלואן: שודרג למנוף 12ט, ברקוד נורמל ונוספו כל הפקדונות!");
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-6 text-right">
      {/* Tab 3 Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`grid size-9 place-items-center rounded-xl ${
                totalAlertsCount > 0
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {totalAlertsCount > 0 ? (
                <AlertOctagon className="size-5" />
              ) : (
                <ShieldCheck className="size-5" />
              )}
            </span>
            <h2 className="text-xl font-black text-foreground">
              טאב 3: מנוע התראות אדומות ואימות פקדונות (Red Alert Validator)
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            בדיקה אוטומטית רציפה: התאמת חומרי תפזורת לשקי בלה (60002), משטחים (60060), בדיקת קיבולת
            משאית (12ט/5.5ט) ותאימות ברקוד.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {totalAlertsCount > 0 ? (
            <button
              onClick={handleFixAllAlerts}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-black text-white shadow-sm hover:bg-rose-700 transition active:scale-95"
            >
              <Sparkles className="size-4" />
              <span>תקן הכל אוטומטית ({totalAlertsCount} התראות)</span>
            </button>
          ) : (
            <span className="flex items-center gap-1.5 rounded-xl bg-emerald-500/15 px-3 py-1.5 text-xs font-black text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-4" />
              <span>הזמנה מאומתת - תקינה לשיגור ✓</span>
            </span>
          )}
        </div>
      </div>

      {/* Order Context Card */}
      <div className="rounded-2xl border border-border bg-muted/40 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-muted-foreground font-bold">הזמנה בבדיקה: </span>
          <span className="font-mono font-black text-foreground">{data.orderNumber}</span> ·{" "}
          <span className="font-bold text-foreground">{data.clientName}</span> ·{" "}
          <span className="text-muted-foreground">{data.destination}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>
            משאית:{" "}
            <strong>
              {data.truckKind === "crane" ? "מרצדס מנוף (חכמת, 12ט)" : "איסוזו פלטה (עלי, 5.5ט)"}
            </strong>
          </span>
          <span>
            משקל נוכחי: <strong>{data.totalWeightKg.toLocaleString()} ק״ג</strong>
          </span>
        </div>
      </div>

      {/* Validation Checklist Grid */}
      <div className="space-y-3">
        {/* Rule 1: Bulk Materials vs 60002 Bale Deposit */}
        <div
          className={`rounded-2xl border p-4 transition-all ${
            isBulkMissingBale
              ? "border-rose-500/50 bg-rose-500/10 shadow-xs"
              : "border-emerald-500/30 bg-emerald-500/5"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className={`grid size-7 place-items-center rounded-lg text-white shrink-0 mt-0.5 ${
                  isBulkMissingBale ? "bg-rose-600" : "bg-emerald-600"
                }`}
              >
                {isBulkMissingBale ? (
                  <AlertOctagon className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-foreground">
                    1. אימות פקדון שק בלה (מק״ט 60002, 38 ₪)
                  </h3>
                  {isBulkMissingBale && (
                    <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black text-white">
                      התראה אדומה: חסר פקדון!
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {isBulkMissingBale ? (
                    <>
                      זוהו <strong>{data.bulkItemsCount}</strong> שקי חומרי תפזורת (חול/סומסום) אך
                      חויבו רק <strong>{data.baleDepositsCount}</strong> פקדונות בלה! חוק ברזל: חובה
                      לחייב שק גדול בלה 60002 כנגד כל חומר בתפזורת.
                    </>
                  ) : (
                    <>
                      תקין ✓ חויבו {data.baleDepositsCount} שקי בלה (מק״ט 60002) כנגד{" "}
                      {data.bulkItemsCount} פריטי תפזורת.
                    </>
                  )}
                </p>
              </div>
            </div>

            {isBulkMissingBale && (
              <button
                onClick={handleFixBaleDeposit}
                className="shrink-0 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-black text-white hover:bg-rose-700 transition"
              >
                הוסף {data.bulkItemsCount} בלות (מק״ט 60002)
              </button>
            )}
          </div>
        </div>

        {/* Rule 2: Stacked Materials vs 60060 Wooden Pallet */}
        <div
          className={`rounded-2xl border p-4 transition-all ${
            isPalletMissingDeposit
              ? "border-rose-500/50 bg-rose-500/10 shadow-xs"
              : "border-emerald-500/30 bg-emerald-500/5"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className={`grid size-7 place-items-center rounded-lg text-white shrink-0 mt-0.5 ${
                  isPalletMissingDeposit ? "bg-rose-600" : "bg-emerald-600"
                }`}
              >
                {isPalletMissingDeposit ? (
                  <AlertOctagon className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-foreground">
                    2. אימות פקדון משטח עץ סבן (מק״ט 60060, 35 ₪)
                  </h3>
                  {isPalletMissingDeposit && (
                    <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black text-white">
                      התראה אדומה: חסר משטח!
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {isPalletMissingDeposit ? (
                    <>
                      זוהו <strong>{data.palletItemsCount}</strong> משטחי בלוקים/מלט/טיח אך חויבו רק{" "}
                      <strong>{data.palletDepositsCount}</strong> משטחי עץ. חובה לחייב מק״ט 60060.
                    </>
                  ) : (
                    <>
                      תקין ✓ חויבו {data.palletDepositsCount} משטחי עץ סבן כנגד{" "}
                      {data.palletItemsCount} פריטי משטחים.
                    </>
                  )}
                </p>
              </div>
            </div>

            {isPalletMissingDeposit && (
              <button
                onClick={() => {
                  setData({ ...data, palletDepositsCount: data.palletItemsCount });
                  toast.success("תוקן: נוספו משטחי עץ 60060 להזמנה");
                }}
                className="shrink-0 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-black text-white hover:bg-rose-700 transition"
              >
                הוסף משטחי עץ (60060)
              </button>
            )}
          </div>
        </div>

        {/* Rule 3: Crane Drop Required vs Flatbed Truck */}
        <div
          className={`rounded-2xl border p-4 transition-all ${
            isCraneConflict
              ? "border-amber-500/50 bg-amber-500/10 shadow-xs"
              : "border-emerald-500/30 bg-emerald-500/5"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className={`grid size-7 place-items-center rounded-lg text-white shrink-0 mt-0.5 ${
                  isCraneConflict ? "bg-amber-600" : "bg-emerald-600"
                }`}
              >
                {isCraneConflict ? (
                  <AlertTriangle className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-foreground">
                    3. אימות סוג פריקה: מנוף חכמת מול פלטה עלי
                  </h3>
                  {isCraneConflict && (
                    <span className="rounded-md bg-amber-600 px-2 py-0.5 text-[10px] font-black text-white">
                      קונפליקט מנוף/פלטה
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {isCraneConflict ? (
                    <>
                      הלקוח ביקש פריקת מנוף / קומה, אך שובצה משאית <strong>פלטה של עלי</strong> ללא
                      מנוף! יש לשדרג למשאית מרצדס מנוף (חכמת, סדרת ברקוד 18000).
                    </>
                  ) : (
                    <>
                      תקין ✓ סוג המשאית ({data.truckKind === "crane" ? "מנוף" : "פלטה"}) תואם את
                      דרישת הפריקה באתר.
                    </>
                  )}
                </p>
              </div>
            </div>

            {isCraneConflict && (
              <button
                onClick={handleFixTruckToCrane}
                className="shrink-0 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-black text-white hover:bg-amber-700 transition"
              >
                החלף למרצדס מנוף (חכמת)
              </button>
            )}
          </div>
        </div>

        {/* Rule 4: Total Weight vs Truck Payload Capacity */}
        <div
          className={`rounded-2xl border p-4 transition-all ${
            isOverweight
              ? "border-rose-500/50 bg-rose-500/10 shadow-xs"
              : "border-emerald-500/30 bg-emerald-500/5"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className={`grid size-7 place-items-center rounded-lg text-white shrink-0 mt-0.5 ${
                  isOverweight ? "bg-rose-600" : "bg-emerald-600"
                }`}
              >
                {isOverweight ? (
                  <AlertOctagon className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-foreground">
                    4. בקרת כושר נשיאה ומשקל מקסימלי
                  </h3>
                  {isOverweight && (
                    <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black text-white">
                      חריגת משקל מסוכנת!
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {isOverweight ? (
                    <>
                      משקל כולל של <strong>{data.totalWeightKg.toLocaleString()} ק״ג</strong> חורג
                      מהכושר המרבי המותר של המשאית (
                      <strong>{maxWeight.toLocaleString()} ק״ג</strong>
                      ). חובה לפצל את ההזמנה ל-2 סבבים או לשדרג למשאית 12 טון!
                    </>
                  ) : (
                    <>
                      תקין ✓ עומס של {data.totalWeightKg.toLocaleString()} ק״ג מתוך מקסימום{" "}
                      {maxWeight.toLocaleString()} ק״ג.
                    </>
                  )}
                </p>
              </div>
            </div>

            {isOverweight && data.truckKind === "flatbed" && (
              <button
                onClick={handleFixTruckToCrane}
                className="shrink-0 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-black text-white hover:bg-rose-700 transition"
              >
                שדרג למרצדס 12 טון
              </button>
            )}
          </div>
        </div>

        {/* Rule 5: Barcode Series Match */}
        <div
          className={`rounded-2xl border p-4 transition-all ${
            isBarcodeMismatch
              ? "border-rose-500/50 bg-rose-500/10 shadow-xs"
              : "border-emerald-500/30 bg-emerald-500/5"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className={`grid size-7 place-items-center rounded-lg text-white shrink-0 mt-0.5 ${
                  isBarcodeMismatch ? "bg-rose-600" : "bg-emerald-600"
                }`}
              >
                {isBarcodeMismatch ? (
                  <AlertOctagon className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-foreground">
                    5. אימות סדרת ברקוד מחירון קומקס
                  </h3>
                  {isBarcodeMismatch && (
                    <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black text-white">
                      אי-התאמת ברקוד
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {isBarcodeMismatch ? (
                    <>
                      ברקוד המחירון (<strong>{data.barcode}</strong>) אינו תואם לסוג המשאית! למשאית
                      מנוף חובה להשתמש בסדרת <strong>18000</strong>, ולפלטה בסדרת{" "}
                      <strong>818000</strong>.
                    </>
                  ) : (
                    <>
                      תקין ✓ סדרת ברקוד ({data.barcode}) תואמת בדיוק למשאית{" "}
                      {data.truckKind === "crane" ? "18000" : "818000"}.
                    </>
                  )}
                </p>
              </div>
            </div>

            {isBarcodeMismatch && (
              <button
                onClick={() => {
                  const correctBarcode =
                    data.truckKind === "crane"
                      ? data.barcode >= 800000
                        ? data.barcode - 800000
                        : data.barcode
                      : data.barcode < 800000
                        ? data.barcode + 800000
                        : data.barcode;
                  setData({ ...data, barcode: correctBarcode });
                  toast.success(`תוקן: עודכן ברקוד לסדרה המתאימה (${correctBarcode})`);
                }}
                className="shrink-0 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-black text-white hover:bg-rose-700 transition"
              >
                נרמל ברקוד
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
