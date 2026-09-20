import * as React from "react";
import {
  TrendingUp,
  Fuel,
  Truck,
  DollarSign,
  PieChart,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";
import { shekel } from "@/lib/pricing";
import { useSettings } from "@/lib/settings";

interface TripSummary {
  id: string;
  date: string;
  driver: string;
  truck: string;
  destination: string;
  catalogKm: number;
  actualKm: number;
  revenue: number;
  litersUsed: number;
  fuelCost: number;
  netMargin: number;
}

const SAMPLE_TRIPS: TripSummary[] = [
  {
    id: "TRIP-101",
    date: "היום 08:30",
    driver: "חכמת",
    truck: "מרצדס מנוף 12ט",
    destination: "סוקולוב, רמת השרון",
    catalogKm: 15,
    actualKm: 16,
    revenue: 350,
    litersUsed: 12.7, // round trip + PTO
    fuelCost: 82.5,
    netMargin: 267.5,
  },
  {
    id: "TRIP-102",
    date: "היום 10:15",
    driver: "עלי",
    truck: "איסוזו פלטה 5.5ט",
    destination: "ויצמן, כפר סבא",
    catalogKm: 12,
    actualKm: 12,
    revenue: 230,
    litersUsed: 4.0, // round trip 24km / 6
    fuelCost: 26.0,
    netMargin: 204.0,
  },
  {
    id: "TRIP-103",
    date: "היום 12:45",
    driver: "חכמת",
    truck: "מרצדס מנוף 12ט",
    destination: "אם המושבות, פ״ת",
    catalogKm: 15,
    actualKm: 17,
    revenue: 364,
    litersUsed: 13.3,
    fuelCost: 86.5,
    netMargin: 277.5,
  },
  {
    id: "TRIP-104",
    date: "היום 14:20",
    driver: "עלי",
    truck: "איסוזו פלטה 5.5ט",
    destination: "גבעת שמואל",
    catalogKm: 15,
    actualKm: 15,
    revenue: 250,
    litersUsed: 5.0,
    fuelCost: 32.5,
    netMargin: 217.5,
  },
];

export function SabanCeoDashboard() {
  const { settings } = useSettings();

  const totalRevenue = SAMPLE_TRIPS.reduce((acc, t) => acc + t.revenue, 0);
  const totalFuelCost = SAMPLE_TRIPS.reduce((acc, t) => acc + t.fuelCost, 0);
  const totalNetMargin = SAMPLE_TRIPS.reduce((acc, t) => acc + t.netMargin, 0);
  const totalLiters = SAMPLE_TRIPS.reduce((acc, t) => acc + t.litersUsed, 0);
  const avgMarginPercent = Math.round((totalNetMargin / totalRevenue) * 100);

  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-5" />
            </span>
            <h2 className="text-xl font-black text-foreground">
              לוח מחוונים מנהלים: רווחיות, סולר וביקורת קווי חלוקה (הראל - מנכ״ל)
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            מעקב חי: עלויות סולר לפי {settings.dieselNet} ₪ לליטר נקי · רווחיות מנוף (חכמת) מול פלטה
            (עלי) · התאמת מרחקים בפועל למחירון סבן
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
            מרווח תפעולי כולל: {avgMarginPercent}%
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-1">
          <span className="text-muted-foreground font-bold flex items-center gap-1.5">
            <DollarSign className="size-4 text-emerald-600" />
            <span>הכנסות הובלה היום:</span>
          </span>
          <div className="text-2xl font-black text-foreground">{shekel(totalRevenue)}</div>
          <span className="text-[10px] text-muted-foreground">לפני מע״מ 18%</span>
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-1">
          <span className="text-muted-foreground font-bold flex items-center gap-1.5">
            <Fuel className="size-4 text-rose-600" />
            <span>עלות סולר ישירה:</span>
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {shekel(totalFuelCost)}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {totalLiters.toFixed(1)} ליטר נצרכו
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-1">
          <span className="text-muted-foreground font-bold flex items-center gap-1.5">
            <TrendingUp className="size-4 text-brand" />
            <span>רווח תפעולי נקי:</span>
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {shekel(totalNetMargin)}
          </div>
          <span className="text-[10px] text-muted-foreground">לאחר ניכוי סולר נטו</span>
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-1">
          <span className="text-muted-foreground font-bold flex items-center gap-1.5">
            <Truck className="size-4 text-blue-600" />
            <span>תפוקת ציי רכב:</span>
          </span>
          <div className="text-2xl font-black text-foreground">{SAMPLE_TRIPS.length} סבבים</div>
          <span className="text-[10px] text-muted-foreground">2 מנוף + 2 פלטה</span>
        </div>
      </div>

      {/* Fleet Comparison: Mercedes Crane vs Isuzu Flatbed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mercedes Crane Card */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-brand/15 p-1 text-brand">
                <Truck className="size-4" />
              </span>
              <div>
                <span className="font-black text-foreground block">מרצדס 12 טון (מנוף ופריקה)</span>
                <span className="text-[11px] text-muted-foreground">
                  נהג: חכמת · סדרת ברקוד 18000
                </span>
              </div>
            </div>
            <span className="rounded-md bg-muted px-2 py-0.5 font-bold font-mono">615-41-002</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">צריכת דלק לנסיעה:</span>
              <span className="font-bold">3.2 ק״מ לליטר</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">צריכת PTO פריקת מנוף:</span>
              <span className="font-bold">4.5 ליטר לשעה (~2.7ל׳ לסבב)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">תעריף ק״מ חורג מעל בסיס:</span>
              <span className="font-bold">12 ₪ לק״מ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">קיבולת משקל מקסימלית:</span>
              <span className="font-bold">12,000 ק״ג</span>
            </div>
          </div>
        </div>

        {/* Isuzu Flatbed Card */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-500/15 p-1 text-blue-600">
                <Truck className="size-4" />
              </span>
              <div>
                <span className="font-black text-foreground block">
                  איסוזו 5.5 טון (הובלת פלטה)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  נהג: עלי · סדרת ברקוד 818000
                </span>
              </div>
            </div>
            <span className="rounded-md bg-muted px-2 py-0.5 font-bold font-mono">651-51-701</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">צריכת דלק לנסיעה:</span>
              <span className="font-bold">6.0 ק״מ לליטר</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">צריכת PTO פריקה:</span>
              <span className="font-bold">0 ליטר (פריקה ידנית / מלגזה)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">תעריף ק״מ חורג מעל בסיס:</span>
              <span className="font-bold">8 ₪ לק״מ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">קיבולת משקל מקסימלית:</span>
              <span className="font-bold">5,500 ק״ג</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trips Audit Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-foreground">
          יומן ביצוע וביקורת מרחקים בפועל מול מחירון סבן:
        </h3>

        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-xs text-right">
            <thead className="bg-muted/70 text-muted-foreground font-bold border-b border-border">
              <tr>
                <th className="p-2.5">סבב / שעה</th>
                <th className="p-2.5">נהג ומשאית</th>
                <th className="p-2.5">יעד</th>
                <th className="p-2.5">ק״מ מחירון / בפועל</th>
                <th className="p-2.5">הכנסה</th>
                <th className="p-2.5">עלות סולר</th>
                <th className="p-2.5">רווח נקי</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card">
              {SAMPLE_TRIPS.map((trip) => {
                const isKmVariance = trip.actualKm > trip.catalogKm;
                return (
                  <tr key={trip.id} className="hover:bg-muted/20">
                    <td className="p-2.5 font-bold">
                      <div className="font-mono text-[11px] text-muted-foreground">{trip.id}</div>
                      <div>{trip.date}</div>
                    </td>
                    <td className="p-2.5">
                      <div className="font-bold text-foreground">{trip.driver}</div>
                      <div className="text-[10px] text-muted-foreground">{trip.truck}</div>
                    </td>
                    <td className="p-2.5 font-bold">{trip.destination}</td>
                    <td className="p-2.5 font-mono">
                      <span>{trip.catalogKm} ק״מ</span> /{" "}
                      <span className={isKmVariance ? "text-amber-600 font-bold" : ""}>
                        {trip.actualKm} ק״מ
                      </span>
                      {isKmVariance && (
                        <span className="text-[10px] text-amber-600 block">
                          +{trip.actualKm - trip.catalogKm} ק״מ סטייה
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-foreground">
                      {shekel(trip.revenue)}
                    </td>
                    <td className="p-2.5 font-mono text-rose-600">{shekel(trip.fuelCost)}</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-600">
                      {shekel(trip.netMargin)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
