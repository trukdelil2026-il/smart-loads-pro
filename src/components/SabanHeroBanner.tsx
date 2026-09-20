import * as React from "react";
import {
  Truck,
  MapPin,
  FileText,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  Volume2,
} from "lucide-react";
import sabanHeroImg from "@/assets/images/saban_fleet_ui_1789907656504.jpg";

export type HeroActionKey = "fleet" | "location" | "trips" | "tasks";

export interface HeroAction {
  id: HeroActionKey;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const HERO_ACTIONS: HeroAction[] = [
  {
    id: "fleet",
    label: "ניהול צי משאיות",
    sub: "מרצדס אקטרוס מנוף (חכמת) & איסוזו עלי",
    icon: Truck,
  },
  {
    id: "location",
    label: "איתור מיקום",
    sub: "מעקב GPS וניווט מהיר למגרש הוד השרון",
    icon: MapPin,
  },
  {
    id: "trips",
    label: "דיווח נסיעות",
    sub: "עלויות סולר, קילומטראז׳ וזמני הגעה",
    icon: FileText,
  },
  {
    id: "tasks",
    label: "קבלת משימות",
    sub: "הקצאת קווי חלוקה ופריקה לנהגים",
    icon: CheckCircle2,
  },
];

export function SabanHeroBanner({
  activeAction,
  onSelectAction,
  onOpenChat,
}: {
  activeAction: HeroActionKey;
  onSelectAction: (key: HeroActionKey) => void;
  onOpenChat: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-xl">
      {/* Background Hero Picture with Noa, Trucks, Drivers and Stations */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-900">
        <img
          src={sabanHeroImg}
          alt="ח. סבן מוקד ניהול צי משאיות ולוגיסטיקה"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
        />
        {/* Soft gradient overlay for contrast and depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/15 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2 rounded-2xl bg-black/60 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md border border-white/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>מוקד מבצעי פעיל · תחנות פז ודור אלון</span>
          </div>
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 rounded-2xl bg-brand px-3 py-1.5 text-xs font-black text-brand-foreground shadow-lg backdrop-blur-md transition hover:scale-105 active:scale-95"
          >
            <Sparkles className="size-3.5" />
            <span>נועה AI במוקד</span>
          </button>
        </div>

        {/* Floating Holographic Glass Menu right on the image */}
        <div className="absolute bottom-3 right-3 left-3 z-10">
          <div className="rounded-2xl border border-white/25 bg-slate-950/65 p-2 sm:p-3 shadow-2xl backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-white">
                <span className="rounded-lg bg-brand/30 px-2 py-0.5 text-[0.7rem] font-black text-blue-300 border border-brand/40">
                  ח. סבן (1994) בע״מ
                </span>
                <span className="text-xs font-bold text-white/90">ממשק חכם לשליטה ובקרה</span>
              </div>
              <span className="text-[0.7rem] font-semibold text-white/70">גע בפריט לבחירה 👈</span>
            </div>

            {/* 4 Interactive Glass Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {HERO_ACTIONS.map((item) => {
                const Icon = item.icon;
                const isSelected = activeAction === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectAction(item.id)}
                    className={`group relative flex flex-col items-start rounded-xl p-2.5 text-right transition-all duration-200 ${
                      isSelected
                        ? "bg-gradient-to-br from-blue-600/90 to-blue-800/90 text-white shadow-lg ring-2 ring-cyan-300 scale-[1.02]"
                        : "bg-white/10 text-white/90 hover:bg-white/20 border border-white/10"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-1">
                      <div
                        className={`grid size-7 place-items-center rounded-lg ${
                          isSelected ? "bg-white text-blue-700 shadow" : "bg-white/15 text-white"
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>
                      {isSelected && (
                        <span className="flex size-2 rounded-full bg-cyan-300 animate-pulse" />
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-black tracking-tight leading-snug">
                      {item.label}
                    </span>
                    <span className="text-[0.65rem] opacity-75 line-clamp-1 mt-0.5 hidden sm:block">
                      {item.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
