export const THEME_STORAGE_KEY = "system-guide-color-mode";

export type ColorMode = "light" | "dark";

export function readStoredColorMode(): ColorMode | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark") return value;
  } catch {
    /* storage unavailable */
  }
  return null;
}

export function writeStoredColorMode(mode: ColorMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* storage unavailable */
  }
}

/** 새로고침 직후 FOUC 방지 — layout 인라인 스크립트·클라이언트 동기화 공용 */
export function applyColorModeClass(mode: ColorMode): void {
  document.documentElement.classList.toggle("dark", mode === "dark");
}
