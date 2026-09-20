import * as React from "react";
import {
  DRIVER_FLEET,
  buildRouteManifest,
  generateDriverWhatsAppCard,
  sendMissionToMakeWebhook,
  type DispatchStop,
  type RouteManifest,
} from "@/lib/dispatch";
import {
  Truck,
  Send,
  Navigation,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  Share2,
  ArrowDownUp,
  Boxes,
  MapPin,
  Clock,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export function DispatchModule() {
  const [driverKey, setDriverKey] = React.useState<"hekmat" | "ali">("hekmat");
  const driverSpec = DRIVER_FLEET[driverKey];

  // Mock list of active daily stops for the route
  const [stops, setStops] = React.useState<DispatchStop[]>([
    {
      id: "STOP-1",
      orderNumber: "ORD-94101",
      clientName: "אחים ששון קבלני שלד",
      destinationAddress: "ויצמן 42",
      city: "רעננה",
      contactName: "איציק ששון",
      contactPhone: "054-1234567",
      itemsSummary: "4 בלות טיט, 2 בלות חול ים, 2 משטחי מלט אפור",
      weightKg: 5200,
      craneRequired: true,
      notes: "כניסה מדרך עפר אחורית, פריקה לקומה ב׳ בגג",
      deliveryTimeWindow: "08:00 - 09:30",
      status: "loaded",
    },
    {
      id: "STOP-2",
      orderNumber: "ORD-94102",
      clientName: "אלון שיפוצים ויזמות",
      destinationAddress: "סוקולוב 15",
      city: "רמת השרון",
      contactName: "אלון כהן",
      contactPhone: "050-9876543",
      itemsSummary: "25 שקי דבק 603, 1 משטח טיח תרמי, 2 רשת אינטרגלס",
      weightKg: 1850,
      craneRequired: true,
      notes: "רחוב צר, להגיע לפני שעת העומס",
      deliveryTimeWindow: "10:00 - 11:30",
      status: "pending",
    },
    {
      id: "STOP-3",
      orderNumber: "ORD-94103",
      clientName: "גבאי בנייה וגמרים",
      destinationAddress: "הבנים 88",
      city: "הוד השרון",
      contactName: "מוחמד (מנהל אתר)",
      contactPhone: "052-5554321",
      itemsSummary: "2 בלות עדש, 1 בלה סומסום, 1 משטח בלוק 20",
      weightKg: 4200,
      craneRequired: true,
      notes: "חצר פתוחה, מנוף נגיש ישירות למדרכה",
      deliveryTimeWindow: "12:00 - 13:30",
      status: "pending",
    },
  ]);

  const [selectedStopId, setSelectedStopId] = React.useState<string>("STOP-1");
  const [copiedIndex, setCopiedIndex] = React.useState<string | null>(null);
  const [sendingWebhook, setSendingWebhook] = React.useState(false);

  const manifest: RouteManifest = React.useMemo(() => {
    return buildRouteManifest(driverKey, stops);
  }, [driverKey, stops]);

  const activeStop = stops.find((s) => s.id === selectedStopId) || stops[0];
  const activeStopIndex = stops.findIndex((s) => s.id === activeStop?.id) + 1;

  const card = React.useMemo(() => {
    if (!activeStop) return null;
    return generateDriverWhatsAppCard(activeStop, driverSpec, activeStopIndex, stops.length);
  }, [activeStop, driverSpec, activeStopIndex, stops.length]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast.success("כרטיס המשימה הועתק ללוח!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSendWebhook = async () => {
    if (!activeStop || !card) return;
    setSendingWebhook(true);
    const res = await sendMissionToMakeWebhook({
      orderNumber: activeStop.orderNumber,
      driver: driverSpec.driverName,
      licensePlate: driverSpec.licensePlate,
      client: activeStop.clientName,
      address: `${activeStop.destinationAddress}, ${activeStop.city}`,
      phone: activeStop.contactPhone,
      items: activeStop.itemsSummary,
      weightKg: activeStop.weightKg,
      wazeLink: card.wazeUrl,
    });
    setSendingWebhook(false);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-6">
      {/* Chapter 4 Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Truck className="size-5" />
            </span>
            <h2 className="text-xl font-black text-foreground">
              פרק 4: מודול סידור עבודה והפצת משימות לנהגים
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            בדיקת קיבולת משקל (עד 12 טון למרצדס / 5.5 טון לאיסוזו) · סידור פריקה מותאם ציר תנועה
            והעמסה הפוכה (LIFO) · שידור כרטיס וואטסאפ לנהג עם קישור Waze ישיר
          </p>
        </div>

        {/* Truck Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDriverKey("hekmat")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
              driverKey === "hekmat"
                ? "bg-brand text-brand-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <span>חכמת · מרצדס 12 טון (615-41-002)</span>
          </button>
          <button
            onClick={() => setDriverKey("ali")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
              driverKey === "ali"
                ? "bg-brand text-brand-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <span>עלי · איסוזו 5.5 טון (651-51-701)</span>
          </button>
        </div>
      </div>

      {/* Weight & Payload Utilization Bar */}
      <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">קיבולת משאית {driverSpec.driverName}:</span>
            <span className="font-mono text-muted-foreground">
              {driverSpec.truckModel} ({driverSpec.licensePlate})
            </span>
          </div>
          <div className="flex items-center gap-2 font-black">
            <span>
              {manifest.totalWeightKg.toLocaleString()} / {driverSpec.maxPayloadKg.toLocaleString()}{" "}
              ק״ג
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-black ${
                manifest.isOverloaded
                  ? "bg-rose-500 text-white"
                  : manifest.weightUtilizationPct > 85
                    ? "bg-amber-500 text-white"
                    : "bg-emerald-600 text-white"
              }`}
            >
              {manifest.weightUtilizationPct}% ניצול משקל
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 w-full rounded-full bg-border overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              manifest.isOverloaded
                ? "bg-rose-500"
                : manifest.weightUtilizationPct > 85
                  ? "bg-amber-500"
                  : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, manifest.weightUtilizationPct)}%` }}
          />
        </div>

        {manifest.isOverloaded ? (
          <div className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
            <AlertTriangle className="size-4" />
            <span>
              חריגת משקל של {(manifest.totalWeightKg - driverSpec.maxPayloadKg).toLocaleString()}{" "}
              ק״ג! ראמי, יש לפצל משלוח או להעביר למשאית השנייה.
            </span>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            <span>העומס תקין ובטווח המותר בחוק. המשאית מוכנה להעמסה בחצר החרש 10.</span>
          </div>
        )}
      </div>

      {/* Grid: LIFO Loading Sequence & WhatsApp Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Main: Stops and LIFO sequence */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-foreground flex items-center gap-2">
              <ArrowDownUp className="size-4 text-brand" />
              <span>תחנות הקו והוראות העמסה LIFO (מחסן 4 החרש)</span>
            </h3>
            <span className="text-xs text-muted-foreground">סדר נסיעה: לפי ציר תנועה</span>
          </div>

          <div className="space-y-3">
            {manifest.loadingOrderLIFO.map((item) => {
              const isSelected = item.stop.id === selectedStopId;
              return (
                <div
                  key={item.stop.id}
                  onClick={() => setSelectedStopId(item.stop.id)}
                  className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                    isSelected
                      ? "border-brand bg-brand/5 shadow-md ring-1 ring-brand/50"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="grid size-6 place-items-center rounded-lg bg-brand text-brand-foreground text-xs font-black">
                          {item.unloadStopOrder}
                        </span>
                        <span className="font-black text-sm text-foreground">
                          {item.stop.clientName}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          ({item.stop.orderNumber})
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="size-3 text-brand shrink-0" />
                        <span>
                          {item.stop.destinationAddress}, {item.stop.city}
                        </span>
                      </div>
                      <div className="text-xs text-foreground font-medium">
                        {item.stop.itemsSummary}
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span className="block text-xs font-black text-foreground">
                        {item.stop.weightKg.toLocaleString()} ק״ג
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        תחנה {item.unloadStopOrder} לפריקה
                      </span>
                    </div>
                  </div>

                  {/* LIFO warehouse loading badge */}
                  <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                      <Boxes className="size-3.5" />
                      <span>מיקום העמסה בחצר: {item.positionOnTruck}</span>
                    </div>
                    <span className="text-[10px] rounded-md bg-muted px-2 py-0.5 text-muted-foreground font-mono">
                      שלב העמסה #{item.loadStep}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Driver WhatsApp Task Card */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
              <Share2 className="size-4 text-emerald-600" />
              <span>כרטיס משימה לוואטסאפ לנהג</span>
            </h3>
            <span className="text-xs text-muted-foreground">
              תחנה {activeStopIndex} מתוך {stops.length}
            </span>
          </div>

          {card && (
            <div className="rounded-2xl border border-emerald-500/30 bg-[#f0fdf4] dark:bg-[#064e3b]/20 p-4 space-y-3">
              {/* WhatsApp Message Preview Box */}
              <div className="rounded-xl border border-emerald-500/20 bg-white dark:bg-card p-3 font-sans text-xs space-y-2 text-foreground shadow-xs leading-relaxed">
                <div className="font-black text-emerald-800 dark:text-emerald-300 flex items-center justify-between border-b border-border/40 pb-1.5">
                  <span>🏗️ כרטיס משימה ח. סבן</span>
                  <span className="text-[10px] font-mono">
                    נהג: {driverSpec.driverName} ({driverSpec.licensePlate})
                  </span>
                </div>
                <div className="space-y-1">
                  <div>
                    <strong>הזמנה: </strong>
                    <span className="font-mono text-brand">{activeStop.orderNumber}</span>
                  </div>
                  <div>
                    <strong>לקוח: </strong>
                    <span>{activeStop.clientName}</span>
                  </div>
                  <div>
                    <strong>כתובת: </strong>
                    <span>
                      {activeStop.destinationAddress}, {activeStop.city}
                    </span>
                  </div>
                  <div>
                    <strong>איש קשר: </strong>
                    <a
                      href={`tel:${activeStop.contactPhone}`}
                      className="text-emerald-600 dark:text-emerald-400 font-bold underline inline-flex items-center gap-1"
                    >
                      <PhoneCall className="size-3" />
                      {activeStop.contactName} ({activeStop.contactPhone})
                    </a>
                  </div>
                  <div>
                    <strong>פירוט: </strong>
                    <span>{activeStop.itemsSummary}</span>
                  </div>
                  <div>
                    <strong>משקל: </strong>
                    <span>{activeStop.weightKg.toLocaleString()} ק״ג</span>
                  </div>
                  {activeStop.notes && (
                    <div className="text-amber-700 dark:text-amber-300">
                      <strong>הערות גישה: </strong>
                      <span>{activeStop.notes}</span>
                    </div>
                  )}
                </div>

                {/* Direct Waze CTA inside preview */}
                <div className="pt-2 border-t border-border/40">
                  <a
                    href={card.wazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 text-white font-bold py-2 text-xs hover:bg-cyan-700 transition"
                  >
                    <Navigation className="size-3.5" />
                    <span>פתח ניווט Waze ישיר לאתר הלקוח</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {/* Direct WhatsApp Share */}
                <a
                  href={card.waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#25d366] text-white font-black py-2.5 text-xs shadow hover:bg-[#20bd5a] transition"
                >
                  <Share2 className="size-4" />
                  <span>שגר בוואטסאפ לנהג</span>
                </a>

                {/* Copy Text */}
                <button
                  onClick={() => handleCopyText(card.messageText, activeStop.id)}
                  className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition flex items-center gap-1"
                  title="העתק טקסט מלא"
                >
                  {copiedIndex === activeStop.id ? (
                    <Check className="size-4 text-emerald-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>

                {/* Make Webhook Dispatch */}
                <button
                  disabled={sendingWebhook}
                  onClick={handleSendWebhook}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 text-white font-black px-3.5 py-2 text-xs shadow hover:bg-purple-700 transition disabled:opacity-50"
                >
                  <Send className="size-3.5" />
                  <span>{sendingWebhook ? "משדר..." : "שידור Make Webhook"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
