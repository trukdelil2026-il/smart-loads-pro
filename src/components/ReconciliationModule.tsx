import * as React from "react";
import {
  INITIAL_MOCK_BATCH,
  type ScanBatchManifest,
  type SignedDeliveryDoc,
} from "@/lib/reconciliation";
import {
  FileText,
  Clock,
  Gauge,
  FolderCheck,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileCheck,
  Send,
  Building,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ReconciliationModuleProps {
  currentUserKey: string;
}

export function ReconciliationModule({ currentUserKey }: ReconciliationModuleProps) {
  const [batch, setBatch] = React.useState<ScanBatchManifest>(INITIAL_MOCK_BATCH);
  const [selectedDocId, setSelectedDocId] = React.useState<string>(batch.docs[0].docNumber);

  const selectedDoc = batch.docs.find((d) => d.docNumber === selectedDocId) || batch.docs[0];

  // Rami QC approval
  const handleApproveQC = (docNumber: string) => {
    const now = new Date().toLocaleString("he-IL", {
      dateStyle: "short",
      timeStyle: "short",
    });
    setBatch((prev) => ({
      ...prev,
      docs: prev.docs.map((d) =>
        d.docNumber === docNumber
          ? {
              ...d,
              status: "approved_by_rami",
              ramiApprovedAt: now,
            }
          : d,
      ),
    }));
    toast.success(`תעודה ${docNumber} נחתמה דיגיטלית: "נבדק ואושר ע״י ראמי"`);
  };

  // Lina Billing
  const handleLinaBill = (docNumber: string) => {
    const now = new Date().toLocaleString("he-IL", {
      dateStyle: "short",
      timeStyle: "short",
    });
    setBatch((prev) => ({
      ...prev,
      docs: prev.docs.map((d) =>
        d.docNumber === docNumber
          ? {
              ...d,
              status: "billed_by_lina",
              linaBilledAt: now,
            }
          : d,
      ),
    }));
    toast.success(`תעודה ${docNumber} נקלטה ע״י לינה וחוייבה בהצלחה בקומקס!`);
  };

  const handleApproveAllQC = () => {
    const now = new Date().toLocaleString("he-IL", {
      dateStyle: "short",
      timeStyle: "short",
    });
    setBatch((prev) => ({
      ...prev,
      docs: prev.docs.map((d) => ({
        ...d,
        status: d.status === "pending_qc" ? "approved_by_rami" : d.status,
        ramiApprovedAt: d.ramiApprovedAt || now,
      })),
    }));
    toast.success('כל התעודות הממתינות נחתמו דיגיטלית: "נבדק ואושר ע״י ראמי"');
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-6">
      {/* Chapter 5 Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <FileCheck className="size-5" />
            </span>
            <h2 className="text-xl font-black text-foreground">
              פרק 5: מודול פענוח סריקות, הצלבה ובקרת טכוגרף
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            קליטת קובץ סריקה מרוכז מגליה (scan...pdf) · אימות טכוגרף וזמני פריקת מנוף (15-30 דק׳) ·
            חיתוך ותיוק אוטומטי ב-Drive · חותמת QC של ראמי והעברה לחיוב ע״י לינה
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-1.5 text-xs">
            <UploadCloud className="size-4 text-brand" />
            <span className="font-bold text-foreground">קובץ סריקה פעיל:</span>
            <span className="font-mono text-muted-foreground">{batch.filename}</span>
          </div>
        </div>
      </div>

      {/* PDF Architecture & Tachograph Verification Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PDF Layout Banner */}
        <div className="rounded-2xl border border-border bg-muted/30 p-3.5 space-y-2">
          <div className="text-xs font-black text-foreground flex items-center gap-1.5">
            <FileText className="size-4 text-brand" />
            <span>ארכיטקטורת קובץ ה-PDF (סריקה מהחרש)</span>
          </div>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-brand" />
              <strong>דף 1:</strong> מניפסט יומי של מחסן 4 החרש.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-brand" />
              <strong>דפים 2 עד {batch.totalPages - 1}:</strong> תעודות משלוח חתומות ע״י הלקוחות.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-brand" />
              <strong>דף {batch.totalPages} (אחרון):</strong> דיסקית טכוגרף יומית של המשאית.
            </li>
          </ul>
        </div>

        {/* Tachograph Odometer Check */}
        <div className="rounded-2xl border border-border bg-muted/30 p-3.5 space-y-2">
          <div className="text-xs font-black text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Gauge className="size-4 text-blue-600" />
              <span>אימות מד אוץ וטכוגרף</span>
            </span>
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
              תואם בדיוק
            </span>
          </div>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>מד אוץ פתיחה וסגירה:</span>
              <span className="font-mono font-bold text-foreground">
                {batch.odometerStart.toLocaleString()} ➔ {batch.odometerEnd.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ק״מ דיסקית טכוגרף:</span>
              <span className="font-mono font-black text-foreground">
                {batch.tachographTotalKm} ק״מ
              </span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-1">
              <span>ק״מ ציר תנועה במערכת:</span>
              <span className="font-mono text-foreground">
                {batch.systemExpectedKm} ק״מ (סטייה מינורית {batch.kmVarianceKm} ק״מ בלבד)
              </span>
            </div>
          </div>
        </div>

        {/* Crane Unload Time Audit Rule */}
        <div className="rounded-2xl border border-border bg-emerald-500/10 p-3.5 space-y-2">
          <div className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <Clock className="size-4 text-emerald-600" />
            <span>אימות זמני פריקת מנוף (15-30 דק׳)</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            בדיקה אוטומטית המצליבה בין שעת הגעה בטכוגרף (עמידת מנוף עם PTO מופעל) לבין שעת החתימה
            בתעודה. טווח תקני של 15 עד 30 דקות מעיד על פריקה תקינה ללא עיכובים חריגים באתר.
          </p>
        </div>
      </div>

      {/* Main Delivery Notes Table & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 cols: Table of Signed Documents */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
              <span>תעודות משלוח שנקלטו מהסריקה ({batch.docs.length})</span>
            </h3>

            <button
              onClick={handleApproveAllQC}
              className="rounded-xl bg-brand px-3 py-1.5 text-xs font-black text-brand-foreground shadow-sm hover:opacity-90 transition"
            >
              אשר את כל התעודות (ראמי QC)
            </button>
          </div>

          <div className="space-y-2">
            {batch.docs.map((doc) => {
              const isSelected = doc.docNumber === selectedDoc.docNumber;
              return (
                <div
                  key={doc.docNumber}
                  onClick={() => setSelectedDocId(doc.docNumber)}
                  className={`cursor-pointer rounded-2xl border p-3 transition-all ${
                    isSelected
                      ? "border-purple-600 bg-purple-500/5 shadow-md ring-1 ring-purple-600/40"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-brand">
                          {doc.docNumber}
                        </span>
                        <span className="text-sm font-black text-foreground">{doc.clientName}</span>
                        <span className="text-[11px] rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground">
                          לקוח {doc.clientNumber}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {doc.destination} · נהג: {doc.driver}
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      {doc.status === "billed_by_lina" && (
                        <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-black text-white">
                          חוייב בקומקס
                        </span>
                      )}
                      {doc.status === "approved_by_rami" && (
                        <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[11px] font-black text-white">
                          אושר ע״י ראמי
                        </span>
                      )}
                      {doc.status === "pending_qc" && (
                        <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-black text-white">
                          ממתין לבקרת ראמי
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-border/50 flex flex-wrap items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>
                        חתימה: {doc.customerSignerName} ({doc.signedAtTime})
                      </span>
                      <span>זמן פריקה: {doc.craneMinutesDuration} דק׳ (תקני ✓)</span>
                    </div>
                    <span>עמוד {doc.pageInPdf} בקובץ ה-PDF</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 cols: Verification card & Digital QC Stamp */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
            <FolderCheck className="size-4 text-purple-600" />
            <span>תיקיית לקוח ותיוק ב-Drive</span>
          </h3>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">
            {/* Google Drive Path */}
            <div className="rounded-xl bg-muted/60 p-2.5 text-xs space-y-1">
              <span className="text-[11px] text-muted-foreground font-bold block">
                נתיב שמירה אוטומטי ב-Google Drive:
              </span>
              <div className="font-mono text-xs text-foreground font-bold break-all">
                {selectedDoc.driveFolderPath}
              </div>
            </div>

            {/* Document Details */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">מספר תעודת משלוח:</span>
                <span className="font-mono font-bold text-foreground">{selectedDoc.docNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">לקוח ויעד:</span>
                <span className="font-bold text-foreground">
                  {selectedDoc.clientName} ({selectedDoc.destination})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">חתימת מקבל:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedDoc.customerSignerName} ✓
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">החזרת פקדונות בשטח:</span>
                <span className="font-bold text-foreground">
                  {selectedDoc.baleDepositsReturned} בלות · {selectedDoc.palletDepositsReturned}{" "}
                  משטחי עץ
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">משך פריקת מנוף (טכוגרף):</span>
                <span className="font-bold text-foreground">
                  {selectedDoc.craneMinutesDuration} דקות (תקין בטווח 15-30 דק׳)
                </span>
              </div>
            </div>

            {/* Digital Stamp of Rami */}
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-3 text-center space-y-1.5">
              <div className="text-xs font-black text-blue-800 dark:text-blue-300">
                חותמת בקרת איכות (QC)
              </div>
              {selectedDoc.status !== "pending_qc" ? (
                <div className="inline-block rounded-xl border-2 border-blue-600 px-4 py-2 text-blue-700 dark:text-blue-300 font-black text-sm tracking-wide bg-blue-500/10 shadow-inner">
                  ✓ נבדק ואושר ע״י ראמי
                  <div className="text-[10px] font-normal text-muted-foreground mt-0.5">
                    {selectedDoc.ramiApprovedAt}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">טרם נחתם דיגיטלית ע״י ראמי</div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {selectedDoc.status === "pending_qc" && (
                <button
                  onClick={() => handleApproveQC(selectedDoc.docNumber)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand text-brand-foreground font-black py-2.5 text-xs shadow hover:opacity-90 transition"
                >
                  <CheckCircle2 className="size-4" />
                  <span>אשר וחתום דיגיטלית (ראמי QC)</span>
                </button>
              )}

              {selectedDoc.status === "approved_by_rami" && (
                <button
                  onClick={() => handleLinaBill(selectedDoc.docNumber)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white font-black py-2.5 text-xs shadow hover:bg-emerald-700 transition"
                >
                  <Send className="size-4" />
                  <span>העבר ללינה לחיוב סופי בקומקס</span>
                </button>
              )}

              {selectedDoc.status === "billed_by_lina" && (
                <div className="rounded-xl bg-emerald-500/10 p-2 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  ✓ התעודה חוייבה בקומקס ביום {selectedDoc.linaBilledAt}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
