export type UserRoleKey =
  "rami" | "yoav" | "harel" | "vered" | "itzik_oren" | "hekmat" | "ali" | "galia" | "lina";

export interface UserRole {
  key: UserRoleKey;
  name: string;
  title: string;
  department: string;
  avatar: string;
  color: string;
  badge: string;
  scopeDescription: string;
  canApproveDispatch: boolean;
  canIssuePricing: boolean;
  canViewFinancials: boolean;
  canAuditQC: boolean;
  canManageWarehouse: boolean;
  canDriveAndDeliver: boolean;
  canScanDocs: boolean;
  canCloseComaxBilling: boolean;
}

export const USER_ROLES: Record<UserRoleKey, UserRole> = {
  rami: {
    key: "rami",
    name: "ראמי מסארוה",
    title: "סדרן ראשי ומנהל המערכת (Admin / Dispatcher)",
    department: "סידור עבודה ולוגיסטיקה",
    avatar: "ר",
    color: "#0284c7",
    badge: "סדרן ראשי & מנהל מערכת",
    scopeDescription:
      "אישור סבבים, קביעת שיבוצים, אישור חריגות משקל ומרחק, ובקרת איכות (QC) עם החתמה דיגיטלית.",
    canApproveDispatch: true,
    canIssuePricing: true,
    canViewFinancials: true,
    canAuditQC: true,
    canManageWarehouse: true,
    canDriveAndDeliver: false,
    canScanDocs: true,
    canCloseComaxBilling: true,
  },
  yoav: {
    key: "yoav",
    name: "יואב שגיב",
    title: "מנהל מכירות / דלפק",
    department: "מכירות והזמנות",
    avatar: "י",
    color: "#059669",
    badge: "מכירות & דלפק",
    scopeDescription:
      "הזנת הזמנות לקוחות, שאילתות תמחור מהירות, בדיקת פקדונות ותיאום אספקות מיוחדות.",
    canApproveDispatch: false,
    canIssuePricing: true,
    canViewFinancials: false,
    canAuditQC: false,
    canManageWarehouse: false,
    canDriveAndDeliver: false,
    canScanDocs: false,
    canCloseComaxBilling: false,
  },
  harel: {
    key: "harel",
    name: "הראל אידלסון",
    title: 'מנכ"ל',
    department: "הנהלה ראשית",
    avatar: "ה",
    color: "#7c3aed",
    badge: 'מנכ"ל החברה',
    scopeDescription:
      "דוחות ביצוע, רווחיות קווי חלוקה, תמחור סולר, אישור חריגות תקציביות ומעקב יעדים.",
    canApproveDispatch: true,
    canIssuePricing: true,
    canViewFinancials: true,
    canAuditQC: true,
    canManageWarehouse: false,
    canDriveAndDeliver: false,
    canScanDocs: false,
    canCloseComaxBilling: false,
  },
  vered: {
    key: "vered",
    name: "ורד אידלסון",
    title: "מערכות מידע, בקרה ותהליכים",
    department: "מחשוב ובקרה",
    avatar: "ו",
    color: "#d97706",
    badge: "מערכות מידע & בקרה",
    scopeDescription:
      "קבלת דוחות סבב יומיים, בקרת אחידות נתונים, אבטחת גיליונות ומעקב תהליכים שוטף.",
    canApproveDispatch: false,
    canIssuePricing: true,
    canViewFinancials: true,
    canAuditQC: true,
    canManageWarehouse: false,
    canDriveAndDeliver: false,
    canScanDocs: true,
    canCloseComaxBilling: false,
  },
  itzik_oren: {
    key: "itzik_oren",
    name: "איציק זהבי ואורן",
    title: "ניהול סניף ומחסן 4 (החרש)",
    department: "מחסן 4 וחצר החרש",
    avatar: "א",
    color: "#ea580c",
    badge: "ניהול מחסן 4 והעמסה",
    scopeDescription: "בקרת עומסים, הכנת משטחים והעמסה לחצר לפי סדר פריקה מותאם ציר תנועה (LIFO).",
    canApproveDispatch: false,
    canIssuePricing: false,
    canViewFinancials: false,
    canAuditQC: false,
    canManageWarehouse: true,
    canDriveAndDeliver: false,
    canScanDocs: false,
    canCloseComaxBilling: false,
  },
  hekmat: {
    key: "hekmat",
    name: "חכמת",
    title: "נהג משאית מנוף מרצדס 12 טון (615-41-002)",
    department: "צי הובלות - מנוף",
    avatar: "ח",
    color: "#2563eb",
    badge: "נהג מנוף מרצדס 12 טון",
    scopeDescription:
      "קבלת משימות בוואטסאפ, ניווט Waze ישיר, פריקות מנוף (PTO), רישום החזרת פקדונות והחתמת תעודות.",
    canApproveDispatch: false,
    canIssuePricing: false,
    canViewFinancials: false,
    canAuditQC: false,
    canManageWarehouse: false,
    canDriveAndDeliver: true,
    canScanDocs: false,
    canCloseComaxBilling: false,
  },
  ali: {
    key: "ali",
    name: "עלי",
    title: "נהג משאית פלטה איסוזו 5.5 טון (651-51-701)",
    department: "צי הובלות - פלטה",
    avatar: "ע",
    color: "#0891b2",
    badge: "נהג פלטה איסוזו 5.5 טון",
    scopeDescription:
      "הובלות פלטה ללא פריקת מנוף (פטור אוטומטי מבלות), פריקה ידנית, החתמת תעודות ומעקב ק״מ.",
    canApproveDispatch: false,
    canIssuePricing: false,
    canViewFinancials: false,
    canAuditQC: false,
    canManageWarehouse: false,
    canDriveAndDeliver: true,
    canScanDocs: false,
    canCloseComaxBilling: false,
  },
  galia: {
    key: "galia",
    name: "גליה יששכר רפאלי",
    title: "קליטה וסריקה מרוכזת מהחרש",
    department: "תפעול וסריקות",
    avatar: "ג",
    color: "#db2777",
    badge: "קליטת סריקות מרוכזות",
    scopeDescription:
      "קבלת קובצי סריקה מרוכזים מהחרש (scan...pdf), פיצול תעודות, הצלבת מניפסט ודיסקית טכוגרף.",
    canApproveDispatch: false,
    canIssuePricing: false,
    canViewFinancials: false,
    canAuditQC: false,
    canManageWarehouse: false,
    canDriveAndDeliver: false,
    canScanDocs: true,
    canCloseComaxBilling: false,
  },
  lina: {
    key: "lina",
    name: "לינה",
    title: "הנהלת חשבונות",
    department: "כספים וגבייה",
    avatar: "ל",
    color: "#4f46e5",
    badge: "הנהלת חשבונות & קומקס",
    scopeDescription:
      "קליטת תעודות מאומתות שאושרו ע״י ראמי, זיכויי פקדונות וסגירת חיוב לקוח סופי להפקת חשבונית.",
    canApproveDispatch: false,
    canIssuePricing: false,
    canViewFinancials: true,
    canAuditQC: false,
    canManageWarehouse: false,
    canDriveAndDeliver: false,
    canScanDocs: true,
    canCloseComaxBilling: true,
  },
};
