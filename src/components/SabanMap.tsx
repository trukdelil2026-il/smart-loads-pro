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
  Plus,
  Minus,
  Navigation,
  Check,
  RotateCcw,
  Sparkles,
  LocateFixed,
  Eye,
  Route,
  Share2,
  HelpCircle,
  X,
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

export type BaseLayerType =
  "israel_hebrew" | "topo_hebrew" | "satellite_hybrid" | "warm_cream" | "night_mode";

interface SearchResult {
  title: string;
  lat: number;
  lng: number;
  type: "zone" | "address";
  zone?: Zone;
  distanceKm?: number;
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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
  const userLocationLayerGroup = React.useRef<L.LayerGroup | null>(null);

  // Map state & tools
  const [baseLayer, setBaseLayer] = React.useState<BaseLayerType>("israel_hebrew");
  const [showZones, setShowZones] = React.useState(true);
  const [showRadius, setShowRadius] = React.useState(true);
  const [showTrafficSim, setShowTrafficSim] = React.useState(false);
  const [measureMode, setMeasureMode] = React.useState(false);
  const [measurePoints, setMeasurePoints] = React.useState<L.LatLng[]>([]);
  const [measuredDistance, setMeasuredDistance] = React.useState<number | null>(null);
  const [layersMenuOpen, setLayersMenuOpen] = React.useState(false);
  const [toolsDrawerOpen, setToolsDrawerOpen] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [currentZoom, setCurrentZoom] = React.useState(12);
  const [activeZoneCard, setActiveZoneCard] = React.useState<Zone | null>(null);
  const [locatingUser, setLocatingUser] = React.useState(false);
  const [quickStatusToast, setQuickStatusToast] = React.useState<string | null>(null);

  // Address search
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  const showToast = (msg: string) => {
    setQuickStatusToast(msg);
    setTimeout(() => setQuickStatusToast(null), 3000);
  };

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
    userLocationLayerGroup.current = L.layerGroup().addTo(map);

