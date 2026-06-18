# 웹 접근성 가이드

> **목표: 한국 웹접근성 마크 취득 (한국웹접근성인증평가원 / KWACC)**  
> 기준: **KWCAG 2.2** (한국형 웹 콘텐츠 접근성 지침 2.2) — 4원칙 13지침 38검사항목  
> 인증 등급 목표: **1등급** (모든 검사항목 준수)

> 📌 이 문서는 **이 프로젝트의 진행 상황을 추적하는 살아있는 체크리스트**입니다.
> `[x]` = 현재 코드에 적용 완료 / `[ ]` = 미적용 또는 미검증.
> 남은 주요 과제: 폼 접근성(3.4.x, 입력 컴포넌트 추가 시), `rem` 전환(3.1.3),
> 200% 확대 검증, 스크린리더 실테스트(4.2.1), 모달 패턴(4.2.5).

---

## 인증 개요

| 항목 | 내용 |
|------|------|
| 인증 기관 | 한국웹접근성인증평가원(KWACC), 웹접근성연구소 등 지정기관 |
| 평가 방법 | 자동 검사 + 전문가 수동 검사 + 장애인 사용자 검사 |
| 유효 기간 | 1년 (매년 갱신 필요) |
| 근거 법령 | 장애인차별금지법 제21조, 장애인·노인·임산부 등의 편의증진 보장에 관한 법률 |
| 적용 기준 | KWCAG 2.2 (2022년 개정, WCAG 2.1 기반 + 한국 특화 항목) |

---

## 원칙 1. 인식의 용이성 (Perceivable)

### 지침 1.1 대체 텍스트
> 텍스트 아닌 콘텐츠에 대체 텍스트를 제공해야 한다.

- [ ] **[1.1.1] 이미지 대체 텍스트** — 의미 있는 이미지에 `alt="설명"` 제공
- [ ] **[1.1.1] 장식 이미지** — 장식용 이미지는 `alt=""` (빈 문자열)
- [x] **[1.1.1] 아이콘 버튼** — 텍스트 없는 버튼/아이콘에 `aria-label` 또는 `.sr-only` 제공
- [ ] **[1.1.1] 배경 이미지** — CSS background-image로 의미 전달 금지 → `<img>`로 대체
- [ ] **[1.1.1] 이미지 맵** — `<area>` 태그에 `alt` 제공
- [ ] **[1.1.1] QR코드·캡챠** — 대체 수단 또는 텍스트 설명 제공

### 지침 1.2 멀티미디어 대체 수단
> 멀티미디어 콘텐츠에 대체 수단을 제공해야 한다.

- [ ] **[1.2.1] 영상 자막** — 동영상에 자막(CC) 제공
- [ ] **[1.2.2] 영상 대본** — 오디오/비디오에 텍스트 대본 제공
- [ ] **[1.2.3] 음성 설명(화면 해설)** — 시각 정보만으로 전달되는 영상에 음성 해설 제공
- [ ] **[1.2.4] 수어 영상** — 중요 안내 영상에 수어 영상 제공 (권장)

### 지침 1.3 명료성
> 콘텐츠는 명확하게 전달되어야 한다.

- [x] **[1.3.1] 색에 무관한 인식** — 색상만으로 정보 전달 금지 (에러: 색+아이콘+텍스트 병행)
- [ ] **[1.3.2] 명확한 지시사항** — "빨간색 버튼을 클릭", "왼쪽 메뉴" 등 감각적 표현만 사용 금지
- [x] **[1.3.3] 텍스트 명도 대비** — 일반 텍스트 **4.5:1 이상**, 큰 텍스트(18px+ / bold 14px+) **3:1 이상**
- [x] **[1.3.3] UI 컴포넌트 대비** — 버튼 테두리·입력 필드 경계 등 **3:1 이상**
- [x] **[1.3.3] 다크 모드 시맨틱 대비** — `.dark`에서 `--ds-*` 용도 토큰을 바꿀 때 **라이트·다크 모두** 배경(`--ds-background`·`--ds-surface-*`) 대비를 검증한다. 스케일 50 앵커만 고정하면 다크에서 텍스트 대비가 4.5:1 미만이 될 수 있음 → 아래 **시맨틱 색상·다크 모드 대비** 절차 준수
- [ ] **[1.3.3] placeholder 대비** — **4.5:1 이상** (한국 기준 강화)
- [ ] **[1.3.4] 자동 재생 금지** — 3초 이상 자동 재생 콘텐츠는 정지·일시정지·음소거 수단 제공
- [x] **[1.3.5] 콘텐츠 간의 구분** — 인접 콘텐츠 간 시각적 구분 (여백·선·배경색 등)

