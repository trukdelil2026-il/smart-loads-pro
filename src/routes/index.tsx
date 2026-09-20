import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Lock, MessageCircle, Moon, Sun, Truck } from "lucide-react";
import { ORIGIN, ZONES, findZone } from "@/lib/catalog";
import { buildQuote, shekel } from "@/lib/pricing";
import { SIZE_TIERS, useSettings, type SizeTier } from "@/lib/settings";
import { QuoteCard } from "@/components/QuoteCard";
import { NoaChat } from "@/components/NoaChat";
import { AdminPanel } from "@/components/AdminPanel";
import type { MapTarget } from "@/components/SabanMap";

const SabanMap = React.lazy(() => import("@/components/SabanMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "מוקד הובלות ותמחור | ח. סבן חומרי בניין (1994) בע\"מ" },
      {
        name: "description",
        content:
          "תמחור הובלות מנוף ומשטחים בזמן אמת, ברקוד אזור, מרחק ועלות סולר מהמגרש בהחרש 10 הוד השרון.",
      },
      { property: "og:title", content: "מוקד הובלות ותמחור סבן חומרי בניין" },
      {
        property: "og:description",
        content: "נועה AI מחשבת ברקוד, מרחק, סולר ומחיר מומלץ לכל יעד בשרון ובמרכz.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { settings, update } = useSettings();
  const [target, setTarget] = React.useState<MapTarget | null>(null);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [truck, setTruck] = React.useState<"crane" | "flatbed">("crane");
  const logoClicks = React.useRef(0);

  const zone = query.trim() ? findZone(query) : null;
  const quote = zone
    ? buildQuote({ zone, truck, dieselNet: settings.dieselNet, vatRate: settings.vatRate })
    : null;

  React.useEffect(() => {
    if (zone) setTarget({ name: zone.name, lat: zone.lat, lng: zone.lng });
  }, [zone?.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = () => {
    logoClicks.current += 1;
    if (logoClicks.current >= 3) {
      logoClicks.current = 0;
      setAdminOpen(true);
    }
    setTimeout(() => (logoClicks.current = 0), 1200);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between gap-3 bg-brand px-4 py-3 text-brand-foreground">
        <button onClick={tap} className="flex items-center gap-3 text-right">
          <span className="grid size-11 place-items-center rounded-2xl bg-white/20 text-2xl font-black">
            ס
          </span>
          <span>
            <span className="block text-lg font-black leading-tight">ח. סבן חומרי בניין</span>
            <span className="block text-xs opacity-90">החרש 10, הוד השרון · מוקד הובלות</span>
          </span>
        </button>
        <div className="flex items-center gap-2">
          <button
            aria-label="מצב כהה או בהיר"
            onClick={() => update({ theme: settings.theme === "dark" ? "light" : "dark" })}
            className="grid size-12 place-items-center rounded-2xl bg-white/20 transition active:scale-95"
          >
            {settings.theme === "dark" ? <Sun className="size-6" /> : <Moon className="size-6" />}
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2">
        <span className="text-sm text-muted-foreground">גודל תצוגה:</span>
        {(Object.keys(SIZE_TIERS) as SizeTier[]).map((tier) => (
          <button
            key={tier}
            onClick={() => update({ size: tier })}
            className={`rounded-xl px-4 py-2 text-base font-bold ring-1 ring-border transition ${
              settings.size === tier ? "bg-brand text-brand-foreground" : "bg-background"
            }`}
          >
            {SIZE_TIERS[tier].label}
          </button>
        ))}
      </div>

      <main className="flex flex-1 flex-col gap-4 p-4">
        <button
          onClick={() => setChatOpen(true)}
          className="flex w-full items-center gap-4 rounded-3xl bg-[#00a884] p-[calc(1.1rem*var(--ui-scale))] text-right text-white shadow-xl transition active:scale-[0.98]"
        >
          <MessageCircle className="size-[calc(2.5rem*var(--ui-scale))] shrink-0" />
          <span>
            <span className="block text-[1.4rem] font-black leading-tight">💬 שאל את נועה AI</span>
            <span className="block text-sm opacity-95">
              איתור יעד, תמחור מהיר וחישוב עלויות
            </span>
          </span>
        </button>

        <section className="space-y-3 rounded-3xl bg-card p-4 ring-1 ring-border">
          <label className="block text-lg font-bold">חיפוש יעד ידני</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="למשל: ויצמן 4 רעננה / ראשל״צ / ת״א"
            className="w-full rounded-2xl border border-input bg-background px-4 py-[calc(0.9rem*var(--ui-scale))] text-lg outline-none focus:ring-2 focus:ring-brand"
          />
          <div className="flex gap-2">
            {(
              [
                ["crane", "מנוף ופריקה · חכמת"],
                ["flatbed", "הובלה בלבד · עלי"],
              ] as const
            ).map(([kind, label]) => (
              <button
                key={kind}
                onClick={() => setTruck(kind)}
                className={`flex-1 rounded-2xl px-3 py-[calc(0.8rem*var(--ui-scale))] text-base font-bold ring-1 ring-border transition ${
                  truck === kind ? "bg-brand text-brand-foreground" : "bg-background"
                }`}
              >
                <Truck className="mb-1 inline size-5" /> {label}
              </button>
            ))}
          </div>
          {quote ? (
            <QuoteCard
              quote={quote}
              onShowRoute={
                zone
                  ? () =>
                      setTarget({
                        name: zone.name,
                        lat: zone.lat,
                        lng: zone.lng,
                        subtitle: `ברקוד ${quote.barcode}`,
                      })
                  : undefined
              }
            />
          ) : query.trim() ? (
            <p className="text-base text-muted-foreground">
              לא זוהה אזור. נסה שם עיר מדויק, או שאל את נועה.
            </p>
          ) : (
            <p className="text-base text-muted-foreground">
              {ZONES.length} אזורי חיוב במחירון · שער סולר {settings.dieselNet} ₪ לליטר · מע״מ{" "}
              {settings.vatRate}%
            </p>
          )}
        </section>

        <section className="h-[55vh] min-h-72 overflow-hidden rounded-3xl ring-1 ring-border">
          <ClientOnly
            fallback={
              <div className="grid h-full place-items-center bg-muted text-muted-foreground">
                טוען מפה…
              </div>
            }
          >
            <React.Suspense
              fallback={
                <div className="grid h-full place-items-center bg-muted text-muted-foreground">
                  טוען מפה…
                </div>
              }
            >
              <SabanMap target={target} />
            </React.Suspense>
          </ClientOnly>
        </section>

        {quote && (
          <div className="rounded-3xl bg-brand/10 p-4 text-center text-lg font-bold text-brand">
            מחיר מומלץ ליעד {quote.zoneName}: {shekel(quote.priceWithVat)} (כולל מע״מ)
          </div>
        )}
      </main>

      <footer className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <span>{ORIGIN.label}</span>
        <button
          aria-label="מסך ניהול"
          onClick={() => setAdminOpen(true)}
          className="rounded-lg p-2 hover:bg-muted"
        >
          <Lock className="size-4" />
        </button>
      </footer>

      {chatOpen && (
        <NoaChat
          onClose={() => setChatOpen(false)}
          onShowRoute={(t) => {
            setTarget(t);
            setChatOpen(false);
          }}
        />
      )}
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </div>
  );
}
