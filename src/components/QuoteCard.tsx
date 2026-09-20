import * as React from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Fuel,
  Truck,
  Barcode,
  Navigation,
  Loader2,
} from "lucide-react";
import { shekel, type Quote } from "@/lib/pricing";
import { saveDeliveryDocToSheets, type DeliveryDocPayload } from "@/lib/sheets";
import { useSettings } from "@/lib/settings";

export function QuoteCard({
  quote,
  destinationQuery,
  onShowRoute,
}: {
  quote: Quote;
  destinationQuery?: string;
  onShowRoute?: (() => void) | undefined;
}) {
  const { settings } = useSettings();
  const [currentUser, setCurrentUser] = React.useState<"ראמי" | "יואב" | "הראל">("ראמי");
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [statusMessage, setStatusMessage] = React.useState<string>("");

  const destinationText = destinationQuery?.trim() || quote.zoneName;

  const handleSaveToSheets = async () => {
    if (saveStatus === "saving") return;
    setSaveStatus("saving");
    setStatusMessage("");

    const payload: DeliveryDocPayload = {
      timestamp: new Date().toLocaleString("he-IL"),
      user: currentUser,
      destination: destinationText,
      area: quote.zoneName,
      barcode: quote.barcode,
      truck: quote.truckName,
      driver: quote.driver,
      distanceKm: quote.km,
      fuelLiters: quote.liters,
      fuelCost: quote.fuelCost,
      finalPriceBeforeVat: quote.priceBeforeVat,
      finalPriceWithVat: quote.priceWithVat,
      vatRate: settings.vatRate,
    };

    const result = await saveDeliveryDocToSheets(payload, settings.appsScriptUrl);
    if (result.success) {
      setSaveStatus("saved");
      setStatusMessage(result.message);
    } else {
      setSaveStatus("error");
      setStatusMessage(result.message);
    }
  };

  return (
    <div className="mt-3 overflow-hidden rounded-2xl bg-card text-card-foreground shadow-md ring-1 ring-border">
      {/* Required Header Format */}
      <div className="bg-brand px-4 py-3 text-brand-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-md bg-white/20 text-xs font-black">
              ס
            </span>
            <span className="text-sm font-black tracking-wide">נועה AI | ניתוב ותמחור משלוח</span>
          </div>
          <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-bold">
            סבן (1994) בע"מ
          </span>
        </div>
      </div>

      {/* Authorized user picker */}
      <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-3 py-1.5 text-xs">
        <span className="font-bold text-muted-foreground">סדרן / משתמש מורשה:</span>
        <div className="flex gap-1">
          {(["ראמי", "יואב", "הראל"] as const).map((user) => (
            <button
              key={user}
              onClick={() => setCurrentUser(user)}
              className={`rounded-lg px-2.5 py-0.5 font-bold transition ${
                currentUser === user
                  ? "bg-brand text-brand-foreground shadow-xs"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {user}
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory Card Specification Format */}
      <div className="p-3.5 space-y-2.5 text-xs sm:text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-foreground">
          <div className="flex items-start gap-2">
            <MapPin className="size-4 shrink-0 text-red-500 mt-0.5" />
            <div>
              <div className="text-[11px] text-muted-foreground font-semibold">יעד מבוקש:</div>
              <div className="font-bold text-foreground leading-snug">{destinationText}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Barcode className="size-4 shrink-0 text-blue-500 mt-0.5" />
            <div>
              <div className="text-[11px] text-muted-foreground font-semibold">
                אזור שיוך וברקוד:
              </div>
              <div className="font-bold text-foreground leading-snug">
                {quote.zoneName}{" "}
                <span className="text-blue-600 dark:text-blue-400">({quote.barcode})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-muted/60 p-2.5 space-y-1.5 ring-1 ring-border/50">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <Truck className="size-3.5 text-amber-500" />
              <span>משאית ונהג מוקצים:</span>
            </span>
            <span className="font-bold text-foreground">
              {quote.truckName} · <span className="text-brand font-black">{quote.driver}</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <Navigation className="size-3.5 text-cyan-500" />
              <span>מרחק נסיעה בכביש:</span>
            </span>
            <span className="font-bold text-foreground">
              {quote.km} ק"מ{" "}
              <span className="text-xs text-muted-foreground">
                (זמן משוער: {quote.etaMinutes} דק')
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <Fuel className="size-3.5 text-orange-500" />
              <span>צריכת סולר משוערת:</span>
            </span>
            <span className="font-bold text-foreground">
              {quote.liters} ליטר{" "}
              <span className="text-muted-foreground">(~{shekel(quote.fuelCost)} עלות דלק)</span>
            </span>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="rounded-xl border border-brand/20 bg-brand/5 p-3 space-y-1">
          {quote.extraKm > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>תוספת מרחק מעבר לבסיס ({quote.extraKm} ק"מ):</span>
              <span className="font-semibold text-foreground">+{shekel(quote.extraKmCost)}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between pt-1 border-t border-brand/10">
            <span className="font-semibold text-foreground">מחיר מומלץ לפני מע"מ:</span>
            <span className="text-base font-black text-brand">{shekel(quote.priceBeforeVat)}</span>
          </div>
          <div className="flex items-baseline justify-between text-sm sm:text-base font-black text-foreground">
            <span>סה"כ כולל מע"מ ({settings.vatRate}%):</span>
            <span className="text-lg text-emerald-600 dark:text-emerald-400">
              {shekel(quote.priceWithVat)}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground text-left pt-0.5">
            (פירוט: מחיר בסיס {shekel(quote.basePrice)}{" "}
            {quote.extraKm > 0 ? `+ ${quote.extraKm} ק"מ עודף` : ""})
          </div>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold ${
            saveStatus === "saved"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "bg-red-500/15 text-red-700 dark:text-red-300"
          }`}
        >
          {saveStatus === "saved" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span className="leading-tight">{statusMessage}</span>
        </div>
      )}

      {/* Action Buttons: Sheets Save & Route Map */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2 bg-muted/40 border-t border-border">
        <button
          onClick={handleSaveToSheets}
          disabled={saveStatus === "saving"}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 ${
            saveStatus === "saved"
              ? "bg-emerald-600 text-white"
              : "bg-[#107c41] text-white hover:bg-[#0c6b37]"
          }`}
          title="שמור תעודת משלוח מובנית ב-Google Sheets"
        >
          {saveStatus === "saving" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>שומר ב-Sheets...</span>
            </>
          ) : saveStatus === "saved" ? (
            <>
              <CheckCircle2 className="size-4" />
              <span>תעודה נשמרה ב-Sheets ✓</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="size-4" />
              <span>💾 רשום ושמור תעודת משלוח ב-Sheets</span>
            </>
          )}
        </button>

        {onShowRoute && (
          <button
            onClick={onShowRoute}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand/10 py-2.5 px-3 text-xs sm:text-sm font-bold text-brand transition hover:bg-brand/20 active:scale-95"
          >
            <Navigation className="size-4" />
            <span>🗺️ הצג מסלול במפה</span>
          </button>
        )}
      </div>
    </div>
  );
}
