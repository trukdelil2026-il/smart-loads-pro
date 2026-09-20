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
  toggleTheme: () => void;
  setSize: (size: SizeTier) => void;
}>({
  settings: DEFAULTS,
  update: () => {},
  toggleTheme: () => {},
  setSize: () => {},
});

export const SIZE_TIERS: Record<SizeTier, { label: string; base: number; scale: number }> = {
  regular: { label: "רגיל", base: 16, scale: 1 },
  medium: { label: "בינוני", base: 18.5, scale: 1.18 },
  huge: { label: "ענק", base: 21.5, scale: 1.35 },
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<Settings>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(KEY);
        if (saved) return { ...DEFAULTS, ...JSON.parse(saved) };
      } catch {
        /* ignore */
      }
    }
    return DEFAULTS;
  });

  const applySettingsToDOM = React.useCallback((s: Settings) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const isDark = s.theme === "dark";
    if (isDark) {
      root.classList.add("dark");
      document.body?.classList.add("dark");
    } else {
      root.classList.remove("dark");
      document.body?.classList.remove("dark");
    }
    root.setAttribute("data-theme", s.theme);
    root.setAttribute("data-size", s.size);

    const tier = SIZE_TIERS[s.size] || SIZE_TIERS.regular;
    root.style.fontSize = `${tier.base}px`;
    root.style.setProperty("--ui-scale", String(tier.scale));
  }, []);

  React.useEffect(() => {
    applySettingsToDOM(settings);
  }, [settings, applySettingsToDOM]);

  const update = React.useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        applySettingsToDOM(next);
        return next;
      });
    },
    [applySettingsToDOM],
  );

  const toggleTheme = React.useCallback(() => {
    setSettings((prev) => {
      const nextTheme = prev.theme === "dark" ? "light" : "dark";
      const next = { ...prev, theme: nextTheme };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      applySettingsToDOM(next);
      return next;
    });
  }, [applySettingsToDOM]);

  const setSize = React.useCallback(
    (size: SizeTier) => {
      update({ size });
    },
    [update],
  );

  return <Ctx.Provider value={{ settings, update, toggleTheme, setSize }}>{children}</Ctx.Provider>;
}

export const useSettings = () => React.useContext(Ctx);
