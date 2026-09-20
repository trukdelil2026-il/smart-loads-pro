import * as React from "react";
import {
  Calculator,
  Truck,
  Fuel,
  MapPin,
  Clock,
  Sparkles,
  Copy,
  Check,
  MessageCircle,
  TrendingUp,
  ShieldAlert,
  ArrowLeft,
  Search,
} from "lucide-react";
import { ORIGIN, ZONES, findZone, TRUCKS, type TruckKind, type Zone } from "@/lib/catalog";
import { buildQuote, shekel, type Quote } from "@/lib/pricing";
import { useSettings } from "@/lib/settings";
import { toast } from "sonner";
import type { UserRoleKey } from "@/lib/roles";

interface SabanQuickQuoteTabProps {
  currentRole: UserRoleKey;
  onSendToDispatch?: (quote: Quote) => void;
  onShowRouteOnMap?: (zone: Zone) => void;
}

export function SabanQuickQuoteTab({
  currentRole,
  onSendToDispatch,
  onShowRouteOnMap,
}: SabanQuickQuoteTabProps) {
  const { settings } = useSettings();
  const [query, setQuery] = React.useState("רמת השרון");
  const [truck, setTruck] = React.useState<TruckKind>("crane");
  const [copied, setCopied] = React.useState(false);

  const zone = query.trim() ? findZone(query) : null;
  const quote = zone
    ? buildQuote({
        zone,
        truck,
        dieselNet: settings.dieselNet,
        vatRate: settings.vatRate,
      })
    : null;

  const isYoavSales = currentRole === "yoav";

  const handleCopyQuoteWhatsApp = () => {
    if (!quote) return;
    const text = `*הצעת מחיר להובלה - ח. סבן חומרי בניין (1994) בע״מ* 🏗️
מוצא: ${ORIGIN.label}
יעד: ${quote.zoneName} · מחוז: ${quote.district} (מרחק כ-${quote.km} ק״מ)
סוג הובלה: ${quote.truckName} (נהג: ${quote.driver})
ברקוד מחירון סבן: ${quote.barcode}

*מחיר הובלה:* ${shekel(quote.priceBeforeVat)} + מע״מ 18%
*סה״כ לתשלום כולל מע״מ:* ${shekel(quote.priceWithVat)}
*עלות ממוצעת סולר למסלול:* כ-${shekel(quote.avgFuelCost)} (~${quote.avgDieselLiters} ליטר)
זמן הגעה משוער: כ-${quote.etaMinutes} דקות

להזמנות ותיאום אספקה: 09-7411222 / מענה בוואטסאפ`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("הצעת המחיר הועתקה ללוח — כולל מחוז ועלות סולר ממוצעת!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-6 text-right">
      {/* Tab 1 Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Calculator className="size-5" />
            </span>
            <h2 className="text-xl font-black text-foreground">
              טאב 1: מחשבון תמחור וברקודים מהיר (Quick Quote)
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            עוגן קבוע: החרש 10 הוד השרון · מנוע כינויי ערים (כ״ס, רמה״ש, פ״ת, גב״ש, בקעת אונו) ·
            סדרת ברקודים 18000 למנוף ו-818000 לפלטה
          </p>
        </div>

        {/* Role Visibility Badge */}
        <div className="flex items-center gap-2">
          {isYoavSales ? (
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-700 dark:text-amber-300">
              תצוגת יואב (מכירות/דלפק): עלויות פנימיות מוסתרות
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
              תצוגת {currentRole === "harel" ? "מנכ״ל (הראל)" : "סדרן ראשי (ראמי)"}: עלויות סולר
              ומרווח גלויות
            </span>
          )}
        </div>
      </div>

      {/* Input Row: Destination Search & Truck Selector */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Destination Search with Aliases */}
        <div className="md:col-span-7 space-y-2">
          <label className="block text-xs font-black text-foreground">
            יעד מבוקש (הקלד עיר, רחוב או כינוי מהיר):
          </label>
          <div className="relative">
            <Search className="absolute right-3.5 top-3.5 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="למשל: סוקולוב 15 רמה״ש / ויצמן 4 כ״ס / פ״ת / גב״ש / בקעת אונו"
              className="w-full rounded-2xl border border-input bg-background pr-10 pl-4 py-2.5 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Quick Aliases Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[11px] text-muted-foreground font-bold ml-1">יעדים מהירים:</span>
            {[
              { label: "רמה״ש", search: "סוקולוב רמה״ש" },
              { label: "כ״ס", search: "ויצמן כפר סבא" },
              { label: "פ״ת", search: "אם המושבות פתח תקווה" },
              { label: "גב״ש", search: "גבעת שמואל" },
              { label: "בקעת אונו", search: "קריית אונו סביון" },
              { label: "הוד״ש", search: "הוד השרון מרכז" },
              { label: "ת״א מרכז", search: "דיזנגוף תל אביב" },
              { label: "ראשל״צ", search: "ראשון לציון" },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(item.search)}
                className="rounded-lg bg-muted/80 px-2 py-0.5 text-[11px] font-bold text-muted-foreground hover:bg-brand/10 hover:text-brand transition"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Truck Selector */}
        <div className="md:col-span-5 space-y-2">
          <label className="block text-xs font-black text-foreground">סוג משאית ונהג מוקצה:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTruck("crane")}
              className={`rounded-2xl p-2.5 border text-right transition-all ${
                truck === "crane"
                  ? "border-brand bg-brand/10 shadow-sm ring-1 ring-brand/40"
                  : "border-border bg-card hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-foreground">מרצדס מנוף</span>
                <span className="rounded-md bg-brand/20 px-1.5 py-0.5 text-[10px] font-black text-brand">
                  12 טון
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                חכמת · סדרה 18000 · כולל פריקה
              </div>
            </button>

            <button
              onClick={() => setTruck("flatbed")}
              className={`rounded-2xl p-2.5 border text-right transition-all ${
                truck === "flatbed"
                  ? "border-blue-600 bg-blue-500/10 shadow-sm ring-1 ring-blue-600/40"
                  : "border-border bg-card hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-foreground">איסוזו פלטה</span>
                <span className="rounded-md bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-black text-blue-700 dark:text-blue-300">
                  5.5 טון
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                עלי · סדרה 818000 · הובלה בלבד
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Quote Results Box */}
      {quote && zone ? (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-black text-foreground">{quote.zoneName}</span>
                <span className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-xs font-black text-blue-700 dark:text-blue-300">
                  📍 {quote.district}
                </span>
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-black text-brand">
                  ברקוד {quote.barcode}
                </span>
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-black text-emerald-700 dark:text-emerald-300">
                  זוהה במחירון סבן ✓
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-3">
                <span>
                  מרחק מהחרש 10: {quote.km} ק״מ (הלוך ושוב: {quote.roundTripKm} ק״מ)
                </span>
                <span>זמן הגעה משוער: כ-{quote.etaMinutes} דקות</span>
              </div>
            </div>

            {/* Main Price Headline */}
            <div className="text-left">
              <span className="text-xs text-muted-foreground block">מחיר מומלץ סופי ללקוח:</span>
              <div className="text-2xl font-black text-brand leading-none">
                {shekel(quote.priceWithVat)}
              </div>
              <span className="text-[11px] text-muted-foreground">
                ({shekel(quote.priceBeforeVat)} לפני מע״מ 18%)
              </span>
            </div>
          </div>

          {/* District & Fuel Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-muted/30 border border-border/80 p-3">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <MapPin className="size-4.5" />
              </span>
              <div>
                <span className="text-[11px] font-bold text-muted-foreground block">שיוך מחוז גיאוגרפי:</span>
                <span className="text-sm font-black text-foreground">{quote.district}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <Fuel className="size-4.5" />
              </span>
              <div>
                <span className="text-[11px] font-bold text-muted-foreground block">עלות ממוצעת סולר (ליעד זה):</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                    {shekel(quote.avgFuelCost)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    (~{quote.avgDieselLiters} ליטר ממוצע צי סבן)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl bg-muted/40 p-2.5 space-y-0.5">
              <span className="text-muted-foreground font-bold block">סדרת ברקוד בקומקס:</span>
              <span className="font-mono text-base font-black text-foreground">
                {quote.barcode}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                {truck === "crane" ? "סדרה 18000 (מנוף)" : "סדרה 818000 (פלטה)"}
              </span>
            </div>

            <div className="rounded-xl bg-muted/40 p-2.5 space-y-0.5">
              <span className="text-muted-foreground font-bold block">מחיר בסיס לפני מע״מ:</span>
              <span className="font-mono text-base font-black text-foreground">
                {shekel(quote.priceBeforeVat)}
              </span>
              <span className="text-[10px] text-muted-foreground block">
                תוספת מרחק: {shekel(quote.extraKmCost)}
              </span>
            </div>

            <div className="rounded-xl bg-muted/40 p-2.5 space-y-0.5">
              <span className="text-muted-foreground font-bold block">מע״מ 18%:</span>
              <span className="font-mono text-base font-black text-foreground">
                {shekel(quote.vat)}
              </span>
              <span className="text-[10px] text-muted-foreground block">חוק מע״מ הרשמי</span>
            </div>

            <div className="rounded-xl bg-muted/40 p-2.5 space-y-0.5">
              <span className="text-muted-foreground font-bold block">משאית ונהג מוקצה:</span>
              <span className="font-bold text-foreground block truncate">{quote.driver}</span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {quote.truckName}
              </span>
            </div>
          </div>

          {/* Internal Fleet & Diesel Audit (Hidden from Yoav/Sales, Visible to Rami & Harel) */}
          {!isYoavSales && (
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-blue-900 dark:text-blue-300">
                <span className="flex items-center gap-1.5">
                  <Fuel className="size-4 text-blue-600" />
                  <span>בקרת עלויות סולר ומרווח תפעולי (ראמי & הראל בלבד)</span>
                </span>
                <span>שער סולר נקי: {settings.dieselNet} ₪ לליטר</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block">צריכת סולר חזויה:</span>
                  <span className="font-bold text-foreground">
                    {quote.liters} ליטר{" "}
                    {truck === "crane" && (
                      <span className="text-[10px] text-muted-foreground">(כולל 2.7ל׳ PTO)</span>
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block">עלות סולר ישירה:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {shekel(quote.fuelCost)}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block">מרווח גולמי משוער:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {shekel(quote.priceBeforeVat - quote.fuelCost)} (
                    {Math.round(
                      ((quote.priceBeforeVat - quote.fuelCost) / quote.priceBeforeVat) * 100,
                    )}
                    %)
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block">יעילות דלק:</span>
                  <span className="font-bold text-foreground">
                    {truck === "crane" ? "3.2 ק״מ/ל׳" : "6.0 ק״מ/ל׳"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyQuoteWhatsApp}
                className="flex items-center gap-2 rounded-xl bg-[#00a884] text-white px-4 py-2 text-xs font-black shadow-sm hover:bg-[#008f6f] transition active:scale-95"
              >
                {copied ? <Check className="size-4" /> : <MessageCircle className="size-4" />}
                <span>{copied ? "הועתק ללוח!" : "העתק הצעת מחיר לוואטסאפ ללקוח"}</span>
              </button>

              {onShowRouteOnMap && (
                <button
                  onClick={() => onShowRouteOnMap(zone)}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition"
                >
                  <MapPin className="size-4 text-brand" />
                  <span>הצג על המפה</span>
                </button>
              )}
            </div>

            {onSendToDispatch && (
              <button
                onClick={() => onSendToDispatch(quote)}
                className="flex items-center gap-1.5 rounded-xl bg-brand text-brand-foreground px-4 py-2 text-xs font-black shadow-sm hover:opacity-90 transition active:scale-95"
              >
                <span>העבר לסידור עבודה ושיגור נהג</span>
                <ArrowLeft className="size-4" />
              </button>
            )}
          </div>
        </div>
      ) : query.trim() ? (
        <div className="rounded-2xl border border-border bg-muted/30 p-6 text-center text-muted-foreground text-xs">
          לא אותר יעד מוגדר במחירון סבן. נסה לחפש לפי שם עיר קרוב או היעזר ביעדים המהירים למעלה.
        </div>
      ) : null}
    </div>
  );
}
