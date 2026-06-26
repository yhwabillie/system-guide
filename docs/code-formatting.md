# 코드 포맷팅 (Prettier)

프로젝트 전체 코드 스타일을 **Prettier**로 통일합니다. 설정 파일은 프로젝트 루트 `.prettierrc`에 정의되어 있습니다.

## 주요 설정

| 항목 | 값 | 설명 |
|---|---|---|
| `semi` | `true` | 세미콜론 사용 |
| `singleQuote` | `false` | 쌍따옴표 사용 (JSX와 통일) |
| `tabWidth` | `2` | 들여쓰기 2칸 |
| `trailingComma` | `"all"` | 후행 쉼표 항상 추가 |
| `printWidth` | `120` | 한 줄 최대 120자 |
| `arrowParens` | `"always"` | 화살표 함수 매개변수 항상 괄호 |
| `endOfLine` | `"lf"` | 줄바꿈 LF 통일 |
| `plugins` | `prettier-plugin-tailwindcss` | Tailwind 클래스 자동 정렬 |

## CLI 명령어

```bash
# 전체 파일 포맷 적용
npm run format

# 포맷 위반 여부만 확인 (CI용)
npm run format:check
```

## 에디터 저장 시 자동 포맷

`.vscode/settings.json`에 저장 시 자동 포맷 설정이 포함되어 있습니다. Cursor / VS Code 사용자는 **Prettier - Code formatter** 확장(`esbenp.prettier-vscode`)을 설치하면 파일 저장 시 자동으로 포맷이 적용됩니다.

## ESLint 연동

`eslint-config-prettier`를 통해 ESLint의 포맷 관련 규칙을 비활성화하여 Prettier와의 충돌을 방지합니다.

## 포맷 제외 대상

`.prettierignore`에 정의된 경로는 포맷 대상에서 제외됩니다.

- `.next/` — 빌드 산출물
- `out/`, `build/` — 정적 빌드 산출물
- `node_modules/` — 의존성
- `*.woff2` — 폰트 바이너리
