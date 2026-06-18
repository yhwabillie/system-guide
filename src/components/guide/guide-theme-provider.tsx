"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  readActiveColorMode,
  setColorMode,
  subscribeToColorMode,
  type ColorMode,
} from "@/lib/theme-preference";
import { ToastProvider } from "@/components/guide/shared";

type GuideThemeContextValue = {
  isDark: boolean;
  setIsDark: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleDark: () => void;
};

const GuideThemeContext = createContext<GuideThemeContextValue | null>(null);

function getServerColorModeSnapshot(): ColorMode {
  return "light";
}

export function GuideThemeProvider({ children }: { children: ReactNode }) {
  const colorMode = useSyncExternalStore(
    subscribeToColorMode,
    readActiveColorMode,
    getServerColorModeSnapshot,
  );
  const isDark = colorMode === "dark";

  const setIsDark = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(isDark) : value;
      setColorMode(next ? "dark" : "light");
    },
    [isDark],
  );

  const toggleDark = useCallback(() => setIsDark((prev) => !prev), [setIsDark]);

  return (
    <ToastProvider>
      <GuideThemeContext.Provider value={{ isDark, setIsDark, toggleDark }}>
        {children}
      </GuideThemeContext.Provider>
    </ToastProvider>
  );
}

export function useGuideTheme() {
  const ctx = useContext(GuideThemeContext);
  if (!ctx) throw new Error("useGuideTheme must be used within GuideThemeProvider");
  return ctx;
}
