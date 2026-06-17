<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 프로젝트 규약 (system-guide)

이 레포는 **디자인 시스템 가이드**입니다. 작업 전 아래 규약을 반드시 따릅니다.

## 디자인 토큰 (3-tier)

색상은 `src/app/globals.css`에 정의된 토큰 체계로만 사용합니다. **인라인 hex/rgba 하드코딩 금지** (대비 계산용 데이터·체커보드 등 명백한 예외 제외).

```
TIER 1  --raw-*            원본 팔레트·알파 램프. 불변·모드 무관. :root 단 한 번 정의.
TIER 2a --color-{family}-{scale}   모드 인지 스케일. 라이트=identity, 다크=raw 반사(.dark).
TIER 2b --color-{용도}     border / accent / overlay / shadow / level 등 용도 토큰.
컴포넌트                    page.tsx 등에서 위 토큰을 var()로 소비.
```

- 다크 모드 값은 `.dark`에서 **시맨틱 스케일만 재매핑**(raw 반사). raw는 절대 모드별로 재정의하지 않습니다.
- 새 색이 필요하면: raw에 추가 → 시맨틱에 매핑 → 컴포넌트에서 사용.

## 접근성 (필수)

- 목표: **한국 웹접근성 마크(KWCAG 2.2) 1등급**. 체크리스트·패턴은 [`docs/accessibility.md`](docs/accessibility.md) 참조.
- 모든 변경은 WAVE / W3C Validator 기준 **오류 0** 유지. 시맨틱 HTML 우선, 인터랙티브 요소는 네이티브 태그(`button`/`a`) 사용.
- 폰트는 `Pretendard GOV`(CDN). 포커스는 전역 `:focus-visible`로 항상 표시.

## Git / 문서

- 브랜치·커밋 규약: [`docs/git-strategy.md`](docs/git-strategy.md). 커밋 type 접두사(`feat/fix/refactor/design/docs/...`) 준수.
