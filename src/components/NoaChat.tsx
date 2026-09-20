import * as React from "react";
import { ArrowRight, Send } from "lucide-react";
import { findZone, TRUCKS, type TruckKind } from "@/lib/catalog";
import { buildQuote, shekel, type Quote } from "@/lib/pricing";
import { useSettings } from "@/lib/settings";
import { askNoa } from "@/lib/noa.functions";
import { QuoteCard } from "./QuoteCard";
import type { MapTarget } from "./SabanMap";

interface Msg {
  id: string;
  role: "user" | "assistant";
  text: string;
  quote?: Quote | undefined;
  destinationQuery?: string | undefined;
  target?: MapTarget | undefined;
  time: string;
}

const now = () => new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

function detectTruck(text: string): TruckKind {
  if (/הובלה בלבד|בלי מנוף|ללא מנוף|איסוזו|עלי|משטח בלבד|ללא פריקה|פלטה/.test(text))
    return "flatbed";
  return "crane";
}

export function NoaChat({
  onClose,
  onShowRoute,
}: {
  onClose: () => void;
  onShowRoute: (target: MapTarget) => void;
}) {
  const { settings } = useSettings();
  const [msgs, setMsgs] = React.useState<Msg[]>([
    {
      id: "hello",
      role: "assistant",
      text: 'שלום ראמי, יואב והראל! אני נועה AI — מוקד תמחור, ניתוב ולוגיסטיקה של ח. סבן חומרי בניין (1994) בע"מ 🏗️\nנקודת המוצא: מגרש סבן (החרש 10, הוד השרון).\nכתבו לי כתובת יעד (למשל: סוקולוב 15 רמת השרון, 4 משטחים) וסוג הובלה — ואשלוף מיד ברקוד קטלוג, שיוך נהג, חישוב סולר ומחיר מדויק עם אפשרות שמירה ל-Google Sheets.',
      time: now(),
    },
  ]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const feed = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text, time: now() };
    const history = msgs.map((m) => ({ role: m.role, text: m.text }));
    setMsgs((m) => [...m, userMsg]);
    setBusy(true);

    const zone = findZone(text);
    const truck = detectTruck(text);
    let quote: Quote | undefined;
    let target: MapTarget | undefined;
    let context: string | null = null;

    if (zone) {
      quote = buildQuote({
        zone,
        truck,
        dieselNet: settings.dieselNet,
        vatRate: settings.vatRate,
      });
      target = {
        name: zone.name,
        lat: zone.lat,
        lng: zone.lng,
        subtitle: `ברקוד ${quote.barcode}`,
      };
      context = [
        `יעד מבוקש: ${text}`,
        `אזור שיוך בקטלוג: ${zone.name}`,
        `ברקוד שירות: ${quote.barcode} (${TRUCKS[truck].series})`,
        `משאית ונהג מוקצים: ${quote.truckName}, נהג ${quote.driver}`,
        `מרחק נסיעה בכביש: ${quote.km} ק"מ (זמן משוער: ${quote.etaMinutes} דק')`,
        `צריכת סולר משוערת: ${quote.liters} ליטר (~${shekel(quote.fuelCost)} עלות דלק, שער ${settings.dieselNet} ₪/ל')`,
        `מחיר מומלץ לפני מע"מ: ${shekel(quote.priceBeforeVat)}`,
        `סה"כ כולל מע"מ (${settings.vatRate}%): ${shekel(quote.priceWithVat)}`,
        `פירוט תמחור: מחיר בסיס ${shekel(quote.basePrice)}${quote.extraKm > 0 ? ` + ${quote.extraKm} ק"מ עודף` : ""}`,
      ].join("\n");
    }

    try {
      const res = await askNoa({ data: { message: text, history, context } });
      setMsgs((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: res.text,
          quote,
          destinationQuery: text,
          target,
          time: now(),
        },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: quote
            ? "הנה כרטיס התמחור והניתוב הרשמי מוכן עבורך 👇"
            : "לא זיהיתי יעד מוכר בטקסט. אנא ציין שם עיר או יישוב (לדוגמה: רעננה, פתח תקווה, שוהם, נתניה).",
          quote,
          destinationQuery: text,
          target,
          time: now(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col wa-bg">
      <header className="flex items-center gap-3 bg-[#00a884] px-3 py-2 text-white shadow-md dark:bg-[#1f2c34]">
        <button
          aria-label="חזרה למפה"
          onClick={onClose}
          className="rounded-full p-2 hover:bg-white/10"
        >
          <ArrowRight className="size-6" />
        </button>
        <div className="relative size-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white/60 shadow">
          <img
            src="/src/assets/images/saban_fleet_ui_1789907656504.jpg"
            alt="נועה - מוקד סבן"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-top scale-150"
          />
          <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-400 ring-2 ring-white" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-bold">נועה AI - מוקד לוגיסטיקה ותמחור סבן</div>
          <div className="truncate text-xs opacity-90">
            מחובר/ת כעת | מענה בזמן אמת לראמי וליואב
          </div>
        </div>
      </header>

      <div ref={feed} className="flex-1 space-y-2 overflow-y-auto p-3">
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${
                m.role === "user"
                  ? "bg-[#d9fdd3] text-[#111b21] dark:bg-[#005c4b] dark:text-white"
                  : "bg-white text-[#111b21] dark:bg-[#202c33] dark:text-white"
              }`}
            >
              <p className="whitespace-pre-wrap text-base leading-relaxed">{m.text}</p>
              {m.quote && (
                <QuoteCard
                  quote={m.quote}
                  destinationQuery={m.destinationQuery}
                  onShowRoute={m.target ? () => onShowRoute(m.target!) : undefined}
                />
              )}
              <div className="mt-1 text-left text-[0.7rem] opacity-60">{m.time}</div>
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-end">
            <div className="rounded-2xl bg-white px-4 py-3 text-base shadow-sm dark:bg-[#202c33] dark:text-white">
              נועה מקלידה…
            </div>
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 bg-[#f0f2f5] p-2 dark:bg-[#1f2c34]">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="כתוב כתובת יעד… למשל: ויצמן 4 רעננה, 3 בלוקי חול"
          className="max-h-32 flex-1 resize-none rounded-2xl bg-white px-4 py-3 text-base text-[#111b21] outline-none dark:bg-[#2a3942] dark:text-white"
        />
        <button
          aria-label="שלח"
          onClick={() => void send()}
          disabled={busy}
          className="grid size-12 shrink-0 place-items-center rounded-full bg-[#00a884] text-white shadow-md transition active:scale-95 disabled:opacity-50"
        >
          <Send className="size-6 -scale-x-100" />
        </button>
      </div>
    </div>
  );
}
