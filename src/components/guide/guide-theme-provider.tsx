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

export function GuideThemeProvider({
  initialColorMode,
  children,
}: {
  /** 서버가 쿠키에서 읽어 전달하는 초기 모드. 서버 스냅샷으로 사용해 서버·클라 첫 렌더를 일치시킨다. */
  initialColorMode: ColorMode;
  children: ReactNode;
}) {
  const colorMode = useSyncExternalStore(
    subscribeToColorMode,
    readActiveColorMode,
    // 서버 스냅샷 = 쿠키 값. 서버가 같은 쿠키로 <html class>를 렌더하므로 첫 렌더가
    // 서버·클라 동일 → FOUC·hydration mismatch 없음. 마운트 게이트가 필요 없다.
    () => initialColorMode,
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
