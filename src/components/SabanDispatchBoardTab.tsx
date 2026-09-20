import * as React from "react";
import {
  Truck,
  Package,
  Weight,
  MessageCircle,
  Copy,
  Check,
  Navigation,
  CheckCircle2,
  AlertOctagon,
  FileSpreadsheet,
  Send,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";
import { shekel } from "@/lib/pricing";
import { toast } from "sonner";
import { DEPOSITS } from "@/lib/skuConverter";

interface OrderItemLine {
  id: string;
  name: string;
  category: "bulk" | "pallet" | "loose";
  qty: number;
  unit: string;
  weightKg: number;
  price: number;
  requiresBale: boolean;
  requiresPallet: boolean;
}

const INITIAL_ITEMS: OrderItemLine[] = [
  {
    id: "1",
    name: "חול ים נקי (שק בלה)",
    category: "bulk",
    qty: 2,
    unit: "בלה",
    weightKg: 2400,
    price: 360,
    requiresBale: true,
    requiresPallet: false,
  },
  {
    id: "2",
    name: "סומסום רטוב (שק בלה)",
    category: "bulk",
    qty: 1,
    unit: "בלה",
    weightKg: 1300,
    price: 190,
    requiresBale: true,
    requiresPallet: false,
  },
  {
    id: "3",
    name: "בלוק בטון 20 (משטח תקני)",
    category: "pallet",
    qty: 2,
    unit: "משטח",
    weightKg: 3000,
    price: 920,
    requiresBale: false,
    requiresPallet: true,
  },
  {
    id: "4",
    name: "מלט פורטלנד 50 ק״ג (משטח 32 שק)",
    category: "pallet",
    qty: 1,
    unit: "משטח",
    weightKg: 1600,
    price: 960,
    requiresBale: false,
    requiresPallet: true,
  },
];

export function SabanDispatchBoardTab() {
  const [clientName, setClientName] = React.useState("אבי כהן (קבלן שלד)");
  const [clientPhone, setClientPhone] = React.useState("052-8765432");
  const [destination, setDestination] = React.useState("האילנות 12, כפר סבא");
  const [docNumber, setDocNumber] = React.useState("ת״מ-90412");
  const [truckKind, setTruckKind] = React.useState<"crane" | "flatbed">("crane");
  const [deliveryPrice, setDeliveryPrice] = React.useState(320); // NIS before VAT
  const [items, setItems] = React.useState<OrderItemLine[]>(INITIAL_ITEMS);
  const [returnedBales, setReturnedBales] = React.useState(1);
  const [returnedPallets, setReturnedPallets] = React.useState(2);
  const [notes, setNotes] = React.useState("פריקה בחצר אחורית, מנוף לקומה 1");
  const [copiedDriver, setCopiedDriver] = React.useState(false);
  const [copiedManager, setCopiedManager] = React.useState(false);

  const driver = truckKind === "crane" ? "חכמת" : "עלי";
  const truckName =
    truckKind === "crane" ? "מרצדס 12 טון (615-41-002)" : "איסוזו 5.5 טון (651-51-701)";
  const maxWeightKg = truckKind === "crane" ? 12000 : 5500;

  // Deposit calculations
  const isFlatbedExemption = truckKind === "flatbed";
  const balesRequired = items.filter((i) => i.requiresBale).reduce((acc, i) => acc + i.qty, 0);
  const palletsRequired = items.filter((i) => i.requiresPallet).reduce((acc, i) => acc + i.qty, 0);

  const activeBalesCharged = isFlatbedExemption ? 0 : balesRequired;
  const activePalletsCharged = palletsRequired;

  const balesDepositCost = activeBalesCharged * DEPOSITS.BALE_PRICE;
  const palletsDepositCost = activePalletsCharged * DEPOSITS.PALLET_PRICE;
  const returnedCredit =
    returnedBales * DEPOSITS.BALE_PRICE + returnedPallets * DEPOSITS.PALLET_PRICE;

  const itemsSubtotal = items.reduce((acc, i) => acc + i.price, 0);
  const totalWeightKg = items.reduce((acc, i) => acc + i.weightKg, 0);
  const isOverweight = totalWeightKg > maxWeightKg;

  const subtotalBeforeVat =
    itemsSubtotal + deliveryPrice + balesDepositCost + palletsDepositCost - returnedCredit;
  const vat18 = subtotalBeforeVat * 0.18;
  const grandTotal = subtotalBeforeVat + vat18;

  // Waze Direct Navigation Link
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(destination)}&navigate=yes`;

  // WhatsApp Driver Card (NO PRICES!)
  const generateDriverWhatsAppCard = () => {
    return `*כרטיס משימה לנהג - ח. סבן חומרי בניין (1994) בע״מ* 🚛
נהג: *${driver}* (${truckName})
מספר תעודת משלוח: *${docNumber}*
שם לקוח: *${clientName}*
טלפון לקוח: ${clientPhone}
כתובת אספקה: *${destination}*

🧭 *ניווט Waze ישיר:*
${wazeUrl}

📦 *פירוט המטען לפריקה:*
${items.map((i, idx) => `• ${i.name} — ${i.qty} ${i.unit}`).join("\n")}

⚖️ משקל כולל: *${totalWeightKg.toLocaleString()} ק״ג*
🏷️ פקדונות להורדה: *${activeBalesCharged} שקי בלה* | *${activePalletsCharged} משטחי עץ*
🔄 פקדונות לאיסוף חוזר מהשטח: *${returnedBales} בלות* | *${returnedPallets} משטחים*
📝 דגשים: ${notes}

⚠️ *נא להחתים את הלקוח פיזית על התעודה ולשמור את דיסקית הטכוגרף!*`;
  };

  // WhatsApp Manager Card (WITH PRICES & VAT!)
  const generateManagerWhatsAppCard = () => {
    return `*כרטיס הזמנה ושיגור מנהל - סבן חומרי בניין* 📋
תעודה: *${docNumber}* | תאריך: ${new Date().toLocaleDateString("he-IL")}
לקוח: *${clientName}* (${clientPhone})
יעד: ${destination}
משאית ונהג: ${truckName} (${driver})

📦 *פירוט פריטים:*
${items.map((i) => `• ${i.name} (${i.qty} ${i.unit}) — ${shekel(i.price)}`).join("\n")}

🚚 *הובלה:* ${shekel(deliveryPrice)}
🏷️ *פקדונות:* ${activeBalesCharged} בלות (${shekel(balesDepositCost)}) + ${activePalletsCharged} משטחים (${shekel(palletsDepositCost)})
${returnedCredit > 0 ? `🔄 *זיכוי פקדונות מהשטח:* -${shekel(returnedCredit)}\n` : ""}\
*סה״כ לפני מע״מ:* ${shekel(subtotalBeforeVat)}
*מע״מ 18%:* ${shekel(vat18)}
💰 *סה״כ לתשלום כולל מע״מ 18%:* *${shekel(grandTotal)}*

משקל כולל: ${totalWeightKg.toLocaleString()} ק״ג (תקן: ${maxWeightKg.toLocaleString()} ק״ג)`;
  };

  const handleCopyDriver = () => {
    navigator.clipboard.writeText(generateDriverWhatsAppCard());
    setCopiedDriver(true);
    toast.success(`כרטיס נהג (${driver}) הועתק — ללא מחירים! מוכן לשליחה בוואטסאפ`);
    setTimeout(() => setCopiedDriver(false), 2500);
  };

  const handleCopyManager = () => {
    navigator.clipboard.writeText(generateManagerWhatsAppCard());
    setCopiedManager(true);
    toast.success("כרטיס מנהל הועתק — כולל תמחור, פקדונות ומע״מ 18%!");
    setTimeout(() => setCopiedManager(false), 2500);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Truck className="size-5" />
            </span>
            <h2 className="text-xl font-black text-foreground">
              טאב 2: סידור ושיגור נהגים (Dispatch Board)
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            הזנת פריטים · חישוב פקדונות אוטומטי (בלות 60002 ומשטחים 60060) · בקרת עומס משקל
            (12ט/5.5ט) · העתקת כרטיס לוואטסאפ (גרסת נהג ללא מחיר מול גרסת מנהל)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground font-mono">
            מוצא: החרש 10 הוד השרון
          </span>
        </div>
      </div>

      {/* Dispatch Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="font-bold text-foreground block mb-1">מספר תעודת משלוח:</label>
          <input
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono font-bold"
          />
        </div>

        <div>
          <label className="font-bold text-foreground block mb-1">שם לקוח:</label>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 font-bold"
          />
        </div>

        <div>
          <label className="font-bold text-foreground block mb-1">טלפון לקוח:</label>
          <input
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono"
          />
        </div>

        <div>
          <label className="font-bold text-foreground block mb-1">כתובת יעד:</label>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 font-bold"
          />
        </div>
      </div>

      {/* Truck Selection & Weight Gauge */}
      <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-foreground">הקצאת משאית ונהג:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setTruckKind("crane")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  truckKind === "crane"
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "bg-background border border-border text-muted-foreground"
                }`}
              >
                מרצדס מנוף (חכמת, 12ט)
              </button>
              <button
                onClick={() => setTruckKind("flatbed")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  truckKind === "flatbed"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-background border border-border text-muted-foreground"
                }`}
              >
                איסוזו פלטה (עלי, 5.5ט)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-muted-foreground">עומס משקל נוכחי:</span>
            <span
              className={`font-mono font-black ${
                isOverweight ? "text-rose-600 dark:text-rose-400" : "text-foreground"
              }`}
            >
              {totalWeightKg.toLocaleString()} / {maxWeightKg.toLocaleString()} ק״ג
            </span>
            {isOverweight && (
              <span className="rounded-md bg-rose-600 text-white px-2 py-0.5 text-[10px] font-black animate-pulse">
                חריגת משקל!
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden border border-border/50">
          <div
            className={`h-full transition-all duration-300 ${
              isOverweight
                ? "bg-rose-600"
                : totalWeightKg > maxWeightKg * 0.85
                  ? "bg-amber-500"
                  : "bg-emerald-600"
            }`}
            style={{ width: `${Math.min(100, (totalWeightKg / maxWeightKg) * 100)}%` }}
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-foreground flex items-center gap-1.5">
            <Package className="size-4 text-brand" />
            <span>פריטי הזמנה ומטען ({items.length})</span>
          </h3>
          <span className="text-[11px] text-muted-foreground">
            בלות ומשטחים מחושבים אוטומטית כנגד פריטים
          </span>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-xs text-right">
            <thead className="bg-muted/70 text-muted-foreground font-bold border-b border-border">
              <tr>
                <th className="p-2.5">תיאור פריט</th>
                <th className="p-2.5">כמות ויחידה</th>
                <th className="p-2.5">משקל (ק״ג)</th>
                <th className="p-2.5">פקדון נדרש</th>
                <th className="p-2.5">מחיר</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20">
                  <td className="p-2.5 font-bold text-foreground">{item.name}</td>
                  <td className="p-2.5">
                    {item.qty} {item.unit}
                  </td>
                  <td className="p-2.5 font-mono">{item.weightKg.toLocaleString()} ק״ג</td>
                  <td className="p-2.5">
                    {item.requiresBale && (
                      <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 ml-1">
                        שק בלה (60002)
                      </span>
                    )}
                    {item.requiresPallet && (
                      <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                        משטח עץ (60060)
                      </span>
                    )}
                    {!item.requiresBale && !item.requiresPallet && (
                      <span className="text-muted-foreground">ללא</span>
                    )}
                  </td>
                  <td className="p-2.5 font-mono font-bold text-foreground">
                    {shekel(item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial & Deposit Summary Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deposits & Returns */}
        <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2.5 text-xs">
          <span className="font-black text-foreground block">
            סיכום פקדונות ואריזות חוזרות (קומקס):
          </span>

          <div className="flex justify-between py-1 border-b border-border/50">
            <span>
              שק גדול בלה (מק״ט 60002) — {activeBalesCharged} יח׳:
              {isFlatbedExemption && (
                <span className="text-[10px] text-emerald-600 mr-1 font-bold">
                  (פטור עלי פלטה!)
                </span>
              )}
            </span>
            <span className="font-mono font-bold text-foreground">{shekel(balesDepositCost)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border/50">
            <span>משטח עץ סבן (מק״ט 60060) — {activePalletsCharged} יח׳:</span>
            <span className="font-mono font-bold text-foreground">
              {shekel(palletsDepositCost)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">החזרת פקדונות מהשטח:</span>
            <div className="flex items-center gap-2">
              <label className="text-[11px]">בלות:</label>
              <input
                type="number"
                min="0"
                value={returnedBales}
                onChange={(e) => setReturnedBales(Number(e.target.value))}
                className="w-12 rounded border bg-background px-1 text-center"
              />
              <label className="text-[11px]">משטחים:</label>
              <input
                type="number"
                min="0"
                value={returnedPallets}
                onChange={(e) => setReturnedPallets(Number(e.target.value))}
                className="w-12 rounded border bg-background px-1 text-center"
              />
            </div>
          </div>

          {returnedCredit > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
              <span>זיכוי בגין החזרה:</span>
              <span className="font-mono">-{shekel(returnedCredit)}</span>
            </div>
          )}
        </div>

        {/* Pricing Subtotal & 18% VAT */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2 text-xs">
          <span className="font-black text-foreground block">סיכום כספי כולל מע״מ 18%:</span>

          <div className="flex justify-between py-0.5">
            <span className="text-muted-foreground">סה״כ פריטי בניין:</span>
            <span className="font-mono font-bold text-foreground">{shekel(itemsSubtotal)}</span>
          </div>

          <div className="flex justify-between py-0.5">
            <span className="text-muted-foreground">דמי הובלה (סבן):</span>
            <span className="font-mono font-bold text-foreground">{shekel(deliveryPrice)}</span>
          </div>

          <div className="flex justify-between py-0.5">
            <span className="text-muted-foreground">סה״כ פקדונות נטו:</span>
            <span className="font-mono font-bold text-foreground">
              {shekel(balesDepositCost + palletsDepositCost - returnedCredit)}
            </span>
          </div>

          <div className="flex justify-between py-1 border-t border-border/60">
            <span className="text-muted-foreground">מע״מ 18%:</span>
            <span className="font-mono font-bold text-foreground">{shekel(vat18)}</span>
          </div>

          <div className="flex justify-between py-1.5 border-t border-border font-black text-base text-brand">
            <span>סה״כ כולל מע״מ 18%:</span>
            <span className="font-mono">{shekel(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* 1-Click WhatsApp Copy Section */}
      <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-5 text-[#00a884]" />
            <span className="text-sm font-black text-foreground">
              שיגור מהיר בוואטסאפ (1-Click Copy)
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            קישור ניווט Waze מוטמע אוטומטית בכרטיס הנהג
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Driver Version Button */}
          <button
            onClick={handleCopyDriver}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#00a884] text-white px-4 py-3 text-xs font-black shadow-sm hover:bg-[#008f6f] transition active:scale-95"
          >
            {copiedDriver ? <Check className="size-4" /> : <Copy className="size-4" />}
            <span>{copiedDriver ? "הועתק ללוח!" : `העתק כרטיס נהג (${driver}) — ללא מחירים!`}</span>
          </button>

          {/* Manager Version Button */}
          <button
            onClick={handleCopyManager}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand text-brand-foreground px-4 py-3 text-xs font-black shadow-sm hover:opacity-90 transition active:scale-95"
          >
            {copiedManager ? <Check className="size-4" /> : <FileSpreadsheet className="size-4" />}
            <span>{copiedManager ? "הועתק ללוח!" : "העתק כרטיס מנהל — כולל תמחור ומע״מ"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
