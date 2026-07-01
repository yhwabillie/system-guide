import type { Metadata } from "next";
import {
  ContentIntroLayout,
  ContentSectionTitle,
  ContentTitleBlock,
  ExternalTextLink,
} from "@/components/guide/shared";
import { layoutPageColSpanFull } from "@/lib/layout-tokens";

export const metadata: Metadata = {
  title: "KWCAG 2.2 지침 — system-guide",
  description:
    "한국형 웹 콘텐츠 접근성 지침(KWCAG) 2.2 — 4원칙·14지침·33검사항목 전체 목록과 2.1→2.2 신규 항목 정리",
};

type Checkpoint = { no: string; name: string; desc: string; isNew?: boolean };
type Guideline = { no: string; name: string; checkpoints: Checkpoint[] };
type Principle = {
  index: number;
  ko: string;
  en: string;
  summary: string;
  guidelines: Guideline[];
};

const principles: Principle[] = [
  {
    index: 1,
    ko: "인식의 용이성",
    en: "Perceivable",
    summary: "모든 콘텐츠는 사용자가 인식할 수 있어야 한다.",
    guidelines: [
      {
        no: "5.1",
        name: "대체 텍스트",
        checkpoints: [
          {
            no: "5.1.1",
            name: "적절한 대체 텍스트 제공",
            desc: "텍스트가 아닌 콘텐츠(이미지·아이콘 등)에는 그 의미를 전달하는 대체 텍스트를 제공한다.",
          },
        ],
      },
      {
        no: "5.2",
        name: "멀티미디어 대체수단",
        checkpoints: [
          {
            no: "5.2.1",
            name: "자막 제공",
            desc: "동영상·음성 콘텐츠에는 자막·대본·수어 등 동등한 대체수단을 제공한다.",
          },
        ],
      },
      {
        no: "5.3",
        name: "적응성",
        checkpoints: [
          { no: "5.3.1", name: "표의 구성", desc: "표는 제목 셀과 범위를 지정해 이해하기 쉽게 구성한다." },
          {
            no: "5.3.2",
            name: "콘텐츠의 선형구조",
            desc: "콘텐츠는 논리적인 순서로 선형화해도 의미가 유지되도록 구성한다.",
          },
          {
            no: "5.3.3",
            name: "명확한 지시사항 제공",
            desc: "모양·위치·크기·소리 등 감각적 특성에만 의존하지 않고 안내한다.",
          },
        ],
      },
      {
        no: "5.4",
        name: "명료성",
        checkpoints: [
          { no: "5.4.1", name: "색에 무관한 콘텐츠 인식", desc: "색만으로 정보를 구분하거나 전달하지 않는다." },
          { no: "5.4.2", name: "자동 재생 금지", desc: "소리가 자동으로 재생되지 않게 하거나 제어 수단을 제공한다." },
          {
            no: "5.4.3",
            name: "텍스트 콘텐츠의 명도 대비",
            desc: "본문 텍스트는 최소 4.5:1, 큰 텍스트·UI 요소는 3:1 이상의 명도 대비를 확보한다.",
          },
          { no: "5.4.4", name: "콘텐츠 간의 구분", desc: "이웃한 콘텐츠는 시각적으로 구별되도록 표시한다." },
        ],
      },
    ],
  },
  {
    index: 2,
    ko: "운용의 용이성",
    en: "Operable",
    summary: "사용자 인터페이스 구성요소는 조작할 수 있어야 한다.",
    guidelines: [
      {
        no: "6.1",
        name: "입력장치 접근성",
        checkpoints: [
          { no: "6.1.1", name: "키보드 사용 보장", desc: "모든 기능을 키보드만으로 사용할 수 있어야 한다." },
          {
            no: "6.1.2",
            name: "초점 이동과 표시",
            desc: "초점은 논리적으로 이동하고, 현재 초점 위치가 시각적으로 드러나야 한다.",
          },
          {
            no: "6.1.3",
            name: "조작 가능",
            desc: "컨트롤·입력 요소는 충분한 크기로 제공해 조작 실수를 줄인다(터치 타깃 확보).",
          },
          {
            no: "6.1.4",
            name: "문자 단축키",
            desc: "단일 문자 단축키는 끄기·재설정하거나 포커스 시에만 동작하도록 한다.",
            isNew: true,
          },
        ],
      },
      {
        no: "6.2",
        name: "충분한 시간 제공",
        checkpoints: [
          { no: "6.2.1", name: "응답시간 조절", desc: "시간제한이 있는 콘텐츠는 연장·해제할 수 있어야 한다." },
          {
            no: "6.2.2",
            name: "정지 기능 제공",
            desc: "자동으로 변경되는 콘텐츠는 정지·중단·숨김 기능을 제공한다.",
          },
        ],
      },
      {
        no: "6.3",
        name: "광과민성 발작 예방",
        checkpoints: [
          {
            no: "6.3.1",
            name: "깜빡임과 번쩍임 사용 제한",
            desc: "초당 3~50회 번쩍이는 콘텐츠를 사용하지 않는다.",
          },
        ],
      },
      {
        no: "6.4",
        name: "쉬운 내비게이션",
        checkpoints: [
          {
            no: "6.4.1",
            name: "반복 영역 건너뛰기",
            desc: "반복되는 영역을 건너뛰어 본문으로 이동하는 수단(Skip Nav)을 제공한다.",
          },
          { no: "6.4.2", name: "제목 제공", desc: "페이지·프레임·콘텐츠 블록에 적절한 제목을 제공한다." },
          {
            no: "6.4.3",
            name: "적절한 링크 텍스트",
            desc: "링크 텍스트만으로 또는 맥락과 함께 목적을 알 수 있어야 한다.",
          },
          {
            no: "6.4.4",
            name: "고정된 참조 위치 정보",
            desc: "전자출판 등에서 페이지 번호 같은 위치 참조 정보를 일관되게 유지한다.",
            isNew: true,
          },
        ],
      },
      {
        no: "6.5",
        name: "입력 방식",
        checkpoints: [
          {
            no: "6.5.1",
            name: "단일 포인터 입력 지원",
            desc: "다중 포인터·경로 기반 동작에는 단일 포인터로 쓸 수 있는 대안을 제공한다.",
            isNew: true,
          },
          {
            no: "6.5.2",
            name: "포인터 입력 취소",
            desc: "실수를 막도록 포인터 입력을 취소·되돌릴 수 있게 한다(업 이벤트 기준 실행).",
            isNew: true,
          },
          {
            no: "6.5.3",
            name: "레이블과 네임",
            desc: "시각적 레이블과 접근성 이름(accessible name)이 일치해야 한다.",
            isNew: true,
          },
          {
            no: "6.5.4",
            name: "동작기반 작동",
            desc: "기기 흔들기·기울이기 등 동작 기반 기능에 대체 조작·비활성화를 제공한다.",
            isNew: true,
          },
        ],
      },
    ],
  },
  {
    index: 3,
    ko: "이해의 용이성",
    en: "Understandable",
    summary: "콘텐츠와 사용자 인터페이스는 이해할 수 있어야 한다.",
    guidelines: [
      {
        no: "7.1",
        name: "가독성",
        checkpoints: [
          {
            no: "7.1.1",
            name: "기본 언어 표시",
            desc: "페이지의 주 언어를 lang 속성으로 명확히 지정한다.",
          },
        ],
      },
      {
        no: "7.2",
        name: "예측 가능성",
        checkpoints: [
          {
            no: "7.2.1",
            name: "사용자 요구에 따른 실행",
            desc: "포커스·입력만으로 예기치 않은 맥락 변화가 일어나지 않도록 한다.",
          },
          {
            no: "7.2.2",
            name: "찾기 쉬운 도움 정보",
            desc: "도움말·문의 등 도움 기능을 페이지 간 일관된 위치에 배치한다.",
            isNew: true,
          },
        ],
      },
      {
        no: "7.3",
        name: "입력 도움",
        checkpoints: [
          {
            no: "7.3.1",
            name: "오류 정정",
            desc: "입력 오류를 알려주고 정정 방법을 안내한다.",
          },
          { no: "7.3.2", name: "레이블 제공", desc: "입력 서식 컨트롤에는 대응하는 레이블을 제공한다." },
          {
            no: "7.3.3",
            name: "접근 가능한 인증",
            desc: "인지 기능 테스트에만 의존하지 않는 인증 수단을 제공한다.",
            isNew: true,
          },
          {
            no: "7.3.4",
            name: "반복 입력 정보",
            desc: "이미 입력한 정보의 재입력을 최소화한다(자동 채움 등).",
            isNew: true,
          },
        ],
      },
    ],
  },
  {
    index: 4,
    ko: "견고성",
    en: "Robust",
    summary: "다양한 사용자 환경과 보조기술에서 호환되어야 한다.",
    guidelines: [
      {
        no: "8.1",
        name: "문법 준수",
        checkpoints: [
          {
            no: "8.1.1",
            name: "마크업 오류 방지",
            desc: "여닫는 태그·속성 중복 등 마크업 문법 오류를 방지한다.",
          },
        ],
      },
      {
        no: "8.2",
        name: "웹 애플리케이션 접근성",
        checkpoints: [
          {
            no: "8.2.1",
            name: "웹 애플리케이션 접근성 준수",
            desc: "플러그인·커스텀 컴포넌트의 접근성을 WAI-ARIA 등으로 확보한다.",
          },
        ],
      },
    ],
  },
];

