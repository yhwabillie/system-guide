import type { Metadata } from "next";
import { ContentIntroLayout, ContentSectionTitle, ContentTitleBlock } from "@/components/guide/shared";
import { layoutPageColSpanFull } from "@/lib/layout-tokens";

export const metadata: Metadata = {
  title: "키보드 접근성 — system-guide",
  description:
    "KWCAG 2.2 / WCAG 2.2 기준으로 웹사이트가 반드시 지켜야 하는 키보드 조작·단축키 규칙 정리",
};

const tableFrameClass = "overflow-x-auto rounded-xl border border-gray-20";
const headerRowClass = "border-b border-gray-20 bg-gray-5";
const headerCellClass = "px-4 py-3 text-label-xsmall font-bold foreground-default";
const bodyRowClass = "border-b border-gray-20 last:border-b-0";
const keyCellClass = "px-4 py-3 align-top whitespace-nowrap";
const descCellClass = "px-4 py-3 align-top text-label-xsmall foreground-subtle";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="surface-subtle border-default text-caption foreground-default mx-0.5 inline-block rounded-md border px-1.5 py-0.5 font-bold">
      {children}
    </kbd>
  );
}

type KeyRow = { keys: React.ReactNode; desc: string };

function KeyTable({ caption, rows }: { caption: string; rows: KeyRow[] }) {
  return (
    <div className={`mb-10 ${tableFrameClass}`}>
      <table className="w-full min-w-[34rem] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className={headerRowClass}>
            <th scope="col" className={`${headerCellClass} w-[40%]`}>
              키
            </th>
            <th scope="col" className={headerCellClass}>
              동작
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={bodyRowClass}>
              <td className={keyCellClass}>{row.keys}</td>
              <td className={descCellClass}>{row.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type OSRow = { feature: string; windows: React.ReactNode; mac: React.ReactNode };

function OSKeyTable({ caption, rows }: { caption: string; rows: OSRow[] }) {
  return (
    <div className={`mb-10 ${tableFrameClass}`}>
      <table className="w-full min-w-[34rem] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className={headerRowClass}>
            <th scope="col" className={`${headerCellClass} w-[34%]`}>
              기능
            </th>
            <th scope="col" className={headerCellClass}>
              Windows
            </th>
            <th scope="col" className={headerCellClass}>
              macOS
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={bodyRowClass}>
              <th scope="row" className="px-4 py-3 align-top text-label-xsmall font-bold foreground-default">
                {row.feature}
              </th>
              <td className={keyCellClass}>{row.windows}</td>
              <td className={keyCellClass}>{row.mac}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const osKeyRows: OSRow[] = [
  { feature: "보조(수정) 키", windows: <Kbd>Ctrl</Kbd>, mac: <Kbd>⌘ Cmd</Kbd> },
  { feature: "대체 키", windows: <Kbd>Alt</Kbd>, mac: <Kbd>⌥ Option</Kbd> },
  {
    feature: "브라우저 확대·축소",
    windows: <><Kbd>Ctrl</Kbd>+<Kbd>＋</Kbd> / <Kbd>－</Kbd> / <Kbd>0</Kbd></>,
    mac: <><Kbd>⌘</Kbd>+<Kbd>＋</Kbd> / <Kbd>－</Kbd> / <Kbd>0</Kbd></>,
  },
  {
    feature: "줄·문서 처음/끝",
    windows: <><Kbd>Home</Kbd> / <Kbd>End</Kbd></>,
    mac: <><Kbd>⌘</Kbd>+<Kbd>←</Kbd> / <Kbd>→</Kbd> (또는 <Kbd>Fn</Kbd>+<Kbd>←</Kbd>/<Kbd>→</Kbd>)</>,
  },
  {
    feature: "페이지 단위 이동",
    windows: <><Kbd>Page Up</Kbd> / <Kbd>Page Down</Kbd></>,
    mac: <><Kbd>Fn</Kbd>+<Kbd>↑</Kbd> / <Kbd>↓</Kbd></>,
  },
  {
    feature: "그리드 처음/끝",
    windows: <><Kbd>Ctrl</Kbd>+<Kbd>Home</Kbd> / <Kbd>End</Kbd></>,
    mac: <><Kbd>⌘</Kbd>+<Kbd>Home</Kbd> / <Kbd>End</Kbd></>,
  },
  {
    feature: "화면낭독기 실행",
    windows: "NVDA · JAWS (별도 설치)",
    mac: <><Kbd>⌘</Kbd>+<Kbd>F5</Kbd> VoiceOver(내장)</>,
  },
  {
    feature: "화면낭독기 탐색",
    windows: <>NVDA·JAWS: <Kbd>Insert</Kbd> 조합</>,
    mac: <>VoiceOver: VO(<Kbd>⌃</Kbd><Kbd>⌥</Kbd>) + 방향키</>,
  },
];

const globalKeyRows: KeyRow[] = [
  { keys: <><Kbd>Tab</Kbd> / <Kbd>Shift</Kbd>+<Kbd>Tab</Kbd></>, desc: "다음/이전 포커스 가능 요소로 이동" },
  { keys: <Kbd>Enter</Kbd>, desc: "링크 이동, 버튼·기본 액션 실행" },
  { keys: <Kbd>Space</Kbd>, desc: "버튼 실행, 체크박스 토글, 페이지 스크롤" },
  { keys: <Kbd>Esc</Kbd>, desc: "모달·드롭다운·팝오버·툴팁 닫기" },
  { keys: <><Kbd>Home</Kbd> / <Kbd>End</Kbd></>, desc: "목록·그리드의 처음/끝으로 이동" },
  { keys: <><Kbd>Page Up</Kbd> / <Kbd>Page Down</Kbd></>, desc: "페이지·슬라이더 큰 단위 이동" },
];

const componentKeyRows: KeyRow[] = [
  { keys: "탭(tablist)", desc: "← → (또는 ↑ ↓)로 탭 이동, Home/End로 처음·끝" },
  { keys: "라디오 그룹", desc: "← → ↑ ↓ 로 선택 이동" },
  { keys: "메뉴 / 드롭다운", desc: "↑ ↓ 이동, Enter 선택, Esc 닫기, 글자 입력 시 해당 항목 점프" },
  { keys: "콤보박스 / 셀렉트", desc: "↑ ↓ 후보 이동, Enter 확정, Esc 취소" },
  { keys: "슬라이더", desc: "← → ↑ ↓ 미세조정, Home/End 최소·최대, PgUp/PgDn 큰 폭" },
  { keys: "모달 다이얼로그", desc: "포커스 트랩(안에서만 Tab 순환), Esc 닫기, 닫을 때 여는 트리거로 포커스 복귀" },
  { keys: "아코디언 / 트리", desc: "Enter·Space 펼침·접힘, 트리는 → ← 로 확장·축소" },
  { keys: "데이터 그리드", desc: "↑ ↓ ← → 셀 이동, Ctrl+Home/End 처음·끝" },
];

const shortcutRows: KeyRow[] = [
  { keys: "본문 바로가기", desc: "첫 Tab에서 노출되는 'Skip to content' 링크 (WCAG 2.4.1 / KWCAG 6.4.1 — 사실상 필수)" },
  { keys: <Kbd>/</Kbd>, desc: "검색창 포커스 (단일 문자 단축키 → 2.1.4 규칙 준수 필요)" },
  { keys: <Kbd>?</Kbd>, desc: "단축키 안내 패널 열기" },
  { keys: <Kbd>Esc</Kbd>, desc: "열린 오버레이·모달 닫기(앱 공통)" },
];

const ruleItems: { term: string; detail: string }[] = [
  {
    term: "2.4.3 초점 순서",
    detail: "Tab 순서가 시각적·논리적 순서와 일치해야 한다.",
  },
  {
    term: "2.4.7 초점 표시",
    detail: "포커스 위치가 항상 보여야 한다(outline 제거 금지).",
  },
  {
    term: "2.4.11 초점 가려짐 최소화 (2.2)",
    detail: "고정 헤더·푸터에 포커스 요소가 가려지지 않아야 한다.",
  },
  {
    term: "3.2.1 / 3.2.2 초점·입력 시 변화 금지",
    detail: "포커스나 값 변경만으로 예기치 않은 맥락 변화가 일어나면 안 된다.",
  },
  {
    term: "2.5.7 드래그 동작 (2.2)",
    detail: "드래그로만 되는 기능은 단일 포인터·키보드 대안을 제공해야 한다.",
  },
];

export default function KeyboardAccessibilityPage() {
  return (
    <div className={layoutPageColSpanFull}>
      <ContentIntroLayout>
        <ContentTitleBlock
          eyebrow="Accessibility"
          title="키보드 접근성"
          titleId="content-keyboard"
          description="KWCAG 2.2 / WCAG 2.2 기준으로 웹사이트가 반드시 보장해야 하는 키보드 조작과, 단축키를 도입할 때 지켜야 하는 규칙을 정리합니다."
        />
      </ContentIntroLayout>

      <section aria-labelledby="standard-keys">
        <ContentSectionTitle id="standard-keys" lead>
          표준 키 조작 (필수)
        </ContentSectionTitle>
        <p className="text-body-small foreground-subtle mt-0 mb-6">
          마우스 없이 모든 기능을 사용할 수 있어야 합니다. (WCAG 2.1.1 키보드 · 2.1.2 키보드 트랩 없음 / KWCAG 6.1.1·6.1.3)
          <br />
          아래 표준 키(<Kbd>Tab</Kbd> <Kbd>Enter</Kbd> <Kbd>Space</Kbd> <Kbd>Esc</Kbd> 방향키)는 <b className="foreground-default">macOS·Windows 동일</b>합니다.
        </p>
        <KeyTable caption="전역 키보드 이동·활성화" rows={globalKeyRows} />
        <KeyTable caption="컴포넌트별 표준 키 (WAI-ARIA APG)" rows={componentKeyRows} />
      </section>

      <section aria-labelledby="os-keys">
        <ContentSectionTitle id="os-keys">운영체제별 키 차이 (macOS · Windows)</ContentSectionTitle>
        <p className="text-body-small foreground-subtle mt-0 mb-6">
          수정키·확대축소·문서 이동·화면낭독기는 OS마다 다릅니다. 단축키를 안내할 때는 사용자의 OS를 감지해
          표기하거나 두 가지를 함께 적어 줍니다.
        </p>
        <OSKeyTable caption="macOS와 Windows의 키 대응표" rows={osKeyRows} />
      </section>

      <section aria-labelledby="app-shortcuts">
        <ContentSectionTitle id="app-shortcuts">편의 단축키 (권장)</ContentSectionTitle>
        <KeyTable caption="앱에서 흔히 제공하는 편의 단축키" rows={shortcutRows} />
      </section>

      <section aria-labelledby="shortcut-rules">
        <ContentSectionTitle id="shortcut-rules">단축키 도입 규칙</ContentSectionTitle>
        <p className="text-body-small foreground-subtle mt-0 mb-6">
          단일 문자(<Kbd>a</Kbd> <Kbd>/</Kbd> <Kbd>?</Kbd> 등)를 단축키로 쓸 경우, WCAG 2.1.4 / KWCAG 6.1.4에 따라
          <b className="foreground-default"> ① 끄기 · ② 재매핑 · ③ 포커스 시에만 동작</b> 중 하나 이상을 제공해야 합니다.
        </p>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {ruleItems.map((item) => (
            <li key={item.term} className="surface-subtle rounded-lg p-4">
              <p className="text-label-small foreground-default m-0 font-bold">{item.term}</p>
              <p className="text-label-xsmall foreground-subtle m-0 mt-1">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
