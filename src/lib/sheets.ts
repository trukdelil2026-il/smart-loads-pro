import { useSettings } from "./settings";

export interface DeliveryDocPayload {
  timestamp: string;
  user: "ראמי" | "יואב" | "הראל" | "משתמש";
  destination: string;
  area: string;
  barcode: number;
  truck: string;
  driver: string;
  distanceKm: number;
  fuelLiters: number;
  fuelCost: number;
  finalPriceBeforeVat: number;
  finalPriceWithVat: number;
  vatRate: number;
}

export async function saveDeliveryDocToSheets(
  payload: DeliveryDocPayload,
  appsScriptUrl?: string,
): Promise<{ success: boolean; message: string }> {
  const url = appsScriptUrl?.trim() || "";

  if (!url) {
    // If no URL configured yet, save locally to localStorage delivery log
    try {
      const existing = JSON.parse(localStorage.getItem("saban_saved_delivery_docs") || "[]");
      existing.unshift(payload);
      localStorage.setItem("saban_saved_delivery_docs", JSON.stringify(existing.slice(0, 100)));
      return {
        success: true,
        message:
          "נשמר בהצלחה ביומן תעודות משלוח מקומי (להגדרת גיליון Google Sheets הכנס כתובת במסך ניהול)",
      };
    } catch {
      return { success: false, message: "שגיאה בשמירה מקומית" };
    }
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // Also cache locally
      try {
        const existing = JSON.parse(localStorage.getItem("saban_saved_delivery_docs") || "[]");
        existing.unshift(payload);
        localStorage.setItem("saban_saved_delivery_docs", JSON.stringify(existing.slice(0, 100)));
      } catch {
        /* ignore */
      }
      return { success: true, message: "נרשם ונשמר ב-Google Sheets בהצלחה!" };
    } else {
      return {
        success: false,
        message: `תגובת שרת Google Sheets לא תקינה (${res.status})`,
      };
    }
  } catch (err) {
    console.error("Failed to post to Google Sheets:", err);
    // Fallback save locally
    try {
      const existing = JSON.parse(localStorage.getItem("saban_saved_delivery_docs") || "[]");
      existing.unshift(payload);
      localStorage.setItem("saban_saved_delivery_docs", JSON.stringify(existing.slice(0, 100)));
      return {
        success: true,
        message: "נשמר ביומן המקומי (קריאת הרשת ל-Google Sheets נחסמה או דורשת CORS)",
      };
    } catch {
      return { success: false, message: "שגיאת תקשורת עם Google Sheets" };
    }
  }
}
