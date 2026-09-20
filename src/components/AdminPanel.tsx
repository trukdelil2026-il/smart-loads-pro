import { X } from "lucide-react";
import { useSettings } from "@/lib/settings";
import { TRUCKS, ZONES } from "@/lib/catalog";

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const { settings, update } = useSettings();

  const field =
    "w-full rounded-xl border border-input bg-background px-3 py-3 text-base text-foreground";

  return (
    <div className="fixed inset-0 z-[3000] flex flex-col bg-background">
      <header className="flex items-center gap-3 bg-brand px-4 py-3 text-brand-foreground">
        <button aria-label="סגור" onClick={onClose} className="rounded-full p-2 hover:bg-white/10">
          <X className="size-6" />
        </button>
        <div>
          <div className="text-lg font-bold">מסך ניהול</div>
          <div className="text-xs opacity-90">הגדרות פנימיות — ראמי ויואב בלבד</div>
        </div>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <section className="space-y-2">
          <label className="block font-bold">שער סולר נטו לליטר (₪)</label>
          <input
            type="number"
            step="0.01"
            className={field}
            value={settings.dieselNet}
            onChange={(e) => update({ dieselNet: Number(e.target.value) || 0 })}
          />
        </section>

        <section className="space-y-2">
          <label className="block font-bold">שיעור מע״מ</label>
          <div className="flex gap-2">
            {[17, 18].map((v) => (
              <button
                key={v}
                onClick={() => update({ vatRate: v })}
                className={`flex-1 rounded-xl px-4 py-3 text-base font-bold ring-1 ring-border ${
                  settings.vatRate === v ? "bg-brand text-brand-foreground" : "bg-card"
                }`}
              >
                {v}%
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <label className="block font-bold">Gemini API Key</label>
          <input
            type="password"
            className={field}
            placeholder="AIza..."
            value={settings.geminiKey}
            onChange={(e) => update({ geminiKey: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            אופציונלי. מוקד נועה עובד כברירת מחדל דרך מוקד ה-AI המשולב של המערכת.
          </p>
        </section>

        <section className="space-y-2">
          <label className="block font-bold">Google Apps Script Web App URL</label>
          <input
            type="url"
            className={field}
            placeholder="https://script.google.com/macros/s/..."
            value={settings.appsScriptUrl}
            onChange={(e) => update({ appsScriptUrl: e.target.value })}
          />
        </section>

        <section className="space-y-2">
          <div className="font-bold">מפרט משאיות</div>
          {Object.values(TRUCKS).map((t) => (
            <div key={t.kind} className="rounded-xl bg-card p-3 text-sm ring-1 ring-border">
              <div className="font-bold">
                {t.name} · {t.driver}
              </div>
              <div className="text-muted-foreground">
                סדרה {t.series} · {t.kmPerLiter} ק"מ לליטר · PTO {t.ptoLitersPerHour} ל'/שעה · תוספת{" "}
                {t.extraKmRate} ₪ לק"מ עודף
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-2">
          <div className="font-bold">מחירון אזורים ({ZONES.length} אזורים)</div>
          <div className="max-h-80 overflow-y-auto rounded-xl ring-1 ring-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted text-muted-foreground">
                <tr>
                  <th className="p-2 text-right">אזור</th>
                  <th className="p-2">מנוף</th>
                  <th className="p-2">ק"מ</th>
                  <th className="p-2">מחיר</th>
                </tr>
              </thead>
              <tbody>
                {ZONES.map((z) => (
                  <tr key={z.code} className="border-t border-border">
                    <td className="p-2 text-right">{z.name}</td>
                    <td className="p-2 text-center">{z.code}</td>
                    <td className="p-2 text-center">{z.km}</td>
                    <td className="p-2 text-center">{z.cranePrice} ₪</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
