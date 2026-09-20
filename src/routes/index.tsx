import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import {
  Lock,
  MessageCircle,
  Moon,
  Sun,
  Truck,
  Type,
  Maximize2,
  Minimize2,
  Sparkles,
  MapPin,
  CheckCircle2,
  FileText,
  Package,
  Layers,
  FileCheck,
  Database,
  ArrowRight,
} from "lucide-react";
import { ORIGIN, ZONES, findZone } from "@/lib/catalog";
import { buildQuote, shekel } from "@/lib/pricing";
import { SIZE_TIERS, useSettings, type SizeTier } from "@/lib/settings";
import { QuoteCard } from "@/components/QuoteCard";
import { NoaChat } from "@/components/NoaChat";
import { AdminPanel } from "@/components/AdminPanel";
import { SabanHeroBanner, type HeroActionKey } from "@/components/SabanHeroBanner";
import type { MapTarget } from "@/components/SabanMap";
import { RoleSwitcherBar } from "@/components/RoleSwitcherBar";
import { SkuDepositConverter } from "@/components/SkuDepositConverter";
import { DispatchModule } from "@/components/DispatchModule";
import { ReconciliationModule } from "@/components/ReconciliationModule";
import { SheetsArchitectureCard } from "@/components/SheetsArchitectureCard";
import { SabanQuickQuoteTab } from "@/components/SabanQuickQuoteTab";
import { SabanDispatchBoardTab } from "@/components/SabanDispatchBoardTab";
import { RedAlertValidator } from "@/components/RedAlertValidator";
import { SabanCeoDashboard } from "@/components/SabanCeoDashboard";
import { USER_ROLES, type UserRoleKey } from "@/lib/roles";

const SabanMap = React.lazy(() => import("@/components/SabanMap"));

