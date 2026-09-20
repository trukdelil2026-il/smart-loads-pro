import { shekel, type Quote } from "@/lib/pricing";

export function QuoteCard({
  quote,
  onShowRoute,
}: {
  quote: Quote;
  onShowRoute?: (() => void) | undefined;
}) {
  return (
    <div className="mt-2 overflow-hidden rounded-2xl bg-card text-card-foreground ring-1 ring-border">
      <div className="bg-brand px-3 py-2 text-brand-foreground">
        <div className="text-base font-bold">{quote.zoneName}</div>
        <div className="text-xs opacity-90">מגרש סבן · החרש 10, הוד השרון</div>
      </div>
      <dl className="divide-y divide-border text-sm">
        <Row label='מק"ט / ברקוד' value={String(quote.barcode)} strong />
        <Row label="משאית ונהג" value={`${quote.truckName} · ${quote.driver}`} />
        <Row label="מרחק" value={`${quote.km} ק"מ (הלוך-חזור ${quote.roundTripKm})`} />
        <Row
          label="סולר מוערך"
          value={`${quote.liters} ליטר · ${shekel(quote.fuelCost)}`}
        />
        <Row label="זמן הגעה מוערך" value={`${quote.etaMinutes} דקות`} />
        {quote.extraKm > 0 && (
          <Row
            label="תוספת מרחק"
            value={`${quote.extraKm} ק"מ עודף · ${shekel(quote.extraKmCost)}`}
          />
        )}
        <Row label="מחיר לפני מע״מ" value={shekel(quote.priceBeforeVat)} />
        <Row label="מע״מ" value={shekel(quote.vat)} />
        <Row label="סה״כ כולל מע״מ" value={shekel(quote.priceWithVat)} strong big />
      </dl>
      {onShowRoute && (
        <button
          onClick={onShowRoute}
          className="w-full bg-brand/10 px-3 py-3 text-base font-bold text-brand transition hover:bg-brand/20"
        >
          🗺️ הצג מסלול במפה
        </button>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  big,
}: {
  label: string;
  value: string;
  strong?: boolean;
  big?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={`text-left ${strong ? "font-bold" : ""} ${big ? "text-lg text-brand" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