---

## 원칙 2. 운용의 용이성 (Operable)

### 지침 2.1 입력장치 접근성
> 모든 기능은 키보드로 사용할 수 있어야 한다.

- [x] **[2.1.1] 키보드 사용 보장** — 마우스 없이 Tab·Enter·Space·방향키만으로 모든 기능 접근
- [x] **[2.1.1] 키보드 트랩 없음** — 포커스가 특정 영역에 갇히지 않아야 함 (모달 제외)
- [x] **[2.1.2] 초점 이동과 표시** — 포커스 인디케이터 항상 **시각적으로 표시** (outline 제거 금지)
- [x] **[2.1.2] 포커스 순서** — 논리적·시각적 흐름과 일치하는 Tab 순서
- [x] **[2.1.2] 포커스 대비** — 포커스 인디케이터 대비율 **3:1 이상**
- [ ] **[2.1.3] 조작 가능** — 모바일 터치 타겟 최소 **44×44px**
- [x] **[2.1.3] 스킵 내비게이션** — 페이지 최상단에 "본문 바로가기" 링크 제공

### 지침 2.2 충분한 시간 제공
> 콘텐츠를 읽고 사용하는 데 충분한 시간을 제공해야 한다.

- [ ] **[2.2.1] 시간 제한 조절** — 세션 타임아웃 등 시간 제한 시 20초 이상 전 경고 + 연장 수단 제공
- [ ] **[2.2.2] 자동 업데이트 제어** — 자동으로 변경되는 콘텐츠(슬라이드·배너)에 정지 버튼 제공

### 지침 2.3 광과민성 발작 예방

- [ ] **[2.3.1] 깜빡임 금지** — 초당 3회 이상 깜빡이는 콘텐츠 금지
- [x] **[2.3.2] prefers-reduced-motion** — 애니메이션·전환 효과에 `prefers-reduced-motion: reduce` 대응

### 지침 2.4 쉬운 내비게이션
> 콘텐츠를 쉽게 찾고 이동할 수 있어야 한다.

- [x] **[2.4.1] 반복 영역 건너뜀** — GNB 등 반복 영역을 건너뛰는 "본문 바로가기" 제공
- [x] **[2.4.2] 페이지 제목 제공** — `<title>` 태그에 페이지를 설명하는 고유 제목 제공
- [ ] **[2.4.3] 적절한 링크 텍스트** — "여기 클릭", "더보기" 단독 사용 금지 → 맥락 포함한 텍스트
- [x] **[2.4.4] 제목 계층 구조** — `h1` → `h2` → `h3` 순서, 건너뜀 금지, 페이지당 `h1` 하나

### 지침 2.5 입력 방식
> 다양한 입력 방식으로 콘텐츠를 조작할 수 있어야 한다.

- [ ] **[2.5.1] 단일 포인터 입력** — 드래그·다중 터치 제스처는 단일 클릭/탭으로도 대체 수단 제공
- [ ] **[2.5.2] 포인터 입력 취소** — 클릭/탭 시작(mousedown) 이 아닌 완료(mouseup) 시 기능 실행
- [x] **[2.5.3] 레이블과 네임 일치** — 보이는 레이블 텍스트가 accessible name에 포함되어야 함
- [ ] **[2.5.4] 동작 기반 작동** — 기기 흔들기·기울이기 등 동작 트리거는 UI로도 대체 가능해야 함

---

## 원칙 3. 이해의 용이성 (Understandable)

### 지침 3.1 가독성
> 콘텐츠는 읽고 이해할 수 있어야 한다.

