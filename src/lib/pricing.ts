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
  barcode: number;
  truckName: string;
  driver: string;
  km: number;
  roundTripKm: number;
  liters: number;
  fuelCost: number;
  basePrice: number;
  extraKm: number;
  extraKmCost: number;
  priceBeforeVat: number;
  vat: number;
  priceWithVat: number;
  etaMinutes: number;
}

export function buildQuote({ zone, truck, dieselNet, vatRate, actualKm }: PricingInput): Quote {
  const spec = TRUCKS[truck];
  const km = Math.max(1, Math.round(actualKm ?? zone.km));
  const roundTripKm = km * 2;
  const liters = roundTripKm / spec.kmPerLiter + spec.craneHours * spec.ptoLitersPerHour;
  const fuelCost = liters * dieselNet;

  const basePrice = truck === "crane" ? zone.cranePrice : flatbedPrice(zone.cranePrice);
  const extraKm = Math.max(0, km - zone.km);
  const extraKmCost = extraKm * spec.extraKmRate;
  const priceBeforeVat = Math.round(basePrice + extraKmCost);
  const vat = priceBeforeVat * (vatRate / 100);

  return {
    zoneName: zone.name,
    barcode: truck === "crane" ? zone.code : flatbedCode(zone.code),
    truckName: spec.name,
    driver: spec.driver,
    km,
    roundTripKm,
    liters: round1(liters),
    fuelCost: Math.round(fuelCost),
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
