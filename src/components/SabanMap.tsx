import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ORIGIN } from "@/lib/catalog";
import { useSettings } from "@/lib/settings";

export interface MapTarget {
  name: string;
  lat: number;
  lng: number;
  subtitle?: string;
}

function arc(from: L.LatLngTuple, to: L.LatLngTuple): L.LatLngTuple[] {
  const points: L.LatLngTuple[] = [];
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2 + (y2 - y1) * 0.12;
  const my = (y1 + y2) / 2 - (x2 - x1) * 0.12;
  for (let t = 0; t <= 1.0001; t += 0.02) {
    const x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2;
    const y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t * t * y2;
    points.push([x, y]);
  }
  return points;
}

export default function SabanMap({ target }: { target: MapTarget | null }) {
  const { settings } = useSettings();
  const holder = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const layerRef = React.useRef<L.LayerGroup | null>(null);
  const tileRef = React.useRef<L.TileLayer | null>(null);

  React.useEffect(() => {
    if (!holder.current || mapRef.current) return;
    const map = L.map(holder.current, {
      center: [ORIGIN.lat, ORIGIN.lng],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    L.marker([ORIGIN.lat, ORIGIN.lng], {
      icon: L.divIcon({
        className: "",
        html: `<div class="saban-pin saban-pin-origin">ס</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    })
      .addTo(map)
      .bindTooltip(ORIGIN.label, { direction: "top", className: "saban-tip" });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Tiles follow the theme (CartoDB Voyager / Dark Matter — Hebrew labels).
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    tileRef.current?.remove();
    const url =
      settings.theme === "dark"
        ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    tileRef.current = L.tileLayer(url, { maxZoom: 19, subdomains: "abcd" }).addTo(map);
    tileRef.current.bringToBack();
  }, [settings.theme]);

  React.useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (!target) {
      map.flyTo([ORIGIN.lat, ORIGIN.lng], 12, { duration: 0.8 });
      return;
    }

    const from: L.LatLngTuple = [ORIGIN.lat, ORIGIN.lng];
    const to: L.LatLngTuple = [target.lat, target.lng];

    L.polyline(arc(from, to), {
      color: "#f59e0b",
      weight: 6,
      opacity: 0.95,
      className: "saban-route",
    }).addTo(layer);

    L.marker(to, {
      icon: L.divIcon({
        className: "",
        html: `<div class="saban-pin saban-pin-target"><span class="saban-pulse"></span>🎯</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      }),
    })
      .addTo(layer)
      .bindTooltip(`${target.name}${target.subtitle ? ` · ${target.subtitle}` : ""}`, {
        direction: "top",
        permanent: true,
        className: "saban-tip",
      });

    map.flyToBounds(L.latLngBounds([from, to]).pad(0.35), { duration: 1.1 });
  }, [target]);

  const btn =
    "grid h-[calc(3.25rem*var(--ui-scale))] w-[calc(3.25rem*var(--ui-scale))] place-items-center rounded-2xl bg-card text-2xl font-bold text-foreground shadow-lg ring-1 ring-border transition active:scale-95";

  return (
    <div className="relative h-full w-full">
      <div ref={holder} className="h-full w-full" />
      <div className="absolute bottom-4 left-4 z-[500] flex flex-col gap-2">
        <button aria-label="התקרבות" className={btn} onClick={() => mapRef.current?.zoomIn()}>
          +
        </button>
        <button aria-label="התרחקות" className={btn} onClick={() => mapRef.current?.zoomOut()}>
          −
        </button>
        <button
          aria-label="חזרה למגרש"
          className={btn}
          onClick={() =>
            target
              ? mapRef.current?.flyToBounds(
                  L.latLngBounds([
                    [ORIGIN.lat, ORIGIN.lng],
                    [target.lat, target.lng],
                  ]).pad(0.35),
                )
              : mapRef.current?.flyTo([ORIGIN.lat, ORIGIN.lng], 12)
          }
        >
          ⌖
        </button>
      </div>
    </div>
  );
}