- [x] **[3.1.1] 기본 언어 표시** — `<html lang="ko">` 설정 (현재 적용됨 ✅)
- [ ] **[3.1.2] 외국어 표시** — 본문 내 외국어 구간에 `lang` 속성 지정 (`<span lang="en">`)
- [ ] **[3.1.3] 텍스트 크기 조절** — 브라우저 200% 확대 시 가로 스크롤 없이 정상 표시
- [ ] **[3.1.3] rem 단위 사용** — `px` 대신 `rem` 사용으로 사용자 기본 폰트 크기 존중
- [x] **[1.4.12 / 텍스트 간격] line-height 1.5 통일** — 전역 `--font-line`(=`tokens.ts` `FONT_LINE`)만 사용. `body`·`typo-*`·`leading-*` 일괄 적용. 계층별·컴포넌트별 행간 분기 금지
- [x] **[3.1.4] 텍스트를 이미지로 사용 금지** — 로고 제외, 모든 텍스트는 실제 텍스트로

### 지침 3.2 예측 가능성
> 콘텐츠의 기능과 작동 방식은 예측 가능해야 한다.

- [ ] **[3.2.1] 사용자 요구에 따른 실행** — 포커스 이동·값 변경만으로 컨텍스트 자동 변경 금지
- [ ] **[3.2.2] 일관된 내비게이션** — 반복 페이지에서 내비게이션 위치·순서 일관성 유지
- [ ] **[3.2.3] 일관된 식별** — 같은 기능의 컴포넌트는 동일한 명칭·레이블 사용

### 지침 3.3 콘텐츠의 논리성
> 콘텐츠는 논리적 순서와 구조를 가져야 한다.

- [ ] **[3.3.1] 콘텐츠 선형 구조** — 시각적 순서와 DOM 순서 일치 (CSS로 시각 순서만 바꾸는 것 금지)
- [ ] **[3.3.2] 표의 구성** — `<th scope="col/row">`, `<caption>` 사용, 레이아웃 테이블 사용 금지

### 지침 3.4 입력 도움
> 입력 오류를 방지하고 수정할 수 있어야 한다.

- [ ] **[3.4.1] 레이블 제공** — 모든 입력 필드에 `<label>` 연결 (`htmlFor` ↔ `id`)
- [ ] **[3.4.1] 필수 입력 표시** — 필수 항목임을 텍스트 또는 `aria-required="true"`로 명시
- [ ] **[3.4.2] 오류 정정** — 오류 발생 시 위치·원인·수정 방법을 텍스트로 안내
- [ ] **[3.4.2] 오류 연결** — `aria-describedby`로 오류 메시지와 입력 필드 연결
- [ ] **[3.4.2] aria-invalid** — 유효성 실패 입력 필드에 `aria-invalid="true"` 적용

---

## 원칙 4. 견고성 (Robust)

### 지침 4.1 문법 준수
> 웹 콘텐츠는 올바른 문법으로 작성되어야 한다.

