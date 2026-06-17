# Git 브랜치 전략

## 브랜치 구조

```
main
 └── develop
      ├── feature/기능명
      ├── fix/버그명
      └── docs/문서명
```

| 브랜치 | 용도 | 병합 대상 |
|--------|------|----------|
| `main` | 배포 가능한 안정 코드 | - |
| `develop` | 개발 통합 브랜치 | → main |
| `feature/*` | 기능 개발 | → develop |
| `fix/*` | 버그 수정 | → develop |
| `docs/*` | 문서 작업 | → develop |

> **현행 운용(솔로 개발):** 현재는 `develop`에 직접 커밋합니다.
> 협업이 시작되거나 기능 단위가 커지면 아래 `feature/*` 분기 흐름으로 전환합니다.
> 어느 쪽이든 `main` 직접 커밋은 금지하고, 배포는 `develop → main` 병합으로만 합니다.

---

## 커밋 author 설정

커밋 작성자가 OS 기본값(`user@hostname.local`)으로 잡히지 않도록 레포에 명시합니다.

```bash
git config user.name "yhwabillie"
git config user.email "seewhat1210@gmail.com"
```

---

## 브랜치 생성 규칙

```bash
# 기능 개발
git checkout -b feature/button-component

# 버그 수정
git checkout -b fix/contrast-checker-dark-mode

# 문서
git checkout -b docs/accessibility-guide
```

---

## 커밋 메시지 규칙

```
<type>: <subject>

[body — 선택]
```

| type | 설명 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `style` | UI/스타일 변경 (기능 변경 없음) |
| `refactor` | 리팩토링 |
| `docs` | 문서 수정 |
| `chore` | 빌드·설정·패키지 관련 |
| `design` | 디자인 토큰·시스템 관련 |

**예시**
```
feat: 대비 체커에 아이콘 미리보기 추가
fix: 다크모드 선택 배너 하드코딩 색상 CSS 변수로 교체
refactor: 컬러 토큰 3-tier 구조화(--raw-* / --color-*)
docs: KWCAG 2.2 기반 웹접근성 가이드 작성
```

---

## PR 규칙

- `feature/*` → `develop` PR 생성 후 셀프 리뷰
- `develop` → `main` PR은 배포 전 최종 확인 후 병합
- PR 제목은 커밋 메시지 규칙과 동일하게

---

## 배포 흐름

```
feature/* → develop → main → 배포
```
