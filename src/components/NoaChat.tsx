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
  target?: MapTarget | undefined;
  time: string;
}

const now = () => new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

function detectTruck(text: string): TruckKind {
  if (/הובלה בלבד|בלי מנוף|ללא מנוף|איסוזו|עלי|משטח בלבד/.test(text)) return "flatbed";
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
      text: "היי! אני נועה מהמוקד של סבן 👋\nתכתוב לי כתובת יעד (רחוב, מספר, עיר) ואם צריך מנוף — ואני מחזירה ברקוד, מרחק, עלות סולר ומחיר מומלץ.",
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
        `אזור: ${zone.name}`,
        `ברקוד: ${quote.barcode} (${TRUCKS[truck].series})`,
        `משאית: ${quote.truckName}, נהג ${quote.driver}`,
        `מרחק: ${quote.km} ק"מ, זמן הגעה ${quote.etaMinutes} דק'`,
        `סולר: ${quote.liters} ליטר = ${shekel(quote.fuelCost)} (שער ${settings.dieselNet} ₪/ל')`,
        `מחיר לפני מע"מ: ${shekel(quote.priceBeforeVat)}, כולל מע"מ ${settings.vatRate}%: ${shekel(quote.priceWithVat)}`,
      ].join("\n");
    }

    try {
      const res = await askNoa({ data: { message: text, history, context } });
      setMsgs((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", text: res.text, quote, target, time: now() },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: quote
            ? "הנה התמחור מהמחירון הפנימי 👇"
            : "לא זיהיתי עיר בכתובת. תכתוב לי שם עיר או אזור מדויק בבקשה.",
          quote,
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
        <div className="grid size-11 shrink-0 place-items-center rounded-full bg-white/25 text-xl">
          👩‍💼
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
