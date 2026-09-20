export interface ComaxItem {
  sku: number;
  name: string;
  category: "bulk" | "palletized" | "additive" | "general";
  unit: string;
  defaultWeightKg: number;
  requiresBale: boolean;
  requiresPallet: boolean;
  itemsPerPallet?: number;
  defaultPrice: number;
  aliases: string[];
}

export const COMAX_CATALOG: ComaxItem[] = [
  // Bulk materials requiring Bale 60002
  {
    sku: 10010,
    name: "חול ים / מחצבה בתפזורת (בלה)",
    category: "bulk",
    unit: "בלה",
    defaultWeightKg: 850,
    requiresBale: true,
    requiresPallet: false,
    defaultPrice: 120,
    aliases: ["חול", "חול ים", "חול מחצבה", "חול בלה", "בלות חול"],
  },
  {
    sku: 10020,
    name: "סומסום / מצע למילוי (בלה)",
    category: "bulk",
    unit: "בלה",
    defaultWeightKg: 900,
    requiresBale: true,
    requiresPallet: false,
    defaultPrice: 130,
    aliases: ["סומסום", "שומשום", "סומסום בלה", "מצע", "בלת סומסום"],
  },
  {
    sku: 10030,
    name: "טיט מוכן לבנייה (בלה)",
    category: "bulk",
    unit: "בלה",
    defaultWeightKg: 950,
    requiresBale: true,
    requiresPallet: false,
    defaultPrice: 160,
    aliases: ["טיט", "טיט מוכן", "בלת טיט", "טיט בלה"],
  },
  {
    sku: 10040,
    name: "עדש / חצץ 1 (בלה)",
    category: "bulk",
    unit: "בלה",
    defaultWeightKg: 950,
    requiresBale: true,
    requiresPallet: false,
    defaultPrice: 135,
    aliases: ["עדש", "חצץ", "חצץ 1", "בלת עדש"],
  },
  {
    sku: 10050,
    name: "טיע / אדמת גן בתפזורת",
    category: "bulk",
    unit: "בלה",
    defaultWeightKg: 800,
    requiresBale: true,
    requiresPallet: false,
    defaultPrice: 140,
    aliases: ["טיע", "אדמת גן", "אדמה חומה"],
  },

  // Palletized goods requiring Wooden Pallet 60060
  {
    sku: 20010,
    name: "מלט פורטלנד אפור 25 ק״ג (נשר)",
    category: "palletized",
    unit: "שק",
    defaultWeightKg: 25,
    requiresBale: false,
    requiresPallet: true,
    itemsPerPallet: 64, // 1600 kg
    defaultPrice: 18,
    aliases: ["מלט", "מלט אפור", "מלט נשר", "שקי מלט", "משטח מלט"],
  },
  {
    sku: 20020,
    name: "מלט לבן 25 ק״ג",
    category: "palletized",
    unit: "שק",
    defaultWeightKg: 25,
    requiresBale: false,
    requiresPallet: true,
    itemsPerPallet: 40,
    defaultPrice: 38,
    aliases: ["מלט לבן", "שק מלט לבן"],
  },
  {
    sku: 20030,
    name: "טיח תרמי / חוץ מוכן 25 ק״ג",
    category: "palletized",
    unit: "שק",
    defaultWeightKg: 25,
    requiresBale: false,
    requiresPallet: true,
    itemsPerPallet: 48,
    defaultPrice: 32,
    aliases: ["טיח", "טיח חוץ", "טיח תרמי", "טיח מוכן"],
  },
  {
    sku: 20040,
    name: "מליטה להדבקה ומילוי 25 ק״ג",
    category: "palletized",
    unit: "שק",
    defaultWeightKg: 25,
    requiresBale: false,
    requiresPallet: true,
    itemsPerPallet: 48,
    defaultPrice: 28,
    aliases: ["מליטה", "מליטה להדבקה"],
  },
  {
    sku: 30010,
    name: "דבק קרמיקה 603 מיסטר פיקס (25 ק״ג)",
    category: "palletized",
    unit: "שק",
    defaultWeightKg: 25,
    requiresBale: false,
    requiresPallet: true,
    itemsPerPallet: 48,
    defaultPrice: 34,
    aliases: ["דבק 603", "603", "מיסטר פיקס 603", "דבק קרמיקה 603"],
  },
  {
    sku: 30020,
    name: "דבק שיש 109 / 114 (25 ק״ג)",
    category: "palletized",
    unit: "שק",
    defaultWeightKg: 25,
    requiresBale: false,
    requiresPallet: true,
    itemsPerPallet: 48,
    defaultPrice: 42,
    aliases: ["דבק 109", "109", "דבק 114", "114"],
  },
  {
    sku: 40010,
    name: "בלוק בטון תקני 20/20/40 (משטח)",
    category: "palletized",
    unit: "משטח",
    defaultWeightKg: 1400,
    requiresBale: false,
    requiresPallet: true,
    itemsPerPallet: 1,
    defaultPrice: 380,
    aliases: ["בלוקים", "בלוק 20", "משטח בלוקים", "בלוק בטון"],
  },
  {
    sku: 50010,
    name: "רשת אינטרגלס כחולה לחיפוי וטיח 50 מ״ר",
    category: "general",
    unit: "גליל",
    defaultWeightKg: 8,
    requiresBale: false,
    requiresPallet: false,
    defaultPrice: 110,
    aliases: ["רשת אינטרגלס", "אינטרגלס", "רשת כחולה", "רשת לטיח"],
  },
];

