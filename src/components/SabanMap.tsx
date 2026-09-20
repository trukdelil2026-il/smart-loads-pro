import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Layers,
  Search,
  Crosshair,
  Compass,
  Ruler,
  Maximize2,
  Minimize2,
  MapPin,
  Truck,
  Building2,
  Fuel,
  Info,
  ChevronRight,
  ExternalLink,
  Plus,
  Minus,
  Navigation,
} from "lucide-react";
import { ORIGIN, ZONES, type Zone } from "@/lib/catalog";
import { useSettings } from "@/lib/settings";
import { shekel } from "@/lib/pricing";

export interface MapTarget {
  name: string;
  lat: number;
  lng: number;
  subtitle?: string;
  zone?: Zone;
}

export type BaseLayerType = "israel_hebrew" | "satellite" | "voyager" | "dark";

interface SearchResult {
  title: string;
  lat: number;
  lng: number;
  type: "zone" | "address";
  zone?: Zone;
  distanceKm?: number;
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
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

export default function SabanMap({
  target,
  onSelectZone,
}: {
  target: MapTarget | null;
  onSelectZone?: (zone: Zone) => void;
}) {
  const { settings } = useSettings();
  const holderRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);

  // Layer groups
  const tileLayerRef = React.useRef<L.TileLayer | null>(null);
  const labelsLayerRef = React.useRef<L.TileLayer | null>(null);
  const zonesLayerGroup = React.useRef<L.LayerGroup | null>(null);
  const radiusLayerGroup = React.useRef<L.LayerGroup | null>(null);
  const routeLayerGroup = React.useRef<L.LayerGroup | null>(null);
  const measureLayerGroup = React.useRef<L.LayerGroup | null>(null);

  // Map state & tools
  const [baseLayer, setBaseLayer] = React.useState<BaseLayerType>("israel_hebrew");
  const [showZones, setShowZones] = React.useState(true);
  const [showRadius, setShowRadius] = React.useState(true);
  const [measureMode, setMeasureMode] = React.useState(false);
  const [measurePoints, setMeasurePoints] = React.useState<L.LatLng[]>([]);
  const [layersMenuOpen, setLayersMenuOpen] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [currentZoom, setCurrentZoom] = React.useState(12);