const NEW_IN_22: { no: string; name: string }[] = principles
  .flatMap((p) => p.guidelines.flatMap((g) => g.checkpoints))
  .filter((c) => c.isNew)
  .map(({ no, name }) => ({ no, name }));

type MarkStep = { term: string; detail: string; covered: "yes" | "partial" | "no" };

/** 이 페이지의 지침만 적용했을 때 마크 획득까지의 실제 단계별 충족도 */
const markSteps: MarkStep[] = [
  {
    term: "표준 근거 확보",
    detail: "KWCAG 2.2의 4원칙·14지침·33검사항목을 정확히 파악 — 이 페이지가 담는 범위.",
    covered: "yes",
  },
  {
    term: "실제 구현 준수",
    detail: "33개 검사항목을 실제 페이지·컴포넌트에 빠짐없이 구현(대체텍스트·명도대비·키보드·마크업 오류 0 등).",
    covered: "partial",
  },
  {
    term: "자체 점검",
    detail: "WAVE·W3C Validator 등 자동 점검 + 화면낭독기(NVDA·VoiceOver) 수동 점검으로 오류를 제거.",
    covered: "no",
  },
  {
    term: "전문가·사용자 평가",
    detail: "지정 인증기관의 전문가 심사와 장애인 사용자 평가를 통과해야 마크가 부여됨(신청·수수료·유효기간 1년).",
    covered: "no",
  },
];

