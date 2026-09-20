export interface SignedDeliveryDoc {
  docNumber: string;
  clientNumber: string;
  clientName: string;
  destination: string;
  driver: string;
  truckPlate: string;
  pageInPdf: number;
  signedAtTime: string;
  customerSignerName: string;
  signatureCaptured: boolean;
  baleDepositsReturned: number;
  palletDepositsReturned: number;
  craneMinutesDuration: number;
  craneTimeWithinSpec: boolean; // 15-30 min standard
  driveFolderPath: string;
  status: "pending_qc" | "approved_by_rami" | "billed_by_lina";
  ramiApprovedAt?: string;
  linaBilledAt?: string;
}

export interface ScanBatchManifest {
  batchId: string;
  filename: string;
  uploadedAt: string;
  uploadedBy: string; // גליה יששכר רפאלי
  totalPages: number;
  warehouseManifestPage: number; // Page 1
  signedDocsPages: string; // Pages 2 to N-1
  tachographPage: number; // Page N
  odometerStart: number;
  odometerEnd: number;
  tachographTotalKm: number;
  systemExpectedKm: number;
  kmVarianceKm: number;
  kmMatchStatus: "perfect" | "minor_variance" | "discrepancy";
  docs: SignedDeliveryDoc[];
}

export const INITIAL_MOCK_BATCH: ScanBatchManifest = {
  batchId: "BATCH-2026-0920",
  filename: "scan_harash_20260920_001.pdf",
  uploadedAt: "2026-09-20 14:35",
  uploadedBy: "גליה יששכר רפאלי",
  totalPages: 6,
  warehouseManifestPage: 1,
  signedDocsPages: "עמודים 2 עד 5",
  tachographPage: 6,
  odometerStart: 184520,
  odometerEnd: 184618,
  tachographTotalKm: 98,
  systemExpectedKm: 96,
  kmVarianceKm: 2,
  kmMatchStatus: "perfect",
  docs: [
    {
      docNumber: "DOC-88410",
      clientNumber: "10452",
      clientName: "אחים ששון קבלני שלד בע״מ",
      destination: "ויצמן 42, רעננה",
      driver: "חכמת (מרצדס 615-41-002)",
      truckPlate: "615-41-002",
      pageInPdf: 2,
      signedAtTime: "08:45",
      customerSignerName: "איציק ששון (מנהל עבודה)",
      signatureCaptured: true,
      baleDepositsReturned: 3,
      palletDepositsReturned: 4,
      craneMinutesDuration: 22,
      craneTimeWithinSpec: true,
      driveFolderPath: "תיקיות לקוחות ח.סבן / [10452 - אחים ששון] / 2. תעודות משלוח",
      status: "approved_by_rami",
      ramiApprovedAt: "2026-09-20 15:10",
      linaBilledAt: "2026-09-20 15:30",
    },
    {
      docNumber: "DOC-88411",
      clientNumber: "10984",
      clientName: "אלון שיפוצים ויזמות",
      destination: "סוקולוב 15, רמת השרון",
      driver: "חכמת (מרצדס 615-41-002)",
      truckPlate: "615-41-002",
      pageInPdf: 3,
      signedAtTime: "10:15",
      customerSignerName: "אלון כהן",
      signatureCaptured: true,
      baleDepositsReturned: 0,
      palletDepositsReturned: 2,
      craneMinutesDuration: 18,
      craneTimeWithinSpec: true,
      driveFolderPath: "תיקיות לקוחות ח.סבן / [10984 - אלון שיפוצים] / 2. תעודות משלוח",
      status: "approved_by_rami",
      ramiApprovedAt: "2026-09-20 15:12",
    },
    {
      docNumber: "DOC-88412",
      clientNumber: "11230",
      clientName: "גבאי בנייה וגמרים",
      destination: "הבנים 88, הוד השרון",
      driver: "חכמת (מרצדס 615-41-002)",
      truckPlate: "615-41-002",
      pageInPdf: 4,
      signedAtTime: "11:40",
      customerSignerName: "מוחמד (מנהל אתר)",
      signatureCaptured: true,
      baleDepositsReturned: 5,
      palletDepositsReturned: 6,
      craneMinutesDuration: 28,
      craneTimeWithinSpec: true,
      driveFolderPath: "תיקיות לקוחות ח.סבן / [11230 - גבאי בנייה] / 2. תעודות משלוח",
      status: "pending_qc",
    },
    {
      docNumber: "DOC-88413",
      clientNumber: "11504",
      clientName: "רוזנברג הנדסה אזרחית",
      destination: "בן גוריון 12, הרצליה",
      driver: "חכמת (מרצדס 615-41-002)",
      truckPlate: "615-41-002",
      pageInPdf: 5,
      signedAtTime: "13:20",
      customerSignerName: "יובל רוזנברג",
      signatureCaptured: true,
      baleDepositsReturned: 2,
      palletDepositsReturned: 0,
      craneMinutesDuration: 25,
      craneTimeWithinSpec: true,
      driveFolderPath: "תיקיות לקוחות ח.סבן / [11504 - רוזנברג הנדסה] / 2. תעודות משלוח",
      status: "pending_qc",
    },
  ],
};
