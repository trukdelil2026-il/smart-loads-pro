import * as React from "react";

export type SizeTier = "regular" | "medium" | "huge";
export type Theme = "light" | "dark";

export interface Settings {
  theme: Theme;
  size: SizeTier;
  dieselNet: number;
  vatRate: number;
  geminiKey: string;
  appsScriptUrl: string;
}

const DEFAULTS: Settings = {
  theme: "light",
  size: "regular",
  dieselNet: 6.5,
  vatRate: 18,
  geminiKey: "",
  appsScriptUrl: "",
};

const KEY = "saban-settings-v1";

const Ctx = React.createContext<{
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}>({ settings: DEFAULTS, update: () => {} });

export const SIZE_TIERS: Record<SizeTier, { label: string; base: number; scale: number }> = {
  regular: { label: "רגיל", base: 16, scale: 1 },
  medium: { label: "בינוני", base: 19, scale: 1.2 },
  huge: { label: "ענק", base: 23, scale: 1.4 },
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<Settings>(DEFAULTS);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setSettings({ ...DEFAULTS, ...JSON.parse(saved) });
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", settings.theme === "dark");
    const tier = SIZE_TIERS[settings.size];
    root.style.fontSize = `${tier.base}px`;
    root.style.setProperty("--ui-scale", String(tier.scale));
  }, [settings.theme, settings.size]);

  const update = React.useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ settings, update }}>{children}</Ctx.Provider>;
}

export const useSettings = () => React.useContext(Ctx);
