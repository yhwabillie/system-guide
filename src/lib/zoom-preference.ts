// 화면 확대/축소(zoom) 선호값. 테마(theme-preference)와 동일하게 쿠키를 SSR source of
// truth로 사용해, 서버가 <html style="font-size:..%">를 직접 렌더하도록 한다.
// → 서버·클라이언트 첫 렌더가 동일해 FOUC(번쩍거림)·hydration mismatch가 없다.
// 서버·클라이언트 양쪽에서 import 가능한 plain 모듈(‘use client’ 없음).

export const ZOOM_COOKIE_KEY = "system-guide:zoom"; // 쿠키 + localStorage 공용 키
export const ZOOM_CHANGE_EVENT = "system-guide-zoom-change";

export const ZOOM_MIN = 50;
export const ZOOM_MAX = 200;
export const ZOOM_STEP = 10;
export const ZOOM_DEFAULT = 100;

export function normalizeZoom(value: number): number {
  if (!Number.isFinite(value)) return ZOOM_DEFAULT;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value / ZOOM_STEP) * ZOOM_STEP));
}

/** 서버: next/headers cookies()의 value 문자열을 zoom 값으로 파싱 */
export function parseZoomCookie(value: string | undefined | null): number {
  if (value == null) return ZOOM_DEFAULT;
  return normalizeZoom(Number(value));
}

/** 클라이언트 스냅샷: SSR이 <html>에 적용한 font-size(%)를 읽어 source로 사용 */
export function readActiveZoom(): number {
  if (typeof document === "undefined") return ZOOM_DEFAULT;
  const fontSize = document.documentElement.style.fontSize; // 예: "110%"
  if (!fontSize) return ZOOM_DEFAULT;
  const parsed = Number.parseFloat(fontSize);
  return Number.isFinite(parsed) ? normalizeZoom(parsed) : ZOOM_DEFAULT;
}

/** 새로고침 직후 FOUC 방지 — 서버 렌더와 동일 적용 */
export function applyZoomStyle(zoom: number): void {
  document.documentElement.style.fontSize = `${zoom}%`;
}

/** 쿠키에 zoom 기록 — 서버 SSR이 읽는 source of truth (1년 유지, SameSite=Lax) */
export function writeZoomCookie(zoom: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${ZOOM_COOKIE_KEY}=${zoom}; path=/; max-age=31536000; SameSite=Lax`;
}

export function subscribeToZoom(onStoreChange: () => void): () => void {
  window.addEventListener(ZOOM_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(ZOOM_CHANGE_EVENT, onStoreChange);
}

export function notifyZoomChange(): void {
  window.dispatchEvent(new Event(ZOOM_CHANGE_EVENT));
}

export function setZoom(value: number): void {
  const next = normalizeZoom(value);
  applyZoomStyle(next);
  writeZoomCookie(next);
  try {
    window.localStorage.setItem(ZOOM_COOKIE_KEY, String(next));
  } catch {
    // 저장소 접근 불가 — 쿠키/세션 상태로 유지
  }
  notifyZoomChange();
}
