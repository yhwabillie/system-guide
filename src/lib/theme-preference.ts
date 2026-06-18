export const THEME_STORAGE_KEY = "system-guide-color-mode";
export const THEME_CHANGE_EVENT = "system-guide-theme-change";

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

/** SSR 시 false, 클라이언트는 인라인 스크립트가 적용한 html.dark 클래스를 읽음 */
export function readActiveColorMode(): ColorMode {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function subscribeToColorMode(onStoreChange: () => void): () => void {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
}

export function notifyColorModeChange(): void {
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function setColorMode(mode: ColorMode): void {
  applyColorModeClass(mode);
  writeStoredColorMode(mode);
  notifyColorModeChange();
}