type SourceLink = { label: string; href: string; note: string };

const sourceLinks: SourceLink[] = [
  {
    label: "국가표준 KS X OT0003 — 한국형 웹 콘텐츠 접근성 지침 2.2 (TTA 표준)",
    href: "https://www.tta.or.kr/data/ttas_view.jsp?pk_num=TTAK.OT-10.0003/R2",
    note: "표준 원문(방송통신표준심의회 제정, 2022-12-28).",
  },
  {
    label: "KWCAG 2.2 검사항목 정리 — a11ykr",
    href: "https://a11ykr.github.io/kwcag22/",
    note: "4원칙·14지침·33검사항목 전체 목록의 대조 근거.",
  },
  {
    label: "KWCAG 2.2 변경 사항 개요 — mulder21c",
    href: "https://mulder21c.io/understanding-kwcag-22-changes-intro/",
    note: "2.1→2.2 신규 지침 2개·검사항목 9개의 대조 근거.",
  },
  {
    label: "정보접근성 인증소개 — 한국디지털접근성진흥원",
    href: "http://www.kwacc.or.kr/Accessibility/Certification",
    note: "웹접근성 품질인증(마크) 제도·절차 안내.",
  },
];

const markCoverLabel: Record<MarkStep["covered"], string> = {
  yes: "가이드가 지원",
  partial: "일부 지원 · 직접 구현 필요",
  no: "직접 수행 필요",
};