export type ChapterTab =
  "quote" | "dispatch" | "alerts" | "ceo" | "map" | "sku" | "reconciliation" | "sheets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          'נועה AI | מוקד סידור עבודה, ניתוב, תמחור ובקרת אספקות | ח. סבן חומרי בניין (1994) בע"מ',
      },
      {
        name: "description",
        content:
          "אוטומציה מקצה-לקצה של מערך הלוגיסטיקה, התמחור, הסידור ובקרת האספקות – אפס טעויות בחיוב וסגירת מעגל מיידית.",
      },
      {
        property: "og:title",
        content: "נועה AI - מוקד סידור עבודה, ניתוב ותמחור | ח. סבן חומרי בניין",
      },
      {
        property: "og:description",
        content:
          "מערכת מבצעית מקיפה לסידור עבודה, נרמול מק״ט קומקס, פקדונות, מנוף 12ט, פלטה 5.5ט, LIFO, בקרת סריקות וטכוגרף.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { settings, update, toggleTheme, setSize } = useSettings();
  const [currentRole, setCurrentRole] = React.useState<UserRoleKey>("rami");
  const [activeTab, setActiveTab] = React.useState<ChapterTab>("quote");
  const [target, setTarget] = React.useState<MapTarget | null>(null);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [truck, setTruck] = React.useState<"crane" | "flatbed">("crane");
  const logoClicks = React.useRef(0);

  const [activeHeroAction, setActiveHeroAction] = React.useState<HeroActionKey>("fleet");

  const zone = query.trim() ? findZone(query) : null;
  const quote = zone
    ? buildQuote({ zone, truck, dieselNet: settings.dieselNet, vatRate: settings.vatRate })
    : null;

  React.useEffect(() => {
    if (zone) setTarget({ name: zone.name, lat: zone.lat, lng: zone.lng });
  }, [zone?.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoleSelect = (roleKey: UserRoleKey) => {
    setCurrentRole(roleKey);
    // Guide role to their primary domain view
    if (roleKey === "yoav") {
      setActiveTab("quote");
    } else if (roleKey === "harel") {
      setActiveTab("ceo");
    } else if (roleKey === "rami") {
      setActiveTab("dispatch");
    } else if (roleKey === "hekmat" || roleKey === "ali" || roleKey === "itzik_oren") {
      setActiveTab("dispatch");
    } else if (roleKey === "galia" || roleKey === "lina") {
      setActiveTab("reconciliation");
    } else if (roleKey === "vered") {
      setActiveTab("sheets");
    }
  };

  const handleHeroAction = (key: HeroActionKey) => {
    setActiveHeroAction(key);
    if (key === "location") {
      setActiveTab("map");
      setTarget({
        name: ORIGIN.label,
        lat: ORIGIN.lat,
        lng: ORIGIN.lng,
        subtitle: "מגרש מרכזי ח. סבן חומרי בניין",
      });
    } else if (key === "fleet") {
      setActiveTab("dispatch");
      setTruck((curr) => (curr === "crane" ? "flatbed" : "crane"));
    } else if (key === "trips") {
      setActiveTab("reconciliation");
    } else if (key === "tasks") {
      setActiveTab("dispatch");
    }
  };

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
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-brand px-4 py-3 text-brand-foreground shadow-md backdrop-blur-md">
        <button onClick={tap} className="flex items-center gap-3 text-right">
          <span className="grid size-11 place-items-center rounded-2xl bg-white/20 text-2xl font-black shadow-inner">
            ס
          </span>
          <span>
            <span className="block text-lg font-black leading-tight tracking-tight">
              ח. סבן חומרי בניין (1994) בע״מ
            </span>
            <span className="block text-xs opacity-90">
              נועה AI · מוקד סידור עבודה, ניתוב, תמחור ובקרת אספקות
            </span>
          </span>
        </button>
        <div className="flex items-center gap-2">
          <button
            id="theme-toggle-btn"
            type="button"
            aria-label={settings.theme === "dark" ? "מעבר למצב יום" : "מעבר למצב לילה"}
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 px-3 py-2 text-xs font-bold text-white transition-all duration-200 active:scale-95 border border-white/20 cursor-pointer shadow-sm"
            title={
              settings.theme === "dark"
                ? "מצב כהה פעיל · לחץ למעבר למצב יום (בהיר)"
                : "מצב בהיר פעיל · לחץ למעבר למצב לילה (כהה)"
            }
          >
            {settings.theme === "dark" ? (
              <>
                <Sun className="size-4.5 text-amber-300" />
                <span className="hidden sm:inline font-black">מצב יום (בהיר)</span>
              </>
            ) : (
              <>
                <Moon className="size-4.5 text-sky-200" />
                <span className="hidden sm:inline font-black">מצב לילה (כהה)</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Display scale control */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-card/70 px-4 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <Type className="size-4 text-brand" />
          <span>גודל תצוגה מותאם:</span>
        </div>

        <div className="inline-flex rounded-2xl bg-muted/80 p-1 ring-1 ring-border/80 shadow-inner">
          {(
            [
              { id: "regular", label: "A רגיל", hint: "קומפקטי", badge: "100%" },
              { id: "medium", label: "A+ בינוני", hint: "נוח וברור", badge: "118%" },
              { id: "huge", label: "A++ ענק", hint: "נהגים / טאבלט", badge: "135%" },
            ] as const
          ).map((tier) => {
            const isSelected = settings.size === tier.id;
            return (
              <button
                id={`size-tier-btn-${tier.id}`}
                key={tier.id}
                type="button"
                onClick={() => setSize(tier.id)}
                className={`relative flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-black transition-all duration-200 active:scale-95 cursor-pointer ${
                  isSelected
                    ? "bg-brand text-brand-foreground shadow-md ring-1 ring-black/10 dark:ring-white/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
                title={`התאם גודל תצוגה ל-${tier.hint}`}
              >
                <span>{tier.label}</span>
                <span
                  className={`text-[10px] px-1 rounded-sm ${
                    isSelected ? "bg-white/20 text-white" : "bg-background/50 text-muted-foreground"
                  }`}
                >
                  {tier.badge}
                </span>
                {isSelected && <span className="size-1.5 rounded-full bg-cyan-300" />}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex flex-1 flex-col gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Chapter 1: User & Role Switcher Bar */}
        <RoleSwitcherBar currentRole={currentRole} onSelectRole={handleRoleSelect} />

        {/* Master Chapter Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-card p-2 border border-border shadow-xs overflow-x-auto">
          {(
            [
              {
                id: "quote",
                label: "טאב 1: מחשבון תמחור וברקודים",
                icon: MapPin,
                badge: "Quick Quote",
              },
              {
                id: "dispatch",
                label: "טאב 2: סידור ושיגור נהגים",
                icon: Truck,
                badge: "וואטסאפ לנהג",
              },
              {
                id: "alerts",
                label: "טאב 3: התראות אדומות",
                icon: FileCheck,
                badge: "אימות פקדונות",
              },
              {
                id: "ceo",
                label: "דשבורד מנכ״ל (הראל)",
                icon: Database,
                badge: "סולר & רווחיות",
              },
              {
                id: "map",
                label: "מפת ניתוב ויעדים",
                icon: MapPin,
                badge: "מפה עברית",
              },
              {
                id: "sku",
                label: "נירמול מק״ט ופקדונות",
                icon: Package,
                badge: "וואטסאפ & בלות",
              },
              {
                id: "reconciliation",
                label: "בקרת סריקות ו-QC",
                icon: FileCheck,
                badge: "טכוגרף & ראמי",
              },
              {
                id: "sheets",
                label: "ארכיטקטורת נתונים",
                icon: Database,
                badge: "איסור noaBrain",
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black transition-all shrink-0 ${
                  isSelected
                    ? "bg-brand text-brand-foreground shadow-md ring-1 ring-brand/50"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] rounded-full px-1.5 py-0.2 font-mono ${
                    isSelected ? "bg-white/20 text-white" : "bg-background/80 text-muted-foreground"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Floating Banner & Quick Noa Chat Button */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8">
            <SabanHeroBanner
              activeAction={activeHeroAction}
              onSelectAction={handleHeroAction}
              onOpenChat={() => setChatOpen(true)}
            />
          </div>
          <div className="md:col-span-4 flex flex-col justify-between gap-2.5 rounded-3xl bg-gradient-to-br from-[#00a884] to-[#059669] p-4 text-white shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <MessageCircle className="size-6 shrink-0" />
                <h3 className="text-lg font-black leading-tight">נועה AI לרשותך</h3>
              </div>
              <p className="text-xs text-white/90 mt-1 leading-relaxed">
                שאילתות תמחור מהירות, פענוח חופשי של הזמנות קבלנים, איתור יעדים, חישוב סולר ובדיקת
                פקדונות בזמן אמת.
              </p>
            </div>

            <button
              onClick={() => setChatOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white text-[#00a884] font-black py-2.5 text-xs shadow-md transition hover:bg-white/95 active:scale-98"
            >
              <MessageCircle className="size-4" />
              <span>פתח שיחה עם נועה AI</span>
            </button>
          </div>
        </div>

        {/* Dynamic Chapter Views */}
        {/* Tab 1: Quick Quote & Pricing */}
        {activeTab === "quote" && (
          <SabanQuickQuoteTab
            currentRole={currentRole}
            onSendToDispatch={() => setActiveTab("dispatch")}
            onShowRouteOnMap={(z) => {
              setQuery(z.name);
              setTarget({
                name: z.name,
                lat: z.lat,
                lng: z.lng,
                subtitle: `ברקוד מחירון ${z.code}`,
                zone: z,
              });
              setActiveTab("map");
            }}
          />
        )}

        {/* Tab 2: Dispatch Board & WhatsApp Cards */}
        {activeTab === "dispatch" && (
          <div className="space-y-4">
            <SabanDispatchBoardTab />
            <DispatchModule />
          </div>
        )}

        {/* Tab 3: Red Alert Validator */}
        {activeTab === "alerts" && <RedAlertValidator />}

        {/* CEO Executive Dashboard */}
        {activeTab === "ceo" && <SabanCeoDashboard />}

        {activeTab === "map" && (
          <div className="space-y-4">
            {/* Quick destination pricing card */}
            <section className="space-y-3 rounded-3xl bg-card p-4 sm:p-5 ring-1 ring-border shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-base font-black text-foreground">
                  פרק 3: חיפוש יעד ותמחור דינמי (החרש 10, הוד השרון)
                </label>
                <span className="text-xs text-muted-foreground">
                  נקודת עוגן קבועה: מגרש סבן החרש 10
                </span>
              </div>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="הקלד עיר או כתובת, למשל: ויצמן 4 רעננה / כ״ס / רמה״ש / פ״ת / גב״ש / צור יצחק"
                className="w-full rounded-2xl border border-input bg-background px-4 py-[calc(0.85rem*var(--ui-scale))] text-base outline-none focus:ring-2 focus:ring-brand font-medium"
              />

              <div className="flex gap-2">
                {(
                  [
                    ["crane", "מרצדס מנוף ופריקה (סדרה 18000) · חכמת"],
                    ["flatbed", "איסוזו פלטה והובלה (סדרה 818000) · עלי"],
                  ] as const
                ).map(([kind, label]) => (
                  <button
                    key={kind}
                    onClick={() => setTruck(kind)}
                    className={`flex-1 rounded-2xl px-3 py-2.5 text-sm font-bold ring-1 ring-border transition ${
                      truck === kind ? "bg-brand text-brand-foreground shadow-sm" : "bg-background"
                    }`}
                  >
                    <Truck className="mb-0.5 inline size-4 ml-1" /> {label}
                  </button>
                ))}
              </div>

              {quote ? (
                <QuoteCard
                  quote={quote}
                  destinationQuery={query}
                  onShowRoute={
                    zone
                      ? () => {
                          setTarget({
                            name: zone.name,
                            lat: zone.lat,
                            lng: zone.lng,
                            subtitle: `ברקוד ${quote.barcode}`,
                          });
                          const mapElement = document.getElementById("saban-map-section");
                          if (mapElement) {
                            mapElement.scrollIntoView({ behavior: "smooth", block: "center" });
                          }
                        }
                      : undefined
                  }
                />
              ) : query.trim() ? (
                <p className="text-xs text-muted-foreground">
                  לא זוהה אזור במחירון. נסה כינוי כמו "כ״ס", "רמה״ש", "פ״ת" או שאל את נועה.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {ZONES.length} אזורי חיוב במחירון · צריכת סולר 3.2 ק״מ/ל׳ + 2.7 ל׳ מנוף (מרצדס) /
                  6.0 ק״מ/ל׳ (איסוזו) · שער סולר {settings.dieselNet} ₪
                </p>
              )}
            </section>

            {/* Hebrew Saban Map */}
            <section
              id="saban-map-section"
              className="h-[60vh] min-h-[420px] overflow-hidden rounded-3xl ring-1 ring-[#0284c7]/25 shadow-lg"
            >
              <ClientOnly
                fallback={
                  <div className="grid h-full place-items-center bg-muted text-muted-foreground">
                    טוען מפת ישראל בעברית…
                  </div>
                }
              >
                <React.Suspense
                  fallback={
                    <div className="grid h-full place-items-center bg-muted text-muted-foreground">
                      טוען מפת ישראל בעברית…
                    </div>
                  }
                >
                  <SabanMap
                    target={target}
                    onSelectZone={(selectedZone) => {
                      setQuery(selectedZone.name);
                      setTarget({
                        name: selectedZone.name,
                        lat: selectedZone.lat,
                        lng: selectedZone.lng,
                        subtitle: `ברקוד מחירון ${selectedZone.code}`,
                        zone: selectedZone,
                      });
                    }}
                  />
                </React.Suspense>
              </ClientOnly>
            </section>
          </div>
        )}

        {/* Chapter 2: SKU Normalization & Deposits */}
        {activeTab === "sku" && (
          <SkuDepositConverter
            onApplyWeightToQuote={(weightKg) => {
              setActiveTab("dispatch");
            }}
          />
        )}

        {/* Chapter 4: Dispatch & Execution */}
        {activeTab === "dispatch" && <DispatchModule />}

        {/* Chapter 5: Reconciliation & Audit */}
        {activeTab === "reconciliation" && <ReconciliationModule currentUserKey={currentRole} />}

        {/* Chapter 6: Database & Sheets Architecture */}
        {activeTab === "sheets" && <SheetsArchitectureCard />}
      </main>

      <footer className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <span>ח. סבן חומרי בניין (1994) בע״מ · רחוב החרש 10, הוד השרון</span>
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
            setActiveTab("map");
            setChatOpen(false);
            setTimeout(() => {
              const mapElement = document.getElementById("saban-map-section");
              if (mapElement) {
                mapElement.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }, 100);
          }}
        />
      )}
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </div>
  );
}