    // Origin marker (Saban Logistics Base - הוד השרון)
    const originPin = L.marker([ORIGIN.lat, ORIGIN.lng], {
      icon: L.divIcon({
        className: "",
        html: `
          <div class="saban-origin-badge">
            <span class="saban-origin-pulse"></span>
            <div class="saban-origin-inner">
              <span class="saban-origin-logo">ס</span>
            </div>
            <div class="saban-origin-label">מגרש סבן החרש 10</div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      }),
      zIndexOffset: 1000,
    }).addTo(map);

    originPin.bindPopup(
      `<div class="saban-hebrew-popup">
        <div class="saban-popup-header">
          <div class="saban-popup-tag">מוקד לוגיסטי ראשי</div>
          <h3 class="saban-popup-title">ח. סבן חומרי בניין (1994) בע״מ</h3>
        </div>
        <div class="saban-popup-body">
          <p class="saban-popup-address">📍 רחוב החרש 10, אזור תעשייה הוד השרון</p>
          <div class="saban-popup-grid">
            <div class="saban-stat-item">
              <span class="stat-lbl">נקודת מוצא</span>
              <span class="stat-val">קבועה לכל חישוב</span>
            </div>
            <div class="saban-stat-item">
              <span class="stat-lbl">צי משאיות</span>
              <span class="stat-val">חכמת (מנוף) / עלי (משטח)</span>
            </div>
          </div>
        </div>
      </div>`,
    );

    map.on("zoomend", () => {
      setCurrentZoom(map.getZoom());
    });

    // Measurement click handler
    map.on("click", (e: L.LeafletMouseEvent) => {
      // If clicking outside while measuring
      setMeasurePoints((prev) => {
        if (!measureModeRef.current) return prev;
        const next = [...prev, e.latlng];
        return next;
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const measureModeRef = React.useRef(measureMode);
  React.useEffect(() => {
    measureModeRef.current = measureMode;
  }, [measureMode]);

  // Tile layers in Hebrew with Israel-specific high-detail servers & cream/soft-blue palettes
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    tileLayerRef.current?.remove();
    labelsLayerRef.current?.remove();

    if (baseLayer === "israel_hebrew") {
      // High performance Carto Voyager with crisp Hebrew road names & cream background
      tileLayerRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
          attribution: "OpenStreetMap ישראל",
        },
      ).addTo(map);
    } else if (baseLayer === "topo_hebrew") {
      // Topographic Hebrew terrain layer with shaded relief
      tileLayerRef.current = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        subdomains: "abc",
        attribution: "OpenTopoMap",
      }).addTo(map);
      // Add Voyager labels layer in Hebrew on top
      labelsLayerRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
          zIndex: 400,
        },
      ).addTo(map);
    } else if (baseLayer === "satellite_hybrid") {
      // Esri Satellite + Hebrew Roads and Town Labels
      tileLayerRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution: "Esri תצלומי לוויין",
        },
      ).addTo(map);

      labelsLayerRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
          zIndex: 400,
        },
      ).addTo(map);
    } else if (baseLayer === "warm_cream") {
      // Warm Cream / Soft Light theme
      tileLayerRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        },
      ).addTo(map);
    } else if (baseLayer === "night_mode") {
      // Luxury dark navy mode
      tileLayerRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        },
      ).addTo(map);
    }

    tileLayerRef.current?.bringToBack();
  }, [baseLayer]);

  // Concentric Rings in Cream / Cyan / Amber
  React.useEffect(() => {
    const group = radiusLayerGroup.current;
    if (!group) return;
    group.clearLayers();

    if (!showRadius) return;

    const rings = [
      {
        km: 10,
        color: "#0ea5e9",
        fillColor: "#38bdf8",
        label: "טבעת מקומית - 10 ק״מ (הוד השרון, שרון דרומי)",
      },
      {
        km: 25,
        color: "#2563eb",
        fillColor: "#60a5fa",
        label: "טבעת מרכז - 25 ק״מ (גוש דן, פתח תקווה, שומרון)",
      },
      {
        km: 50,
        color: "#d97706",
        fillColor: "#fbbf24",
        label: "טבעת מורחבת - 50 ק״מ (שפלה, ירושלים, חוף כרמל)",
      },
    ];

    rings.forEach(({ km, color, fillColor, label }) => {
      const circle = L.circle([ORIGIN.lat, ORIGIN.lng], {
        radius: km * 1000,
        color,
        weight: 1.8,
        opacity: 0.7,
        dashArray: "5, 7",
        fillColor,
        fillOpacity: 0.04,
      }).addTo(group);

      circle.bindTooltip(label, {
        direction: "bottom",
        className: "saban-tip",
        permanent: false,
      });
    });
  }, [showRadius]);

  // Zone Markers with Professional Styling & Hebrew Tooltips
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
          html: `
            <div class="saban-zone-chip ${isCurrent ? "saban-zone-chip-active" : ""}">
              <span class="saban-zone-dot"></span>
              <span class="saban-zone-text">${z.name.split("-")[0]?.trim() || z.name}</span>
            </div>
          `,
          iconSize: [88, 28],
          iconAnchor: [44, 14],
        }),
      }).addTo(group);

      marker.bindPopup(
        `<div class="saban-hebrew-popup">
          <div class="saban-popup-header">
            <div class="saban-popup-tag">אזור חלוקה מורשה</div>
            <h3 class="saban-popup-title">📍 ${z.name}</h3>
          </div>
          <div class="saban-popup-body">
            <div class="saban-popup-grid">
              <div class="saban-stat-item">
                <span class="stat-lbl">ברקוד שירות</span>
                <span class="stat-val font-mono">${z.code}</span>
              </div>
              <div class="saban-stat-item">
                <span class="stat-lbl">טווח מגרש</span>
                <span class="stat-val">${z.km} ק״מ</span>
              </div>
              <div class="saban-stat-item">
                <span class="stat-lbl">מנוף מרצדס</span>
                <span class="stat-val text-brand">${shekel(z.cranePrice)}</span>
              </div>
              <div class="saban-stat-item">
                <span class="stat-lbl">פלטה איסוזו</span>
                <span class="stat-val text-emerald-600">סדרה 818000</span>
              </div>
            </div>
            <div class="mt-2 text-center">
              <span class="text-xs text-blue-600 font-bold">לחץ לבחירה וחישוב מהיר 👈</span>
            </div>
          </div>
        </div>`,
      );

      marker.on("click", () => {
        setActiveZoneCard(z);
        if (onSelectZone) onSelectZone(z);
      });
    });
  }, [showZones, target, onSelectZone]);

  // Route Rendering with Glowing Dynamic Gradient & Pulse Pin
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

    // Glowing background line
    L.polyline(arc(from, to), {
      color: "#0284c7",
      weight: 9,
      opacity: 0.35,
    }).addTo(group);

    // Main dynamic animated route line
    L.polyline(arc(from, to), {
      color: "#0369a1",
      weight: 5,
      opacity: 0.95,
      className: "saban-route-dynamic",
    }).addTo(group);

    // Target Pin with animated target styling
    const targetMarker = L.marker(to, {
      icon: L.divIcon({
        className: "",
        html: `
          <div class="saban-target-pin">
            <span class="saban-target-ping"></span>
            <div class="saban-target-core">
              <span>🎯</span>
            </div>
            <div class="saban-target-tag">${target.name}</div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      }),
      zIndexOffset: 950,
    }).addTo(group);

