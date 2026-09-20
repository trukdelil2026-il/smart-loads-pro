import { TRUCKS, type TruckKind, type Zone, flatbedCode, flatbedPrice } from "./catalog";

export interface PricingInput {
  zone: Zone;
  truck: TruckKind;
  dieselNet: number;
  vatRate: number;
  actualKm?: number;
}

export interface Quote {
  zoneName: string;
  district: string;
  mainDistrict: string;
  barcode: number;
  truckName: string;
  driver: string;
  km: number;
  roundTripKm: number;
  liters: number;
  fuelCost: number;
  avgFuelCost: number;
  avgDieselLiters: number;
  basePrice: number;
  extraKm: number;
  extraKmCost: number;
  priceBeforeVat: number;
  vat: number;
  priceWithVat: number;
  etaMinutes: number;
}

export function calculateAvgFuelCost(km: number, dieselNet: number = 6.5) {
  const roundTripKm = km * 2;
  // Crane Mercedes 12t (חכמת): 3.2 km/L + 35 min PTO (4.5 L/hr)
  const craneLiters = roundTripKm / 3.2 + (35 / 60) * 4.5;
  const craneCost = craneLiters * dieselNet;

  // Flatbed Isuzu 5.5t (עלי): 6.0 km/L, 0 PTO
  const flatbedLiters = roundTripKm / 6.0;
  const flatbedCost = flatbedLiters * dieselNet;

  const avgDieselLiters = Math.round(((craneLiters + flatbedLiters) / 2) * 10) / 10;
  const avgFuelCost = Math.round((craneCost + flatbedCost) / 2);

  return {
    avgDieselLiters,
    avgFuelCost,
    craneLiters: Math.round(craneLiters * 10) / 10,
    craneCost: Math.round(craneCost),
    flatbedLiters: Math.round(flatbedLiters * 10) / 10,
    flatbedCost: Math.round(flatbedCost),
  };
}

export function buildQuote({ zone, truck, dieselNet, vatRate, actualKm }: PricingInput): Quote {
  const spec = TRUCKS[truck];
  const km = Math.max(1, Math.round(actualKm ?? zone.km));
  const roundTripKm = km * 2;
  const liters = roundTripKm / spec.kmPerLiter + spec.craneHours * spec.ptoLitersPerHour;
  const fuelCost = liters * dieselNet;

  const avgStats = calculateAvgFuelCost(km, dieselNet);

  const basePrice = truck === "crane" ? zone.cranePrice : flatbedPrice(zone.code, zone.cranePrice);
  const extraKm = Math.max(0, km - zone.km);
  const extraKmCost = extraKm * spec.extraKmRate;
  const priceBeforeVat = Math.round(basePrice + extraKmCost);
  const vat = priceBeforeVat * (vatRate / 100);

  return {
    zoneName: zone.name,
    district: zone.district || "מחוז המרכז",
    mainDistrict: zone.mainDistrict || "המרכז",
    barcode: truck === "crane" ? zone.code : flatbedCode(zone.code),
    truckName: spec.name,
    driver: spec.driver,
    km,
    roundTripKm,
    liters: round1(liters),
    fuelCost: Math.round(fuelCost),
    avgFuelCost: avgStats.avgFuelCost,
    avgDieselLiters: avgStats.avgDieselLiters,
    basePrice,
    extraKm,
    extraKmCost,
    priceBeforeVat,
    vat: Math.round(vat),
    priceWithVat: Math.round(priceBeforeVat + vat),
    etaMinutes: Math.max(8, Math.round(km * 1.9 + 6)),
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export const shekel = (n: number) =>
  `${new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 }).format(n)} ₪`;