  // Address lookup state inside map
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Initialize Map
  React.useEffect(() => {
    if (!holderRef.current || mapRef.current) return;

    const map = L.map(holderRef.current, {
      center: [ORIGIN.lat, ORIGIN.lng],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    mapRef.current = map;

    // Create persistent groups
    zonesLayerGroup.current = L.layerGroup().addTo(map);
    radiusLayerGroup.current = L.layerGroup().addTo(map);
    routeLayerGroup.current = L.layerGroup().addTo(map);
    measureLayerGroup.current = L.layerGroup().addTo(map);

    // Origin marker (Saban Logistics Base)
    const originPin = L.marker([ORIGIN.lat, ORIGIN.lng], {
      icon: L.divIcon({
        className: "",
        html: `<div class="saban-pin saban-pin-origin" style="width: 44px; height: 44px;">ס</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      }),
      zIndexOffset: 1000,
    }).addTo(map);

    originPin.bindPopup(
      `<div style="font-family: inherit; direction: rtl; text-align: right; padding: 4px;">
        <div style="font-weight: 900; font-size: 1.05rem; color: #1d4ed8; margin-bottom: 4px;">🏢 מגרש סבן מרכזי</div>
        <div style="font-size: 0.85rem; color: #475569; margin-bottom: 6px;">החרש 10, אזור תעשייה הוד השרון</div>
        <div style="display: flex; gap: 8px; font-size: 0.8rem; font-weight: 700; color: #0f172a;">
          <span>נקודת יציאת משאיות ומנופים</span>
        </div>
      </div>`,
    );

    originPin.bindTooltip(ORIGIN.label, { direction: "top", className: "saban-tip" });

    map.on("zoomend", () => {
      setCurrentZoom(map.getZoom());
    });

    // Measurement click handler
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (!measureMode) return;
      setMeasurePoints((prev) => [...prev, e.latlng]);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Tile layer management with high-resolution Hebrew basemaps
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    tileLayerRef.current?.remove();
    labelsLayerRef.current?.remove();

    if (baseLayer === "israel_hebrew") {
      // Israel OSM / Hebrew localized tiles with CartoDB Voyager fallback
      tileLayerRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
          attribution: "CartoDB / OpenStreetMap Israel",
        },
      ).addTo(map);
    } else if (baseLayer === "satellite") {
      // Esri World Imagery (Satellite) + Hebrew roads/labels overlay
      tileLayerRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Esri Satellite",
        },
      ).addTo(map);

      // Carto Voyager Labels Only overlay on top of satellite
      labelsLayerRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
          zIndex: 400,
        },
      ).addTo(map);
    } else if (baseLayer === "dark") {
      tileLayerRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        },
      ).addTo(map);
    } else {
      // Voyager standard
      tileLayerRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        },
      ).addTo(map);
    }

    tileLayerRef.current.bringToBack();
  }, [baseLayer]);

  // Radius concentric rings (10km, 25km, 50km from Saban yard)
  React.useEffect(() => {
    const group = radiusLayerGroup.current;
    if (!group) return;
    group.clearLayers();

    if (!showRadius) return;

    const rings = [
      { km: 10, color: "#10b981", label: "טבעת מקומית - 10 ק״מ (שרון)" },
      { km: 25, color: "#3b82f6", label: "טבעת מרכז - 25 ק״מ (גוש דן/שומרון)" },
      { km: 50, color: "#f59e0b", label: "טבעת מורחבת - 50 ק״מ (ירושלים/שפלה/חוף)" },
    ];

    rings.forEach(({ km, color, label }) => {
      const circle = L.circle([ORIGIN.lat, ORIGIN.lng], {
        radius: km * 1000,
        color,
        weight: 1.5,
        opacity: 0.65,
        dashArray: "4, 6",
        fillColor: color,
        fillOpacity: 0.03,
      }).addTo(group);

      circle.bindTooltip(label, {
        direction: "bottom",
        className: "saban-tip",
        permanent: false,
      });
    });
  }, [showRadius]);

  // Zone Markers & Interactive Catalog Layer
  React.useEffect(() => {
    const group = zonesLayerGroup.current;
    if (!group) return;
    group.clearLayers();

    if (!showZones) return;

    ZONES.forEach((z) => {
      const isCurrent = target?.lat === z.lat && target?.lng === z.lng;
      const marker = L.marker([z.lat, z.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div class="saban-pin saban-pin-zone ${
            isCurrent ? "ring-4 ring-amber-400 font-black scale-110" : ""
          }" style="padding: 2px 7px; border-radius: 9999px; white-space: nowrap; font-size: 0.72rem;">
            ${z.name.split("-")[0]?.trim() || z.name}
          </div>`,
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        }),
      }).addTo(group);

      marker.bindPopup(
        `<div style="font-family: inherit; direction: rtl; text-align: right; min-width: 170px;">
          <div style="font-weight: 900; font-size: 1rem; color: #0f172a; margin-bottom: 2px;">📍 ${z.name}</div>
          <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 6px;">ברקוד מחירון: <b>${z.code}</b></div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 0.85rem;">
            <span>מרחק משוער:</span>
            <b>${z.km} ק״מ</b>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-top: 2px;">
            <span>מנוף מחירון:</span>
            <b style="color: #2563eb;">${shekel(z.cranePrice)}</b>
          </div>
        </div>`,
      );

      marker.on("click", () => {
        if (onSelectZone) onSelectZone(z);
      });
    });
  }, [showZones, target, onSelectZone]);