- [x] **[4.1.1] 마크업 오류 방지** — 시작/종료 태그 쌍 일치, 중복 속성 없음, id 중복 없음
- [x] **[4.1.1] HTML 유효성 검사** — [W3C Validator](https://validator.w3.org/) 통과
- [x] **[4.1.2] 속성값 따옴표** — 모든 속성값은 따옴표로 감싸기

### 지침 4.2 웹 애플리케이션 접근성
> 웹 애플리케이션은 접근성이 있어야 한다.

- [ ] **[4.2.1] 스크린리더 호환** — NVDA(Windows), VoiceOver(Mac/iOS), TalkBack(Android) 테스트
- [x] **[4.2.2] 커스텀 컴포넌트 role** — 네이티브 HTML로 불가한 경우만 ARIA role 사용
- [x] **[4.2.3] 상태 정보 제공** — `aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed` 상태 반영
- [x] **[4.2.4] 동적 콘텐츠 알림** — 변경된 콘텐츠는 `aria-live="polite"` 또는 `role="alert"`로 공지
- [ ] **[4.2.5] 모달 접근성** — `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, Esc 닫기, 포커스 트랩

---

## 컴포넌트별 ARIA 패턴

### 모달
```tsx
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">제목</h2>
  ...
  <button onClick={onClose}>닫기 (Esc)</button>
</div>
```

### 탭
```tsx
<div role="tablist" aria-label="탭 목록">
  <button role="tab" aria-selected={true} aria-controls="panel-1" id="tab-1">탭 1</button>
</div>
<div role="tabpanel" aria-labelledby="tab-1" id="panel-1">내용</div>
```

### 아코디언
```tsx
<button aria-expanded={isOpen} aria-controls="content-1">제목</button>
<div id="content-1" hidden={!isOpen}>내용</div>
```

### 알림 토스트
```tsx
<div role="alert" aria-live="assertive">에러 메시지</div>  {/* 즉시 */}
<div aria-live="polite">일반 안내</div>                    {/* 대기 후 */}
```

### 아이콘 전용 버튼
```tsx
<button aria-label="닫기">
  <CloseIcon aria-hidden="true" />
</button>
```

### 외부 링크(새 창) 표시
```tsx
<a href="https://example.com" target="_blank" rel="noopener noreferrer" className="text-accent">
  레이블
  <ExternalLinkIcon aria-hidden="true" className="size-icon-xs shrink-0" />
  <span className="sr-only">(새 창에서 열림)</span>
</a>
```

- **유니코드 기호(`↗` 등)를 장식으로 쓰지 않는다** — `aria-hidden`이어도 WAVE가 텍스트 노드로 색상 대비(1.3.3)를 검사해 오류가 날 수 있다.
- 외부 링크·새 창 표시는 **SVG 라인 아이콘**(`stroke="currentColor"`, `aria-hidden="true"`)으로 하고, 링크 본문과 **같은 색**(`currentColor` 상속, `--color-accent` 등 대비 충족 토큰)을 쓴다.
- 장식 아이콘에 `opacity-70`·`text-muted`처럼 **대비를 깎는 조합을 붙이지 않는다** — 정보 전달은 `.sr-only` 문구가 담당한다.

### 중복 링크(Redundant link) 방지
- **동일 `href`(같은 URL)로 가는 `<a>`를 한 화면에 두 개 이상 두지 않는다** — WAVE Redundant link, 스크린리더에서 같은 목적지가 반복 낭독된다.
- 사이드 nav·헤더 등 **전역 네비에 이미 있는 가이드 링크**는 본문에서 같은 URL `<a>`로 반복하지 않는다.
- 본문에서 위치만 안내할 때는 **페이지 내 앵커**(`href="#nav-…"`)로 canonical 링크 요소로 이동시키거나, 링크 없이 텍스트로 안내한다.

#### 사이드 nav 계층 메뉴 (Tokens·Assets)
- 카테고리 헤더(Color·Font & Type 등)와 **기본 서브탭**(Raw Color·Font Family·Spacing 등)이 **같은 URL**이면 WAVE가 Redundant link로 잡는다. 예: `/guide/color` + `/guide/color`.
- **부모 행은 링크가 아닌 그룹 라벨**(`span` + `id`)로 두고, **이동은 서브 `<Link>`만** 제공한다. `aria-current="page"`도 서브 항목에만 붙인다.
- 서브 목록은 `<ul aria-labelledby={카테고리라벨id}>` — **`role="group"` 중첩 금지**(바깥 `group` + 안쪽 `group` 이중 구조는 WAVE·스크린리더에서 중복 랜드마크가 된다).
- **헤더 홈 아이콘**은 `href="/"`(루트 리다이렉트)만 사용한다. `/guide/color`와 동일 href를 쓰면 Raw Color 서브 링크와 Redundant link가 남는다.
- 펼치기/접기는 부모 옆 **`button`**(`aria-expanded`·`aria-controls`)만 담당한다.

```tsx
{/* ✅ guide-shell GuideNavCategory — 부모 span, 서브만 Link */}
<div>
  <div className={navParentGroupClass(active)}>
    <span id={labelId}>Color</span>
    <button type="button" aria-expanded={expanded} aria-controls={listId} aria-label="Color 하위 메뉴 펼치기">…</button>
  </div>
  <ul id={listId} aria-labelledby={labelId}>
    <li><Link href="/guide/color" aria-current="page">Raw Color</Link></li>
    <li><Link href="/guide/color?tab=semantic">Semantic Color</Link></li>
  </ul>
</div>

{/* ❌ 부모·첫 서브·헤더 홈이 동일 href */}
<Link href="/guide/color">홈</Link>
<Link href="/guide/color">Raw Color</Link>
```

```tsx
{/* ✅ canonical — 사이드 nav 한 곳만 */}
<a id="nav-layout-breakpoint" href="/guide/responsive">
  Layout & Breakpoint
  <ExternalLinkIcon className="size-icon-xs shrink-0" />
</a>

{/* ✅ 본문 — 같은 URL <a> 반복 금지, 앵커로 canonical 링크 위치 안내 */}
<p>
  breakpoint 검증은 사이드메뉴{" "}
  <a href="#nav-layout-breakpoint" className="font-semibold text-accent">Layout & Breakpoint</a>
  {" "}가이드에서 확인합니다.
</p>
```

---

## 타이포그래피 코딩 규칙 (line-height)

행간은 **역할·컴포넌트와 무관하게 `1.5` 단일 값**만 사용합니다. WCAG **1.4.12(텍스트 간격)** 및 KWCAG 가독성(3.1) 대응입니다.

| 계층 | SSOT | 전역 적용 |
|------|------|-----------|
| JS | `tokens.ts` → `FONT_LINE` (`1.5`) | 타이포 표 행간 px 계산 등 |
| CSS 변수 | `fontSizeCssVars()` → `:root --font-line` | `layout.tsx` `<style>` 주입 |
| 기본 상속 | `body { line-height: var(--font-line) }` | 명시 클래스 없는 텍스트 |
| Tailwind | `@theme --leading-*` → `var(--font-line)` | `leading-none`·`leading-tight` 포함 전부 1.5 |
| Shorthand | `--typography-*` / `typo-*` | font shorthand에 `var(--font-line)` 포함 |

```tsx
/* ✅ 기본 — body 상속 또는 typo-* / text-* 조합 */
<p className="typo-body-md">본문</p>
<p className="text-heading-md font-bold font-sans">제목</p>

/* ✅ 인라인이 불가피할 때 — CSS 변수만 */
<span style={{ fontSize: pxToRem(24), lineHeight: "var(--font-line)" }} />

/* ✅ JS 행간 px — FONT_LINE import */
import { FONT_LINE, fontSizePx } from "@/lib/tokens";
const lineHeightPx = Math.round(fontSizePx["body-md"] * FONT_LINE);

/* ❌ leading-none / leading-tight 로 줄이기 시도 */
<span className="text-caption leading-none">...</span>

/* ❌ 인라인 리터럴·고정 px */
<span style={{ lineHeight: 1.25 }} />
<span style={{ lineHeight: "24px" }} />

/* ❌ 로컬 상수·계층별 토큰 */
const FONT_LINE = 1.25;
/* globals.css */ /* --font-line-tight: 1.25; */
```

값을 바꿀 때는 **`src/lib/tokens.ts`의 `FONT_LINE`만** 수정합니다. `globals.css`·컴포넌트·`@theme`는 `--font-line`을 참조하므로 연쇄 반영됩니다.

---

## CSS 코딩 규칙

```css
/* ✅ 포커스 스타일 — outline 제거 절대 금지, 전역 outline으로 표시 (globals.css 적용됨)
   border·ring으로 포커스를 대체하지 않는다. tab·TOC는 outline-offset: -2px. */
:focus-visible {
  outline: var(--outline-focus-width) dashed var(--ds-utility-focus-ring);
  outline-offset: var(--outline-focus-offset);
}

[role="tab"]:focus-visible,
.guide-toc :is(a, button):focus-visible {
  outline-offset: var(--outline-focus-tab-offset);
}

/* ✅ 스크린리더 전용 텍스트 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* ✅ 애니메이션 모션 감소 대응 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**금지 패턴**
- `outline: none` / `outline: 0` 단독 사용 금지
- `px` 단위 폰트 크기 사용 금지 → `rem` 사용
- **`line-height` 1.5 이외 값 금지** — 프로젝트 행간은 **전역 `1.5` 단일 토큰**(`tokens.ts` `FONT_LINE` → CSS `--font-line`)만 사용한다. `leading-none`·`leading-tight`·`line-height: 1`·`1.25`·고정 `px` 행간, 역할별 `--font-line-*` 토큰 신설, `globals.css`에 `--font-line` 숫자 직접 정의 모두 금지. 변경이 필요하면 **`FONT_LINE` 한 곳만** 수정하고 `body`·`@theme --leading-*`·`--typography-*` 연쇄를 따른다. 인라인은 `lineHeight: "var(--font-line)"`만 허용
- **`caption`(12px) 미만 `font-size` 금지** — `pxToRem(10)`·`pxToRem(11)` 등 인라인 축소, `0.625rem` 직접 지정 포함. WAVE **Very small text** 오류 원인. DOM에 글리프가 있으면 `aria-hidden`이어도 검사 대상 → 최소 `text-caption`(`tokens.ts` `caption` = 12px) 이상만 사용
- **장식 색상 견본에 `role="img"` + `aria-label` 금지** — 단색 스와치·팔레트 칸은 시각용 장식. `aria-label`이 있으면 WAVE가 배경색 대비를 오검(Contrast Error 다수). 토큰명·hex는 인접 **보이는 텍스트**로 제공하고, 견본 블록은 `aria-hidden="true"`. 선택 가능한 스와치만 `button` + `aria-label`
- **Raw Color 팔레트 견본** — `--ds-*`(모드 반사)가 아니라 **`--raw-*` 고정색**을 체커보드(`checkerLight`/`checkerDark`) 위에 올려 표시한다. 다크 페이지 배경 위에 ds 반사색·`border-line-overlay`를 직접 깔면 WAVE 비텍스트 대비 오류가 다수 발생한다. 구현: `RawPaletteSwatchFill` · `rawPaletteSwatchClass`. 체커보드·색 레이어는 **`span` + `absolute inset-0 block`만 사용** — [`span`/`button` 안 `div` 금지](#w3c-validator-마크업) 참고
- **Contrast Checker 피커·선택 UI** — 배경/텍스트 선택 버튼·팔레트 선택 링·BG/TXT 배지에 **`text-accent`·`ring-accent` 금지**(다크에서 violet-50 on black ≈ 3.5:1). 중립 `text-foreground`·`ring-foreground`·`border-line-strong` 사용. 피커 스와치는 `ContrastSwatchFill`로 체커보드 언더레이(`span` 레이어만). 버튼 이름은 `aria-labelledby`(라벨·hex·액션)로 제공
- **사이드 네비(`guide-sidenav`)** — 섹션 라벨(Tokens·Assets·Layout)·외부 링크·펼치기 토글에 **`text-accent`·`text-muted` 금지**(다크 accent ≈ 3.5:1·muted ≈ 3.1:1 on `#0a0a0a`). `text-gray-60`·`text-foreground` 사용. 활성 **메인** 탭 그룹은 `bg-gray-5`, 활성 **서브**메뉴는 `bg-surface-brand` + `text-brand`(대비는 [시맨틱 색상·다크 모드 대비](#시맨틱-색상다크-모드-대비-필수) 표 준수). **카테고리 부모 행은 `<Link>` 금지** — 기본 서브탭과 동일 URL이면 [Redundant link](#중복-링크redundant-link-방지) 발생. 부모는 `span` 그룹 라벨, 이동은 서브 링크만
- **`text-muted`를 밝은 회색 배경 위에 쓰지 않는다** — `surface-subtle`(gray-5)·`gray-10` 위 `text-muted`(gray-40)는 대비 ~2.5~3:1로 WAVE Contrast Error. 임계값·보조 숫자는 `text-gray-60`~`text-gray-70`, 배경은 `bg-gray-10` 등으로 조합 검증
- **`text-gray-40` 본문·캡션 금지(흰 배경)** — gray-40는 white 대비 ~3:1(본문 4.5:1 미달). 보조 라벨은 `text-gray-50` 이상
- `user-scalable=no` meta viewport 금지
- `tabindex` 양수값 사용 금지 (`tabindex="1"` 등)
- `div`, `span`에 클릭 이벤트만 추가하는 패턴 금지
- 레이아웃 목적 `<table>` 사용 금지
- 외부 링크·장식 표시에 유니코드 `↗`·이모지 텍스트 + `opacity-*` / `text-muted` 조합 금지 (WAVE 대비 오류) → SVG + `currentColor` + `.sr-only`
- 동일 URL을 가리키는 `<a>`를 한 화면에 중복 배치 금지 (WAVE Redundant link) → nav canonical 1개 + 본문은 `#id` 앵커 또는 텍스트 안내

### W3C Validator 마크업

> **오류 예:** `Element div not allowed as child of element span in this context` · `button` 내부 `div`도 동일하게 **오류**.

**콘텐츠 모델**
- `span`·`button`·`a` 등 **phrasing content** 컨테이너에는 **phrasing content만** 자식으로 둔다. `div`·`p`·`section` 등 flow content **금지**.
- 팔레트 스와치·Contrast Checker 피커처럼 `button`/`span` 안에 겹쳐 깔는 장식 레이어는 `div` 대신 아래 패턴을 쓴다.

```tsx
// ✅ RawPaletteSwatchFill · ContrastSwatchFill (src/app/page.tsx)
<span aria-hidden="true" className="absolute inset-0 block" style={checker} />
<span aria-hidden="true" className="absolute inset-0 block" style={{ backgroundColor: cssVar }} />

// ❌ 금지 — W3C Validator 오류 + button 자식으로도 invalid
<div aria-hidden="true" className="absolute inset-0" style={checker} />
```

**체크리스트**
- 색 견본·체커보드를 `span`/`button`/`label` 안에 넣을 때 자식 태그가 `div`가 아닌지 확인
- 레이아웃 래퍼가 flow content가 필요하면 바깥을 `div`로 두고, 안쪽 겹침 레이어만 `span.block`
- PR·릴리즈 전 [W3C HTML Validator](https://validator.w3.org/) **오류 0** 재확인

---

## 시맨틱 색상·다크 모드 대비 (필수)

> **라이트만 맞추고 다크를 방치하면 WAVE Contrast Error가 난다.** 시맨틱 용도 토큰(`--ds-text-brand`·`--ds-surface-brand`·`--ds-border-brand`·`--ds-accent` 등)을 추가·변경할 때 **반드시 양 모드**를 검증한다.

### 검증 기준

| 용도 | 전경 | 배경(기본) | 최소 비율 |
|------|------|------------|-----------|
| 본문·링크·활성 라벨 (`text-brand`·`text-foreground` 등) | 토큰 전경색 | `--ds-background` 또는 실제 깔리는 surface | **4.5:1** |
| 큰 텍스트·굵은 라벨(18px+ / bold 14px+) | 동일 | 동일 | **3:1** |
| 테두리·아이콘·채움 블록 (`border-line-brand`·`bg-accent` 단독 노출) | 토큰 색 | 인접 `--ds-background` | **3:1** |
| 채움 버튼 (`bg-accent` + `text-on-accent`) | `--ds-on-accent` | `--ds-accent` | **4.5:1** |

### 배경 기준값

| 모드 | 페이지 배경 | 서브tle surface |
|------|-------------|-----------------|
| 라이트 | `#FFFFFF` (`--raw-white`) | `gray-5` (`--ds-surface-subtle`) |
| 다크 | `#0A0A0A` (`--raw-black`) | `gray-5` 반사 (`--ds-surface-subtle` → `--raw-gray-95`) |

### Brand(violet) 큐레이션 — 현재 SSOT (`globals.css`)

라이트(`:root`)와 다크(`.dark` 용도 재매핑) **둘 다** 아래 조합을 만족해야 한다.

| 토큰 | 라이트 `--ds-*` | 다크 `--ds-*` | 검증 조합(예) |
|------|-----------------|---------------|---------------|
| `text-brand` | `violet-50` | `violet-70` | on `background` ≥ 4.5:1 · on `surface-brand` ≥ 4.5:1 |
| `surface-brand` | `violet-5` | `violet-10` | `text-brand` on surface ≥ 4.5:1 |
| `border-brand` | `violet-40` | `violet-60` | on `background` ≥ 3:1 |
| `accent`(채움) | `violet-50` | `violet-50` | `on-accent`(white) on accent ≥ 4.5:1 · accent on `background` ≥ 3:1 |

**금지·주의**
- 다크에서 `text-brand`·`accent`를 **스케일 50만** 쓰면 `#5B4CF0` on `#0A0A0A` ≈ **3.5:1** → 본문 4.5:1 **미달**
- 라이트 `border-brand`에 `violet-30` 이하 → white 대비 **3:1 미달**
- 용도 토큰은 `.dark`에서 **스케일 반사만** 믿지 말고, 위 표처럼 **대비 계산 후** `--ds-violet-*` 단계를 다시 고른다

### 작업 절차 (토큰 변경 시)

1. `src/lib/contrast.ts`의 `contrastRatio` 또는 [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)로 **라이트·다크** 전경/배경 쌍을 계산
2. `globals.css` `:root`·`.dark` 용도 블록 갱신
3. 가이드 Semantic Color 스와치 `rawVar` / `rawVarDark`·실제 computed hex가 모드 전환 시 바뀌는지 확인
4. WAVE / Lighthouse로 **다크 모드 토글 후** Contrast Error 0 재확인

구현 SSOT: `src/app/globals.css` Brand purpose 주석 블록 · 가이드 `src/app/page.tsx` `semanticColorCatalog`

---

## 피그마 컬러 대비율 참고

> 배경 `#ffffff` 기준 — 일반 텍스트 4.5:1 이상 필요

| 패밀리 | 텍스트 최소 스케일 | UI 컴포넌트 최소 스케일 |
|--------|------------------|----------------------|
| Red | 500 이상 | 400 이상 |
| Brown | 500 이상 | 400 이상 |
| Sand | 600 이상 | 500 이상 |
| Green | 500 이상 | 400 이상 |
| Neutral | 600 이상 | 500 이상 |

> 다크모드(`#0a0a0a` 기준): 팔레트 스케일 반사(`u ↔ 100−u`)만으로는 **용도 토큰 대비가 보장되지 않는다**. brand·accent 등은 `.dark`에서 별도 재매핑 + [시맨틱 색상·다크 모드 대비](#시맨틱-색상다크-모드-대비-필수) 절차로 검증한다.

---

## 검수 도구

| 도구 | 용도 | 비고 |
|------|------|------|
| [NWCAG 자동 평가 도구](https://nwcag.com/) | 한국형 자동 검사 | KWCAG 기준 |
| [OpenWAX](http://www.openwax.net/) | 한국 웹접근성 자동 검사 Chrome 확장 | 무료 |
| [axe DevTools](https://www.deque.com/axe/) | 자동 접근성 감사 | Chrome 확장 |
| [WAVE](https://wave.webaim.org/) | 시각적 접근성 리포트 | 온라인 |
| [Lighthouse](https://developer.chrome.com/docs/lighthouse/) | 접근성 점수 측정 | Chrome DevTools |
| [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) | 색상 대비율 계산 | 온라인 |
| [W3C HTML Validator](https://validator.w3.org/) | 마크업 유효성 | 온라인 |
| VoiceOver (Mac/iOS) | 스크린리더 테스트 | 기본 내장 |
| NVDA (Windows) | 스크린리더 테스트 | 무료 |
| TalkBack (Android) | 모바일 스크린리더 | 기본 내장 |

---

## 인증 신청 프로세스

```
1. 사전 준비
   └─ 전체 페이지 자동 검사 (OpenWAX, axe)
   └─ 수동 키보드 테스트
   └─ 스크린리더 테스트 (VoiceOver + NVDA)

2. 인증 기관 신청
   └─ 한국웹접근성인증평가원(KWACC): https://www.kwacc.or.kr
   └─ 웹접근성연구소: https://www.wah.or.kr
   └─ 서류 제출 + 사이트 URL 제출

3. 평가 진행 (약 4~8주)
   └─ 자동 검사
   └─ 전문가 수동 검사 (38개 항목 전수)
   └─ 장애인 사용자 검사

4. 결과 및 보완
   └─ 미흡 항목 보완 후 재평가
   └─ 합격 시 인증 마크 발급

5. 유지 관리
   └─ 1년마다 갱신 신청
   └─ 콘텐츠 변경 시 접근성 영향 검토
```

---

## 릴리즈 전 최종 체크리스트

- [ ] OpenWAX / axe DevTools — 오류 0건
- [ ] Lighthouse 접근성 점수 **95점 이상**
- [ ] W3C HTML Validator 통과 — `span`/`button` 안 `div` 없음([W3C Validator 마크업](#w3c-validator-마크업))
- [ ] Tab 키 전체 플로우 수동 테스트
- [ ] VoiceOver 주요 플로우 수동 테스트
- [ ] NVDA 주요 플로우 수동 테스트
- [ ] 모바일 TalkBack 테스트
- [ ] 브라우저 200% 줌 레이아웃 확인
- [ ] 라이트·다크 모드 **시맨틱 색상 대비** 확인 — `text-brand`/`border-brand`/`bg-accent`+`on-accent`/`surface-brand` 조합, [시맨틱 색상·다크 모드 대비](#시맨틱-색상다크-모드-대비-필수) 표 준수
- [ ] 키보드 트랩 없음 확인
- [ ] 자동 재생 콘텐츠 정지 버튼 확인
- [ ] 모든 페이지 `<title>` 고유값 확인
- [ ] `<html lang="ko">` 확인 (현재 적용됨 ✅)