const markCoverTone: Record<MarkStep["covered"], ChipTone> = {
  yes: "brand",
  partial: "attention",
  no: "neutral",
};

/** 페이지 전역 칩(pill) — subtle 배경 + tone별 텍스트 색으로 통일 */
type ChipTone = "brand" | "attention" | "neutral";

const chipToneClass: Record<ChipTone, string> = {
  brand: "foreground-brand",
  attention: "foreground-attention",
  neutral: "foreground-subtle",
};

function Chip({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: ChipTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`surface-subtle text-caption inline-flex items-center rounded-full px-2 py-0.5 font-bold ${chipToneClass[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="surface-subtle border-default flex flex-col gap-1 rounded-xl border p-5">
      <span className="text-display-sm foreground-brand numeric-tabular font-bold">{value}</span>
      <span className="text-label-xsmall foreground-subtle font-bold tracking-[0.08em] uppercase">{label}</span>
    </div>
  );
}

function GuidelineBlock({ guideline }: { guideline: Guideline }) {
  return (
    <div className="border-default overflow-hidden rounded-xl border">
      <div className="surface-subtle border-default flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b px-5 py-3">
        <span className="text-label-small foreground-brand numeric-tabular font-bold">지침 {guideline.no}</span>
        <span className="text-label-medium foreground-default font-bold">{guideline.name}</span>
      </div>
      <ul className="m-0 flex list-none flex-col p-0">
        {guideline.checkpoints.map((cp) => (
          <li
            key={cp.no}
            className="border-default flex flex-col gap-1 border-b px-5 py-4 last:border-b-0 sm:flex-row sm:gap-4"
          >
            <span className="text-label-small foreground-subtle numeric-tabular shrink-0 font-bold sm:w-16 sm:pt-0.5">
              {cp.no}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-label-medium foreground-default m-0 font-bold">
                {cp.name}
                {cp.isNew ? (
                  <Chip tone="brand" className="ml-2 align-middle">
                    2.2 신규
                  </Chip>
                ) : null}
              </p>
              <p className="text-label-xsmall foreground-subtle m-0 mt-1">{cp.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function KwcagGuidelinePage() {
  const totalCheckpoints = principles.reduce(
    (sum, p) => sum + p.guidelines.reduce((s, g) => s + g.checkpoints.length, 0),
    0,
  );
  const totalGuidelines = principles.reduce((sum, p) => sum + p.guidelines.length, 0);

  return (
    <div className={layoutPageColSpanFull}>
      <ContentIntroLayout>
        <ContentTitleBlock
          eyebrow="Accessibility"
          title="KWCAG 2.2 지침"
          titleId="content-kwcag"
          description="한국형 웹 콘텐츠 접근성 지침(KWCAG) 2.2 — 국가표준 KS X OT0003 — 의 4원칙·14지침·33검사항목 전체를 정리합니다. 이 가이드는 KWCAG 2.2 1등급 달성을 목표로 제작되었습니다."
        />
      </ContentIntroLayout>

      <section aria-labelledby="kwcag-overview">
        <ContentSectionTitle id="kwcag-overview" lead>
          표준 개요
        </ContentSectionTitle>
        <p className="text-body-small foreground-subtle mt-0 mb-6">
          KWCAG 2.2는 원칙(Principle) → 지침(Guideline) → 검사항목(Requirement) 3단계 체제로 구성됩니다. 2021년의 2.1(24개
          검사항목)에서 WCAG 2.1·2.2 기준을 반영해 9개 항목이 추가되었습니다.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard value="4" label="원칙" />
          <StatCard value={String(totalGuidelines)} label="지침" />
          <StatCard value={String(totalCheckpoints)} label="검사항목" />
          <StatCard value={`+${NEW_IN_22.length}`} label="2.2 신규" />
        </div>
      </section>

      {principles.map((principle) => (
        <section key={principle.index} aria-labelledby={`principle-${principle.index}`}>
          <ContentSectionTitle id={`principle-${principle.index}`}>
            원칙 {principle.index}. {principle.ko}
            <span className="text-body-small foreground-subtle ml-3 font-normal">{principle.en}</span>
          </ContentSectionTitle>
          <p className="text-body-small foreground-subtle mt-0 mb-6">{principle.summary}</p>
          <div className="flex flex-col gap-4">
            {principle.guidelines.map((guideline) => (
              <GuidelineBlock key={guideline.no} guideline={guideline} />
            ))}
          </div>
        </section>
      ))}

      <section aria-labelledby="kwcag-new">
        <ContentSectionTitle
          id="kwcag-new"
          description="2.1 대비 2.2에서 추가된 검사항목입니다. 대부분 WCAG 2.1·2.2의 기준(타깃 크기·문자 단축키·포인터 제스처·동작 기반 작동·접근 가능한 인증·일관된 도움말 등)을 반영한 것입니다."
        >
          2.1 → 2.2 신규 항목
        </ContentSectionTitle>
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
          {NEW_IN_22.map((cp) => (
            <li key={cp.no} className="surface-subtle border-default flex items-baseline gap-3 rounded-lg border p-4">
              <span className="text-label-small foreground-brand numeric-tabular shrink-0 font-bold">{cp.no}</span>
              <span className="text-label-medium foreground-default font-bold">{cp.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="kwcag-mark">
        <ContentSectionTitle
          id="kwcag-mark"
          description="이 가이드의 지침 적용부터 웹접근성 마크(웹접근성 품질인증)를 받기까지의 단계와, 각 단계에서 디자인 시스템이 어디까지 지원하는지 정리합니다."
        >
          마크 획득 단계
        </ContentSectionTitle>

        <div className="surface-subtle border-attention rounded-xl border p-5">
          <p className="text-label-medium foreground-default m-0 font-bold">
            결론 — 지침을 아는 것은 필요조건이지만 충분조건은 아닙니다.
          </p>
          <p className="text-label-xsmall foreground-subtle m-0 mt-2">
            이 페이지는 KWCAG 2.2 <b className="foreground-default">표준의 검사항목 목록</b>을 담습니다. 마크는 이
            33개 항목을 <b className="foreground-default">실제 서비스에 올바르게 구현</b>하고, 지정 인증기관의{" "}
            <b className="foreground-default">전문가 심사와 장애인 사용자 평가를 통과</b>해야 부여됩니다(신청·수수료,
            유효기간 1년). 즉 목록 자체가 마크를 보장하지는 않습니다.
          </p>
        </div>

        <ol className="mt-6 mb-0 flex list-none flex-col gap-3 p-0">
          {markSteps.map((step, i) => (
            <li key={step.term} className="border-default flex items-start gap-4 rounded-lg border p-4">
              <span
                aria-hidden="true"
                className="surface-subtle text-label-small foreground-default numeric-tabular flex size-8 shrink-0 items-center justify-center rounded-full font-bold"
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-label-medium foreground-default font-bold">{step.term}</span>
                  <Chip tone={markCoverTone[step.covered]}>{markCoverLabel[step.covered]}</Chip>
                </div>
                <p className="text-label-xsmall foreground-subtle m-0 mt-1">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="text-label-xsmall foreground-subtle mt-4 mb-0">
          이 디자인 시스템 가이드는 1·2단계(표준 근거 + 토큰·컴포넌트 차원의 구현 준수)를 지원합니다. 3·4단계(자체
          점검·인증 심사)는 서비스 전체를 대상으로 별도로 수행해야 합니다.
        </p>
      </section>

      <section aria-labelledby="kwcag-sources">
        <ContentSectionTitle
          id="kwcag-sources"
          description="이 페이지의 항목명·번호·신규 여부는 아래 표준 원문과 공개 정리 자료를 대조해 작성했습니다."
        >
          출처 및 근거
        </ContentSectionTitle>
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {sourceLinks.map((src) => (
            <li key={src.href} className="border-default rounded-lg border p-4">
              <ExternalTextLink href={src.href} className="text-label-medium foreground-brand font-bold">
                {src.label}
              </ExternalTextLink>
              <p className="text-label-xsmall foreground-subtle m-0 mt-1.5 pl-6">{src.note}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