  // Draw Route & Target Marker when target changes
  React.useEffect(() => {
    const map = mapRef.current;
    const group = routeLayerGroup.current;
    if (!map || !group) return;

    group.clearLayers();

    if (!target) {
      map.flyTo([ORIGIN.lat, ORIGIN.lng], 12, { duration: 0.8 });
      return;
    }

    const from: L.LatLngTuple = [ORIGIN.lat, ORIGIN.lng];
    const to: L.LatLngTuple = [target.lat, target.lng];
    const dist = calculateDistanceKm(ORIGIN.lat, ORIGIN.lng, target.lat, target.lng);

    // Animated Delivery Route
    L.polyline(arc(from, to), {
      color: "#f59e0b",
      weight: 6,
      opacity: 0.95,
      className: "saban-route",
    }).addTo(group);

    // Target Pin
    const targetMarker = L.marker(to, {
      icon: L.divIcon({
        className: "",
        html: `<div class="saban-pin saban-pin-target"><span class="saban-pulse"></span>🎯</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      }),
      zIndexOffset: 900,
    }).addTo(group);

    targetMarker
      .bindPopup(
        `<div style="font-family: inherit; direction: rtl; text-align: right; min-width: 190px;">
          <div style="font-weight: 900; font-size: 1.05rem; color: #b45309; margin-bottom: 3px;">🎯 יעד מבוקש</div>
          <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 4px;">${target.name}</div>
          ${target.subtitle ? `<div style="font-size: 0.8rem; color: #64748b; margin-bottom: 6px;">${target.subtitle}</div>` : ""}
          <div style="background: #f8fafc; border-radius: 8px; padding: 6px 8px; font-size: 0.85rem; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between;">
              <span>מרחק אווירי מהמגרש:</span>
              <b>${dist} ק״מ</b>
            </div>
          </div>
        </div>`,
      )
      .openPopup();

    map.flyToBounds(L.latLngBounds([from, to]).pad(0.35), { duration: 1.1 });
  }, [target]);

  // Measurement tool drawings
  React.useEffect(() => {
    const group = measureLayerGroup.current;
    if (!group) return;
    group.clearLayers();

    if (measurePoints.length === 0) return;

    measurePoints.forEach((pt, idx) => {
      L.circleMarker(pt, {
        radius: 6,
        color: "#dc2626",
        fillColor: "#ffffff",
        fillOpacity: 1,
        weight: 3,
      })
        .bindTooltip(`נקודה ${idx + 1}`, { permanent: true, direction: "top" })
        .addTo(group);
    });

    if (measurePoints.length > 1) {
      const latlngs = measurePoints.map((p) => [p.lat, p.lng] as L.LatLngTuple);
      L.polyline(latlngs, {
        color: "#dc2626",
        weight: 3,
        dashArray: "6, 6",
      }).addTo(group);

      let totalMeters = 0;
      for (let i = 0; i < measurePoints.length - 1; i++) {
        const p1 = measurePoints[i];
        const p2 = measurePoints[i + 1];
        if (p1 && p2) {
          totalMeters += p1.distanceTo(p2);
        }
      }

      const km = (totalMeters / 1000).toFixed(2);
      const lastPoint = measurePoints[measurePoints.length - 1];
      if (lastPoint) {
        L.popup({ direction: "top", className: "saban-tip" })
          .setLatLng(lastPoint)
          .setContent(`<b>סה״כ מרחק מדידה:</b> ${km} ק״מ (${Math.round(totalMeters)} מטר)`)
          .openOn(mapRef.current!);
      }
    }
  }, [measurePoints]);

  // Address Autocomplete / Geocoding with Photon / OpenStreetMap Hebrew
  const handleAddressSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results: SearchResult[] = [];

      // First check local catalog zones
      const normalized = val.trim().toLowerCase();
      ZONES.forEach((z) => {
        const matches = z.terms.some((t) => t.toLowerCase().includes(normalized));
        if (matches) {
          results.push({
            title: z.name,
            lat: z.lat,
            lng: z.lng,
            type: "zone",
            zone: z,
            distanceKm: calculateDistanceKm(ORIGIN.lat, ORIGIN.lng, z.lat, z.lng),
          });
        }
      });

      // Query Photon OpenStreetMap geocoder biased around Israel coordinates
      const resp = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&lat=${ORIGIN.lat}&lon=${ORIGIN.lng}&limit=4&lang=default`,
      );
      if (resp.ok) {
        const data = (await resp.json()) as {
          features?: Array<{
            geometry: { coordinates: [number, number] };
            properties: { name?: string; street?: string; city?: string; state?: string };
          }>;
        };

        if (data.features) {
          data.features.forEach((feat) => {
            const [lon, lat] = feat.geometry.coordinates;
            const p = feat.properties;
            const title = [p.name, p.street, p.city].filter(Boolean).join(", ");
            if (title && !results.some((r) => r.title === title)) {
              results.push({
                title,
                lat,
                lng: lon,
                type: "address",
                distanceKm: calculateDistanceKm(ORIGIN.lat, ORIGIN.lng, lat, lon),
              });
            }
          });
        }
      }

      setSearchResults(results.slice(0, 6));
    } catch (e) {
      console.error("Address lookup error", e);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (item: SearchResult) => {
    setSearchOpen(false);
    setSearchQuery(item.title);

    if (item.zone && onSelectZone) {
      onSelectZone(item.zone);
    }

    mapRef.current?.flyTo([item.lat, item.lng], 15, { duration: 1.2 });
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // User location GPS
  const locateUser = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current?.flyTo([latitude, longitude], 15, { duration: 1.2 });
        L.circleMarker([latitude, longitude], {
          radius: 8,
          color: "#2563eb",
          fillColor: "#60a5fa",
          fillOpacity: 0.9,
          weight: 2,
        })
          .addTo(mapRef.current!)
          .bindTooltip("המיקום הנוכחי שלך", { permanent: true, direction: "top" });
      },
      (err) => console.warn("GPS error", err),
      { enableHighAccuracy: true },
    );
  };

  const btnStyle =
    "grid h-11 w-11 place-items-center rounded-2xl bg-card text-foreground shadow-md ring-1 ring-border transition hover:bg-muted active:scale-95 text-lg font-bold";

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-muted select-none">
      {/* Map Canvas */}
      <div ref={holderRef} className="h-full w-full" />

      {/* Top Search & Smart Address Bar */}
      <div className="absolute top-3 right-3 left-3 z-[600] flex max-w-lg items-center gap-2">
        <div className="relative flex-1">
          <div className="flex items-center gap-2 rounded-2xl bg-card/95 px-3 py-2 text-foreground shadow-lg ring-1 ring-border backdrop-blur-md">
            <Search className="size-5 text-muted-foreground shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => handleAddressSearch(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="חיפוש כתובת, רחוב או אזור חלוקה..."
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
            />
            {isSearching && (
              <span className="text-xs text-muted-foreground animate-pulse">מחפש...</span>
            )}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full right-0 left-0 mt-2 max-h-60 overflow-y-auto rounded-2xl bg-card p-2 shadow-2xl ring-1 ring-border backdrop-blur-xl">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectSearchResult(r)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-right transition hover:bg-muted"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {r.type === "zone" ? (
                      <Truck className="size-4 text-amber-500 shrink-0" />
                    ) : (
                      <MapPin className="size-4 text-blue-500 shrink-0" />
                    )}
                    <span className="truncate text-sm font-bold">{r.title}</span>
                  </div>
                  {r.distanceKm !== undefined && (
                    <span className="text-xs font-semibold text-muted-foreground shrink-0">
                      {r.distanceKm} ק״מ
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Layer Switcher Button */}
        <button
          aria-label="שכבות מפה"
          onClick={() => setLayersMenuOpen((v) => !v)}
          className={`${btnStyle} ${layersMenuOpen ? "bg-brand text-brand-foreground" : ""}`}
          title="שכבות מפה וכלי עזר"
        >
          <Layers className="size-5" />
        </button>
      </div>

      {/* Layers & Tools Drawer/Panel */}
      {layersMenuOpen && (
        <div className="absolute top-16 right-3 z-[600] w-72 rounded-3xl bg-card/95 p-4 shadow-2xl ring-1 ring-border backdrop-blur-xl animate-in fade-in zoom-in-95">
          <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
            <h4 className="text-base font-black text-foreground flex items-center gap-2">
              <Layers className="size-4 text-brand" /> שכבות וכלי עזר
            </h4>
            <button
              onClick={() => setLayersMenuOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {/* Base Layer Chooser */}
          <div className="space-y-2 mb-4">
            <label className="text-xs font-bold text-muted-foreground">סגנון תצוגת מפה</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "israel_hebrew", name: "עברית מפורטת", icon: "🗺️" },
                { id: "satellite", name: "לוויין + כבישים", icon: "🛰️" },
                { id: "voyager", name: "קלאסי נקי", icon: "🏙️" },
                { id: "dark", name: "מצב לילה", icon: "🌙" },
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setBaseLayer(layer.id as BaseLayerType)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold border transition ${
                    baseLayer === layer.id
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border bg-background/50 hover:bg-muted"
                  }`}
                >
                  <span className="text-lg mb-1">{layer.icon}</span>
                  {layer.name}
                </button>
              ))}
            </div>
          </div>

          {/* Layer Visibility Toggles */}
          <div className="space-y-2 border-t border-border pt-3">
            <label className="text-xs font-bold text-muted-foreground">שכבות פעילות</label>

            <label className="flex items-center justify-between cursor-pointer rounded-xl p-2 hover:bg-muted text-sm font-semibold">
              <span className="flex items-center gap-2">
                <Truck className="size-4 text-blue-500" /> אזורי מחירון ({ZONES.length})
              </span>
              <input
                type="checkbox"
                checked={showZones}
                onChange={(e) => setShowZones(e.target.checked)}
                className="size-4 accent-brand cursor-pointer rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer rounded-xl p-2 hover:bg-muted text-sm font-semibold">
              <span className="flex items-center gap-2">
                <Compass className="size-4 text-emerald-500" /> טבעות טווח (10/25/50 ק״מ)
              </span>
              <input
                type="checkbox"
                checked={showRadius}
                onChange={(e) => setShowRadius(e.target.checked)}
                className="size-4 accent-brand cursor-pointer rounded"
              />
            </label>
          </div>

          {/* Utilities */}
          <div className="space-y-2 border-t border-border pt-3 mt-3">
            <label className="text-xs font-bold text-muted-foreground">כלי מדידה וניווט</label>

            <button
              onClick={() => {
                setMeasureMode((m) => !m);
                setMeasurePoints([]);
              }}
              className={`flex w-full items-center justify-between rounded-xl p-2 text-sm font-bold border transition ${
                measureMode
                  ? "border-red-500 bg-red-500/10 text-red-600"
                  : "border-border bg-background/60 hover:bg-muted"
              }`}
            >
              <span className="flex items-center gap-2">
                <Ruler className="size-4" /> כלי מדידת מרחק אווירי
              </span>
              <span className="text-xs">{measureMode ? "פעיל (לחץ במפה)" : "הפעל"}</span>
            </button>

            {measureMode && measurePoints.length > 0 && (
              <button
                onClick={() => setMeasurePoints([])}
                className="w-full text-center text-xs text-red-500 font-bold hover:underline"
              >
                איפוס נקודות מדידה
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Map Navigation & Controls (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-[500] flex flex-col gap-2">
        <button
          aria-label="מסך מלא"
          className={btnStyle}
          onClick={toggleFullscreen}
          title={isFullscreen ? "יציאה ממסך מלא" : "מסך מלא"}
        >
          {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
        </button>

        <button
          aria-label="המיקום שלי"
          className={btnStyle}
          onClick={locateUser}
          title="אתר את המיקום שלי"
        >
          <Crosshair className="size-5 text-blue-500" />
        </button>

        <button
          aria-label="התקרבות"
          className={btnStyle}
          onClick={() => mapRef.current?.zoomIn()}
          title="התקרבות"
        >
          <Plus className="size-5" />
        </button>

        <button
          aria-label="התרחקות"
          className={btnStyle}
          onClick={() => mapRef.current?.zoomOut()}
          title="התרחקות"
        >
          <Minus className="size-5" />
        </button>

        <button
          aria-label="חזרה למגרש"
          className={`${btnStyle} bg-brand text-brand-foreground hover:bg-brand/90`}
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
          title="מרכז מגרש ח. סבן (הוד השרון)"
        >
          <Building2 className="size-5" />
        </button>
      </div>

      {/* Map Legend & Scale Info (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-[500] pointer-events-none flex flex-col items-end gap-1">
        <div className="pointer-events-auto flex items-center gap-2 rounded-xl bg-card/90 px-3 py-1.5 text-xs font-bold text-foreground shadow-md ring-1 ring-border backdrop-blur-md">
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-blue-600 inline-block" /> מגרש סבן
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-amber-500 inline-block" /> מסלול
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">זום: {currentZoom}</span>
        </div>
      </div>
    </div>
  );
}
