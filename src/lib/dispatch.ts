export interface DispatchStop {
  id: string;
  orderNumber: string;
  clientName: string;
  destinationAddress: string;
  city: string;
  contactName: string;
  contactPhone: string;
  itemsSummary: string;
  weightKg: number;
  craneRequired: boolean;
  notes?: string;
  deliveryTimeWindow?: string;
  status: "pending" | "loaded" | "en_route" | "delivered" | "failed";
}

export interface DriverVehicleSpec {
  driverName: string;
  phone: string;
  truckModel: string;
  licensePlate: string;
  maxPayloadKg: number;
  truckKind: "crane" | "flatbed";
  barcodeSeries: string;
}

export const DRIVER_FLEET: Record<"hekmat" | "ali", DriverVehicleSpec> = {
  hekmat: {
    driverName: "חכמת",
    phone: "050-7654321",
    truckModel: "מרצדס 12 טון (מנוף ופריקה)",
    licensePlate: "615-41-002",
    maxPayloadKg: 12000,
    truckKind: "crane",
    barcodeSeries: "18000",
  },
  ali: {
    driverName: "עלי",
    phone: "052-8765432",
    truckModel: "איסוזו 5.5 טון (פלטה והובלה)",
    licensePlate: "651-51-701",
    maxPayloadKg: 5500,
    truckKind: "flatbed",
    barcodeSeries: "818000",
  },
};

export interface RouteManifest {
  id: string;
  driverKey: "hekmat" | "ali";
  date: string;
  assignedBy: string;
  stops: DispatchStop[];
  totalWeightKg: number;
  weightUtilizationPct: number;
  isOverloaded: boolean;
  loadingOrderLIFO: Array<{
    loadStep: number;
    unloadStopOrder: number;
    stop: DispatchStop;
    positionOnTruck: string;
  }>;
}

export function buildRouteManifest(
  driverKey: "hekmat" | "ali",
  stops: DispatchStop[],
  assignedBy = "ראמי מסארוה",
): RouteManifest {
  const spec = DRIVER_FLEET[driverKey];
  const totalWeightKg = stops.reduce((sum, s) => sum + s.weightKg, 0);
  const weightUtilizationPct = Math.round((totalWeightKg / spec.maxPayloadKg) * 100);
  const isOverloaded = totalWeightKg > spec.maxPayloadKg;

  // LIFO Rule:
  // Stops are ordered by trip order [1st stop, 2nd stop, 3rd stop...]
  // At warehouse 4 (החרש 10), loading happens in REVERSE:
  // The last stop to unload is loaded FIRST (front/deep on flatbed).
  // The first stop to unload is loaded LAST (rear/top for instant unloading).
  const reversed = [...stops].reverse();
  const loadingOrderLIFO = reversed.map((stop, idx) => {
    const unloadIndex = stops.findIndex((s) => s.id === stop.id) + 1;
    let position = "";
    if (idx === 0) {
      position = "עומק המרכב / קדמת המשאית (מועמס 1, נפרק אחרון)";
    } else if (idx === reversed.length - 1) {
      position = "דלת אחורית / עליון (מועמס אחרון, נפרק ראשון!)";
    } else {
      position = `מרכז המרכב (שלב העמסה ${idx + 1})`;
    }

    return {
      loadStep: idx + 1,
      unloadStopOrder: unloadIndex,
      stop,
      positionOnTruck: position,
    };
  });

  return {
    id: `MAN-${Date.now().toString().slice(-6)}`,
    driverKey,
    date: new Date().toLocaleDateString("he-IL"),
    assignedBy,
    stops,
    totalWeightKg,
    weightUtilizationPct,
    isOverloaded,
    loadingOrderLIFO,
  };
}

/**
 * Creates the exact formatted WhatsApp text message for the driver with Waze link
 */
export function generateDriverWhatsAppCard(
  stop: DispatchStop,
  driverSpec: DriverVehicleSpec,
  stopIndex: number,
  totalStops: number,
): { messageText: string; wazeUrl: string; waUrl: string } {
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(stop.destinationAddress + " " + stop.city)}`;

  const lines = [
    `🏗️ *כרטיס משימה ח. סבן | תחנה ${stopIndex} מתוך ${totalStops}*`,
    `נהג: *${driverSpec.driverName}* (${driverSpec.licensePlate})`,
    `--------------------------------`,
    `📄 *הזמנה מס':* ${stop.orderNumber}`,
    `👤 *לקוח:* ${stop.clientName}`,
    `📍 *כתובת יעד:* ${stop.destinationAddress}, ${stop.city}`,
    `📞 *איש קשר באתר:* ${stop.contactName} - ${stop.contactPhone}`,
    `📦 *פירוט מטען:* ${stop.itemsSummary}`,
    `⚖️ *משקל משוער:* ${stop.weightKg.toLocaleString()} ק"ג`,
    `⚙️ *סוג פריקה:* ${stop.craneRequired ? "מנוף מרצדס (PTO)" : "הורדה ידנית/פלטה"}`,
    stop.notes ? `⚠️ *הערות גישה:* ${stop.notes}` : "",
    `--------------------------------`,
    `🧭 *ניווט Waze ישיר לאתר:*`,
    wazeUrl,
    `--------------------------------`,
    `מוקד ח. סבן: החרש 10, הוד השרון | סדרן: ראמי מסארוה`,
  ].filter(Boolean);

  const messageText = lines.join("\n");
  const cleanPhone = driverSpec.phone.replace(/[^0-9]/g, "");
  const intlPhone = cleanPhone.startsWith("0") ? `972${cleanPhone.slice(1)}` : cleanPhone;
  const waUrl = `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(messageText)}`;

  return { messageText, wazeUrl, waUrl };
}

/**
 * Dispatches the mission to Make (Integromat) Webhook
 */
export async function sendMissionToMakeWebhook(
  payload: {
    orderNumber: string;
    driver: string;
    licensePlate: string;
    client: string;
    address: string;
    phone: string;
    items: string;
    weightKg: number;
    wazeLink: string;
  },
  webhookUrl?: string,
): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.trim()) {
    return {
      success: true,
      message: "הכרטיס מוכן לשידור (טרם הוגדר Webhook של Make - ניתן לשלוח בוואטסאפ ישיר)",
    };
  }

  try {
    const res = await fetch(webhookUrl.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return { success: true, message: "הכרטיס שודר בהצלחה ל-Make Webhook!" };
    }
    return { success: false, message: `תקלה בשרת Make (${res.status})` };
  } catch {
    return { success: false, message: "שגיאת רשת בשידור ל-Make Webhook" };
  }
}