// Packaging Deposits Protocol
export const DEPOSITS = {
  BALE_SKU: 60002,
  BALE_NAME: "שק גדול בלה (אריזה חוזרת)",
  BALE_PRICE: 50,

  PALLET_SKU: 60060,
  PALLET_NAME: "משטח עץ סבן תקני (אריזה חוזרת)",
  PALLET_PRICE: 35,
};

export interface ParsedItemResult {
  sku: number;
  name: string;
  unit: string;
  qty: number;
  unitWeightKg: number;
  totalWeightKg: number;
  unitPrice: number;
  totalPrice: number;
  requiresBale: boolean;
  requiresPallet: boolean;
  balesCount: number;
  palletsCount: number;
  rawMatchedText: string;
}

export interface NormalizationReport {
  originalText: string;
  items: ParsedItemResult[];
  totalWeightKg: number;
  totalItemsPrice: number;
  balesCharged: number;
  balesDepositSum: number;
  palletsCharged: number;
  palletsDepositSum: number;
  grandTotal: number;
  exemptionsApplied: string[];
}

/**
 * Parses free text (e.g. from contractor WhatsApp message) into Comax items,
 * calculating weights, bulk bales, and wooden pallet packaging standards.
 */
export function parseContractorOrder(
  text: string,
  truckKind: "crane" | "flatbed" = "crane",
  manualOffloadExemption = false,
): NormalizationReport {
  const lines = text
    .split(/[\n,;]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const parsedItems: ParsedItemResult[] = [];
  const exemptions: string[] = [];

  for (const line of lines) {
    // Extract quantity if present, e.g. "4 בלות טיט", "3 משטחים מלט", "20 דבק 603"
    const numMatch = line.match(/(\d+(\.\d+)?)/);
    const qty = numMatch ? parseFloat(numMatch[1]) : 1;

    let matchedItem: ComaxItem | null = null;
    let longestMatchLen = 0;

    for (const item of COMAX_CATALOG) {
      for (const alias of item.aliases) {
        if (line.includes(alias) && alias.length > longestMatchLen) {
          matchedItem = item;
          longestMatchLen = alias.length;
        }
      }
    }

    if (matchedItem) {
      const isPalletOrder = line.includes("משטח") || line.includes("משטחי");
      let calculatedWeight = matchedItem.defaultWeightKg * qty;
      let calculatedPallets = 0;
      let calculatedBales = 0;

      if (matchedItem.requiresBale) {
        calculatedBales = qty;
      }

      if (matchedItem.requiresPallet) {
        if (isPalletOrder || matchedItem.unit === "משטח") {
          calculatedPallets = qty;
          calculatedWeight = (matchedItem.itemsPerPallet || 1) * matchedItem.defaultWeightKg * qty;
        } else if (matchedItem.itemsPerPallet && matchedItem.itemsPerPallet > 1) {
          calculatedPallets = Math.ceil(qty / matchedItem.itemsPerPallet);
        } else {
          calculatedPallets = qty;
        }
      }

      parsedItems.push({
        sku: matchedItem.sku,
        name: matchedItem.name,
        unit: matchedItem.unit,
        qty,
        unitWeightKg: matchedItem.defaultWeightKg,
        totalWeightKg: calculatedWeight,
        unitPrice: matchedItem.defaultPrice,
        totalPrice: matchedItem.defaultPrice * qty,
        requiresBale: matchedItem.requiresBale,
        requiresPallet: matchedItem.requiresPallet,
        balesCount: calculatedBales,
        palletsCount: calculatedPallets,
        rawMatchedText: line,
      });
    }
  }

  // Calculate deposit counts
  let totalBales = parsedItems.reduce((acc, i) => acc + i.balesCount, 0);
  const totalPallets = parsedItems.reduce((acc, i) => acc + i.palletsCount, 0);

  // Apply Exemption Rule: Ali's flatbed truck with manual offloading
  if (truckKind === "flatbed" || manualOffloadExemption) {
    if (totalBales > 0) {
      exemptions.push("פטור מפילוד בלבד: הובלת פלטה של עלי / פריקה ידנית פטורה מפקדון בלות");
      totalBales = 0;
    }
  }

  const balesDepositSum = totalBales * DEPOSITS.BALE_PRICE;
  const palletsDepositSum = totalPallets * DEPOSITS.PALLET_PRICE;
  const totalItemsPrice = parsedItems.reduce((acc, i) => acc + i.totalPrice, 0);
  const totalWeightKg = parsedItems.reduce((acc, i) => acc + i.totalWeightKg, 0);

  return {
    originalText: text,
    items: parsedItems,
    totalWeightKg,
    totalItemsPrice,
    balesCharged: totalBales,
    balesDepositSum,
    palletsCharged: totalPallets,
    palletsDepositSum,
    grandTotal: totalItemsPrice + balesDepositSum + palletsDepositSum,
    exemptionsApplied: exemptions,
  };
}
