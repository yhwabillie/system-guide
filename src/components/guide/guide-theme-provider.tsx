"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  applyColorModeClass,
  readStoredColorMode,
  writeStoredColorMode,
} from "@/lib/theme-preference";
import { ToastProvider } from "@/components/guide/shared";

type GuideThemeContextValue = {
  isDark: boolean;
  setIsDark: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleDark: () => void;
};

const GuideThemeContext = createContext<GuideThemeContextValue | null>(null);

export function GuideThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const themeHydratedRef = useRef(false);

  useEffect(() => {
    if (!themeHydratedRef.current) {
      themeHydratedRef.current = true;
      const stored = readStoredColorMode();
      if (stored === "dark" && !isDark) {
        setIsDark(true);
        return;
      }
      if (stored === "light" && isDark) {
        setIsDark(false);
        return;
      }
    }

    applyColorModeClass(isDark ? "dark" : "light");
    writeStoredColorMode(isDark ? "dark" : "light");
  }, [isDark]);

  const toggleDark = () => setIsDark((prev) => !prev);

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