    targetMarker
      .bindPopup(
        `<div class="saban-hebrew-popup">
          <div class="saban-popup-header bg-sky-800 text-white">
            <div class="saban-popup-tag bg-white/20 text-white">יעד פריקה מבוקש</div>
            <h3 class="saban-popup-title">${target.name}</h3>
          </div>
          <div class="saban-popup-body">
            ${target.subtitle ? `<p class="saban-popup-address">${target.subtitle}</p>` : ""}
            <div class="saban-popup-grid">
              <div class="saban-stat-item">
                <span class="stat-lbl">מרחק נסיעה</span>
                <span class="stat-val font-bold text-sky-700">${dist} ק״מ</span>
              </div>
              <div class="saban-stat-item">
                <span class="stat-lbl">מוצא</span>
                <span class="stat-val">החרש 10 הוד השרון</span>
              </div>
            </div>
          </div>
        </div>`,
      )
      .openPopup();

    map.flyToBounds(L.latLngBounds([from, to]).pad(0.35), { duration: 1.1 });
  }, [target]);

  // Measurement Tool Rendering
  React.useEffect(() => {
    const group = measureLayerGroup.current;
    if (!group) return;
    group.clearLayers();

    if (measurePoints.length === 0) {
      setMeasuredDistance(null);
      return;
    }

    measurePoints.forEach((pt, idx) => {
      L.circleMarker(pt, {
        radius: 7,
        color: "#0369a1",
        fillColor: "#fdfbf7",
        fillOpacity: 1,
        weight: 3,
      })
        .bindTooltip(`נקודה ${idx + 1}`, {
          permanent: true,
          direction: "top",
          className: "saban-tip",
        })
        .addTo(group);
    });

    if (measurePoints.length > 1) {
      const latlngs = measurePoints.map((p) => [p.lat, p.lng] as L.LatLngTuple);
      L.polyline(latlngs, {
        color: "#0284c7",
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

      const km = Math.round((totalMeters / 1000) * 100) / 100;
      setMeasuredDistance(km);

      const lastPoint = measurePoints[measurePoints.length - 1];
      if (lastPoint && mapRef.current) {
        L.popup({ direction: "top", className: "saban-tip" })
          .setLatLng(lastPoint)
          .setContent(`<b>סה״כ מרחק מדידה:</b> ${km} ק״מ (${Math.round(totalMeters)} מטר)`)
          .openOn(mapRef.current);
      }
    }
  }, [measurePoints]);

  // Hebrew Address Search with catalog matching
  const handleAddressSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results: SearchResult[] = [];
      const normalized = val.trim().toLowerCase();

      // 1. First search internal master catalog zones
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

      // 2. Query Photon Geocoder (Israel area)
      const resp = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&lat=${ORIGIN.lat}&lon=${ORIGIN.lng}&limit=5&lang=default`,
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
    showToast(`מיקוד ביעד: ${item.title}`);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
      showToast("תצוגת מסך מלא הופעלה");
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
      showToast("יציאה ממסך מלא");
    }
  };

  // GPS User Location
  const locateUser = () => {
    if (!navigator.geolocation) {
      showToast("שירותי מיקום אינם נתמכים בדפדפן זה");
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const { latitude, longitude } = pos.coords;
        mapRef.current?.flyTo([latitude, longitude], 15, { duration: 1.2 });

        const group = userLocationLayerGroup.current;
        if (group) {
          group.clearLayers();
          L.circleMarker([latitude, longitude], {
            radius: 9,
            color: "#0284c7",
            fillColor: "#38bdf8",
            fillOpacity: 0.9,
            weight: 3,
          })
            .addTo(group)
            .bindTooltip("המיקום הנוכחי שלך", {
              permanent: true,
              direction: "top",
              className: "saban-tip",
            });
        }
        showToast("מיקומך אותר בהצלחה במפה");
      },
      (err) => {
        setLocatingUser(false);
        console.warn("GPS error", err);
        showToast("לא ניתן לגשת למיקום GPS");
      },
      { enableHighAccuracy: true },
    );
  };

  // Return to Saban yard
  const centerDepot = () => {
    if (target && mapRef.current) {
      mapRef.current.flyToBounds(
        L.latLngBounds([
          [ORIGIN.lat, ORIGIN.lng],
          [target.lat, target.lng],
        ]).pad(0.35),
        { duration: 1 },
      );
      showToast("הצגת מסלול מלא: מגרש סבן ⇄ יעד");
    } else if (mapRef.current) {
      mapRef.current.flyTo([ORIGIN.lat, ORIGIN.lng], 12, { duration: 1 });
      showToast("מיקוד במגרש סבן מרכזי - הוד השרון");
    }
  };

  const mapBtnClass =
    "group flex size-11 items-center justify-center rounded-2xl bg-[#fdfbf7] text-[#0f172a] shadow-md ring-1 ring-[#0284c7]/20 transition-all duration-200 hover:bg-[#e0f2fe] hover:text-[#0369a1] hover:shadow-lg active:scale-95 dark:bg-[#1e293b] dark:text-[#f8fafc] dark:ring-white/10 dark:hover:bg-[#0c4a6e]";

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-[#fdfbf7] select-none text-right font-sans"
    >
      {/* Map Canvas */}
      <div ref={holderRef} className="h-full w-full" />

      {/* Top Floating Navigation Bar (Smart Search + Quick Layers) */}
      <div className="absolute top-3 right-3 left-3 z-[600] flex max-w-xl items-center gap-2">
        <div className="relative flex-1">
          <div className="flex items-center gap-2.5 rounded-2xl bg-[#fdfbf7]/95 px-3.5 py-2.5 text-[#0f172a] shadow-xl ring-1 ring-[#0284c7]/30 backdrop-blur-md dark:bg-[#0f172a]/95 dark:text-[#f8fafc] dark:ring-white/15">
            <Search className="size-5 text-[#0284c7] shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => handleAddressSearch(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="חיפוש כתובת, עיר או אזור חלוקה בעברית..."
              className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-muted-foreground"
            />
            {isSearching && (
              <span className="text-xs font-semibold text-[#0284c7] animate-pulse">מחפש...</span>
            )}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="grid size-6 place-items-center rounded-full bg-muted/80 text-xs hover:bg-muted"
                title="נקה חיפוש"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Search Dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full right-0 left-0 mt-2 max-h-72 overflow-y-auto rounded-2xl bg-[#fdfbf7]/98 p-2 shadow-2xl ring-1 ring-[#0284c7]/20 backdrop-blur-xl dark:bg-[#0f172a]/98">
              <div className="px-2 py-1 text-[11px] font-black text-[#0284c7] border-b border-border/50 mb-1">
                תוצאות מאומתות מקטלוג סבן ומאגרי מיפוי ישראל:
              </div>
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectSearchResult(r)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-right transition hover:bg-[#e0f2fe] dark:hover:bg-[#0c4a6e]/40"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {r.type === "zone" ? (
                      <span className="grid size-7 place-items-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 shrink-0">
                        <Truck className="size-4" />
                      </span>
                    ) : (
                      <span className="grid size-7 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 shrink-0">
                        <MapPin className="size-4" />
                      </span>
                    )}
                    <div>
                      <div className="truncate text-xs sm:text-sm font-black text-foreground">
                        {r.title}
                      </div>
                      {r.zone && (
                        <div className="text-[11px] text-muted-foreground">
                          ברקוד {r.zone.code} · מנוף {shekel(r.zone.cranePrice)}
                        </div>
                      )}
                    </div>
                  </div>
                  {r.distanceKm !== undefined && (
                    <span className="rounded-lg bg-[#0284c7]/10 px-2 py-1 text-xs font-black text-[#0284c7] shrink-0">
                      {r.distanceKm} ק״מ
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Layer switch button */}
        <button
          aria-label="שכבות מפה"
          onClick={() => {
            setLayersMenuOpen((v) => !v);
            setToolsDrawerOpen(false);
          }}
          className={`${mapBtnClass} ${layersMenuOpen ? "bg-[#0284c7] text-white shadow-sky-500/30" : ""}`}
          title="שכבות מפה ותצוגה"
        >
          <Layers className="size-5" />
        </button>

        {/* Tools switch button */}
        <button
          aria-label="כלי עזר לוגיסטיים"
          onClick={() => {
            setToolsDrawerOpen((v) => !v);
            setLayersMenuOpen(false);
          }}
          className={`${mapBtnClass} ${toolsDrawerOpen ? "bg-[#0284c7] text-white shadow-sky-500/30" : ""}`}
          title="כלי עזר ומדידה"
        >
          <Ruler className="size-5" />
        </button>
      </div>

      {/* Layer Options Drawer */}
      {layersMenuOpen && (
        <div className="absolute top-16 right-3 z-[600] w-80 rounded-3xl bg-[#fdfbf7]/98 p-4 shadow-2xl ring-1 ring-[#0284c7]/30 backdrop-blur-xl dark:bg-[#0f172a]/98 animate-in fade-in zoom-in-95">
          <div className="mb-3 flex items-center justify-between border-b border-border/80 pb-2.5">
            <div className="flex items-center gap-2 text-sm font-black text-foreground">
              <Layers className="size-4 text-[#0284c7]" />
              <span>שכבות מיפוי בעברית</span>
            </div>
            <button
              onClick={() => setLayersMenuOpen(false)}
              className="grid size-6 place-items-center rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Base Layer Switcher */}
          <div className="space-y-2 mb-4">
            <span className="text-[11px] font-black text-muted-foreground">
              סגנון תצוגה עברי חכם:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: "israel_hebrew",
                  name: "עברית מפורטת (ברירת מחדל)",
                  icon: "🗺️",
                  hint: "רחובות וערים",
                },
                {
                  id: "satellite_hybrid",
                  name: "תצלומי לוויין + שמות",
                  icon: "🛰️",
                  hint: "היברידי",
                },
                { id: "warm_cream", name: "שמנת בהירה", icon: "🏙️", hint: "עיצוב נקי" },
                { id: "topo_hebrew", name: "טופוגרפי + תבליט", icon: "⛰️", hint: "עליות וטופו" },
                { id: "night_mode", name: "מצב לילה כהה", icon: "🌙", hint: "נהיגת לילה" },
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => {
                    setBaseLayer(layer.id as BaseLayerType);
                    showToast(`סגנון מפה הוחלף: ${layer.name}`);
                  }}
                  className={`flex flex-col items-start p-2.5 rounded-2xl text-xs font-bold border transition text-right ${
                    baseLayer === layer.id
                      ? "border-[#0284c7] bg-[#e0f2fe] text-[#0369a1] shadow-xs dark:bg-sky-950 dark:border-sky-400"
                      : "border-border bg-background/50 hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black">
                    <span>{layer.icon}</span>
                    <span className="truncate">{layer.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{layer.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Overlay Toggles */}
          <div className="space-y-2 border-t border-border/80 pt-3">
            <span className="text-[11px] font-black text-muted-foreground">שכבות פעילות במפה:</span>

            <label className="flex items-center justify-between cursor-pointer rounded-2xl p-2.5 hover:bg-[#e0f2fe]/50 text-xs font-bold ring-1 ring-border/50">
              <span className="flex items-center gap-2">
                <Truck className="size-4 text-[#0284c7]" />
                <span>הצג אזורי חלוקה ({ZONES.length})</span>
              </span>
              <input
                type="checkbox"
                checked={showZones}
                onChange={(e) => {
                  setShowZones(e.target.checked);
                  showToast(e.target.checked ? "שכבת אזורים הוצגה" : "שכבת אזורים הוסתרה");
                }}
                className="size-4 accent-[#0284c7] cursor-pointer rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer rounded-2xl p-2.5 hover:bg-[#e0f2fe]/50 text-xs font-bold ring-1 ring-border/50">
              <span className="flex items-center gap-2">
                <Compass className="size-4 text-emerald-600" />
                <span>טבעות מרחק (10 / 25 / 50 ק״מ)</span>
              </span>
              <input
                type="checkbox"
                checked={showRadius}
                onChange={(e) => {
                  setShowRadius(e.target.checked);
                  showToast(e.target.checked ? "טבעות מרחק הוצגו" : "טבעות מרחק הוסתרו");
                }}
                className="size-4 accent-[#0284c7] cursor-pointer rounded"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tools Drawer (Measurement, Distance, Reset) */}
      {toolsDrawerOpen && (
        <div className="absolute top-16 right-3 z-[600] w-80 rounded-3xl bg-[#fdfbf7]/98 p-4 shadow-2xl ring-1 ring-[#0284c7]/30 backdrop-blur-xl dark:bg-[#0f172a]/98 animate-in fade-in zoom-in-95">
          <div className="mb-3 flex items-center justify-between border-b border-border/80 pb-2.5">
            <div className="flex items-center gap-2 text-sm font-black text-foreground">
              <Ruler className="size-4 text-[#0284c7]" />
              <span>כלי עזר ומדידה דינאמיים</span>
            </div>
            <button
              onClick={() => setToolsDrawerOpen(false)}
              className="grid size-6 place-items-center rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Air distance measuring tool */}
            <div className="rounded-2xl bg-muted/60 p-3 space-y-2 ring-1 ring-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                  <Ruler className="size-4 text-[#0284c7]" />
                  מדידת מרחק אווירי ומסלול
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    measureMode ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {measureMode ? "פעיל" : "כבוי"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                הפעל את המודד ולחץ במפה לסימון נקודות ציון למדידת מרחק בקילומטרים.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const next = !measureMode;
                    setMeasureMode(next);
                    if (!next) setMeasurePoints([]);
                    showToast(next ? "מצב מדידה הופעל — הקלק במפה לסימון" : "מצב מדידה בוטל");
                  }}
                  className={`flex-1 rounded-xl py-2 px-3 text-xs font-black transition ${
                    measureMode
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-[#0284c7] text-white hover:bg-[#0369a1]"
                  }`}
                >
                  {measureMode ? "סיום מדידה" : "הפעל מדידה"}
                </button>
                {measurePoints.length > 0 && (
                  <button
                    onClick={() => {
                      setMeasurePoints([]);
                      showToast("נקודות המדידה אופסו");
                    }}
                    className="rounded-xl bg-background px-3 py-2 text-xs font-bold text-red-600 hover:bg-muted border border-border"
                  >
                    איפוס
                  </button>
                )}
              </div>
              {measuredDistance !== null && (
                <div className="rounded-xl bg-sky-100 p-2 text-center text-xs font-black text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  מרחק שנמדד: {measuredDistance} ק״מ
                </div>
              )}
            </div>

            {/* Quick Yard Info Card */}
            <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-3 text-xs space-y-1 dark:border-sky-900 dark:bg-sky-950/40">
              <div className="font-black text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                <Building2 className="size-4 text-[#0284c7]" />
                <span>מגרש סבן מרכזי - הוד השרון</span>
              </div>
              <div className="text-muted-foreground">החרש 10, אזור תעשייה הוד השרון</div>
              <div className="text-[11px] text-muted-foreground font-mono">
                Lat: {ORIGIN.lat}, Lng: {ORIGIN.lng}
              </div>
              <button
                onClick={centerDepot}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0284c7] py-1.5 text-xs font-black text-white hover:bg-[#0369a1]"
              >
                <LocateFixed className="size-3.5" />
                <span>מרכז תצוגה למגרש</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Map Navigation & Controls (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-[500] flex flex-col gap-2">
        <button
          aria-label="מסך מלא"
          className={mapBtnClass}
          onClick={toggleFullscreen}
          title={isFullscreen ? "יציאה ממסך מלא" : "מסך מלא"}
        >
          {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
        </button>

        <button
          aria-label="אתר מיקום נוכחי"
          className={`${mapBtnClass} ${locatingUser ? "animate-spin text-[#0284c7]" : ""}`}
          onClick={locateUser}
          title="אתר את המיקום שלי ב-GPS"
        >
          <Crosshair className="size-5 text-[#0284c7]" />
        </button>

        <button
          aria-label="התקרבות"
          className={mapBtnClass}
          onClick={() => mapRef.current?.zoomIn()}
          title="התקרבות (Zoom In)"
        >
          <Plus className="size-5" />
        </button>

        <button
          aria-label="התרחקות"
          className={mapBtnClass}
          onClick={() => mapRef.current?.zoomOut()}
          title="התרחקות (Zoom Out)"
        >
          <Minus className="size-5" />
        </button>

        <button
          aria-label="מרכז מגרש סבן"
          className={`${mapBtnClass} bg-[#0284c7] text-white hover:bg-[#0369a1] hover:text-white dark:bg-[#0284c7] dark:text-white shadow-sky-500/20`}
          onClick={centerDepot}
          title="מרכז מגרש ח. סבן (הוד השרון)"
        >
          <Building2 className="size-5" />
        </button>
      </div>

      {/* Status feedback toast */}
      {quickStatusToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[700] rounded-2xl bg-[#0f172a]/90 px-4 py-2 text-xs font-black text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          {quickStatusToast}
        </div>
      )}

      {/* Dynamic Zone Details Card (when selected on map) */}
      {activeZoneCard && (
        <div className="absolute bottom-14 right-4 z-[500] max-w-xs w-full rounded-3xl bg-[#fdfbf7]/98 p-3.5 shadow-2xl ring-1 ring-[#0284c7]/30 backdrop-blur-xl dark:bg-[#0f172a]/98 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                ברקוד {activeZoneCard.code}
              </span>
              <h4 className="mt-1 text-sm font-black text-foreground">{activeZoneCard.name}</h4>
            </div>
            <button
              onClick={() => setActiveZoneCard(null)}
              className="grid size-5 place-items-center rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-muted/60 p-1.5 text-center">
              <span className="block text-[10px] text-muted-foreground">טווח מהמגרש</span>
              <span className="font-black text-foreground">{activeZoneCard.km} ק״מ</span>
            </div>
            <div className="rounded-xl bg-sky-50 p-1.5 text-center dark:bg-sky-950/60">
              <span className="block text-[10px] text-sky-700 dark:text-sky-300">מחיר מנוף</span>
              <span className="font-black text-sky-900 dark:text-sky-200">
                {shekel(activeZoneCard.cranePrice)}
              </span>
            </div>
          </div>

          <div className="mt-2.5 flex gap-1.5">
            <button
              onClick={() => {
                if (onSelectZone) onSelectZone(activeZoneCard);
                showToast(`אזור ${activeZoneCard.name} נבחר לחישוב`);
              }}
              className="flex-1 rounded-xl bg-[#0284c7] py-1.5 text-xs font-black text-white hover:bg-[#0369a1]"
            >
              בחר יעד זה לחישוב
            </button>
            <button
              onClick={() => {
                mapRef.current?.flyTo([activeZoneCard.lat, activeZoneCard.lng], 15, {
                  duration: 1,
                });
              }}
              className="rounded-xl bg-muted px-2.5 py-1.5 text-xs font-bold hover:bg-muted/80"
              title="מיקוד"
            >
              🔍
            </button>
          </div>
        </div>
      )}

      {/* Map Legend & Scale Info (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-[500] pointer-events-none flex flex-col items-end gap-1">
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-2xl bg-[#fdfbf7]/95 px-3 py-1.5 text-xs font-bold text-[#0f172a] shadow-lg ring-1 ring-[#0284c7]/20 backdrop-blur-md dark:bg-[#0f172a]/95 dark:text-[#f8fafc]">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-[#0284c7] shadow-xs inline-block" />
            <span>מגרש סבן</span>
          </span>
          <span className="text-muted-foreground/40">|</span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-sky-400 inline-block" />
            <span>מסלול שינוע</span>
          </span>
          <span className="text-muted-foreground/40">|</span>
          <span className="text-muted-foreground text-[11px]">זום: {currentZoom}</span>
        </div>
      </div>
    </div>
  );
}
