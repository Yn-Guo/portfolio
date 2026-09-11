import { useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { config } from '@/portfolio.config';
import { TwoColumnLayout } from '@/pages/resume';
import { ProjectDiagram } from '@/components/sections/ProjectDiagram';

type PortfolioLanguage = 'en' | 'zh';

const PROJECT_ORDER = [
  'IntCDC Building Fibre Component',
  'livMatS Pavilion',
  'ITECH Research Pavilion 2024',
  'AI-Assisted ML & Collaboration Methodology',
  'Yuehai Culture and Sports Center, Shenzhen',
  "Yanchang Petro Tower, Xi'an",
  'Yujing Center, Xiamen',
  'Jining Cultural & Activity Center',
  'Beach Park, Rizhao',
  'Hutong Courtyard Renovation (Bamboo-Steel), Beijing',
  'Glass Staircase, School Media Room, Beijing',
];

function CardImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className="bg-secondary/40 relative aspect-[3/2] overflow-hidden">
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ProjectDiagram kind="detail" className="text-primary/60 h-16 w-24" />
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  language,
}: {
  project: (typeof config.projects)[number];
  language: PortfolioLanguage;
}) {
  const name =
    language === 'zh' ? (project.nameZh ?? project.name) : project.name;
  const description =
    language === 'zh'
      ? (project.descriptionZh ?? project.description)
      : project.description;

  return (
    <div className="border-border break-inside-avoid overflow-hidden rounded-xl border">
      <CardImage src={project.images?.[0]} alt={name} />
      <div className="p-3">
        <p className="text-foreground text-[11px] leading-snug font-semibold">
          {name}
        </p>
        <p className="text-muted-foreground mt-1 text-[9px] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export function ApplicationPage() {
  const [language, setLanguage] = useState<PortfolioLanguage>(() => {
    const queryLanguage = new URLSearchParams(window.location.search).get(
      'lang'
    );
    if (queryLanguage === 'en' || queryLanguage === 'zh') return queryLanguage;
    return (
      (localStorage.getItem('application-lang') as PortfolioLanguage) ?? 'en'
    );
  });

  const profile = config.resume?.[language] ?? config.resume?.en;

  if (!profile) {
    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center text-sm">
        Resume configuration is missing.
      </div>
    );
  }

  const setAndStoreLanguage = (next: PortfolioLanguage) => {
    setLanguage(next);
    localStorage.setItem('application-lang', next);
  };

  const portfolioProjects = config.projects.filter(
    (project) => project.portfolioCard !== false
  );
  const byName = new Map(
    portfolioProjects.map((project) => [project.name, project])
  );
  const ordered = PROJECT_ORDER.map((name) => byName.get(name)).filter(
    (project): project is (typeof config.projects)[number] => Boolean(project)
  );
  const remaining = portfolioProjects.filter(
    (project) => !PROJECT_ORDER.includes(project.name)
  );
  const projects = [...ordered, ...remaining];

  const labels =
    language === 'zh'
      ? {
          section: '代表项目',
          note: '项目图片来自个人项目档案，仅用于求职申请，不用于再分发；图片授权可按需提供。',
          toolbar: '简历 + 项目作品集',
        }
      : {
          section: 'Selected Projects',
          note: 'Project imagery from personal project archive — application use only, not for redistribution. Project credits available on request.',
          toolbar: 'Resume + project portfolio',
        };

  return (
    <div
      className={`bg-muted/40 min-h-screen print:min-h-0 print:bg-white ${
        language === 'zh' ? 'resume-zh' : ''
      }`}
    >
      <div className="no-print bg-background/90 border-border sticky top-0 z-50 flex items-center justify-between gap-4 border-b px-6 py-3 backdrop-blur print:hidden">
        <a
          href="#/"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          <ArrowLeft size={13} />
          Portfolio
        </a>
        <div className="flex items-center gap-2">
          <div className="bg-secondary border-border flex items-center gap-1 rounded-lg border p-1">
            <button
              onClick={() => setAndStoreLanguage('en')}
              aria-pressed={language === 'en'}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                language === 'en'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setAndStoreLanguage('zh')}
              aria-pressed={language === 'zh'}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                language === 'zh'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              中文
            </button>
          </div>
          <span className="text-muted-foreground hidden text-xs sm:inline">
            {labels.toolbar}
          </span>
          <button
            onClick={() => window.print()}
            className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium"
          >
            <Printer size={13} />
            Save PDF
          </button>
        </div>
      </div>

      <div className="flex justify-center px-4 py-8 print:px-0 print:py-0">
        <div className="resume-paper bg-background min-h-[1123px] w-full max-w-[794px] rounded-xl p-10 shadow-xl print:min-h-0 print:rounded-none print:bg-white print:p-8 print:shadow-none">
          <TwoColumnLayout data={profile} language={language} />

          <div className="mt-8">
            <p className="text-primary mb-4 flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] uppercase">
              {labels.section}
              <span className="bg-border h-px flex-1" />
            </p>
            <div className="grid grid-cols-2 gap-5">
              {projects.map((project) => (
                <ProjectCard
                  key={project.name}
                  project={project}
                  language={language}
                />
              ))}
            </div>
            <p className="text-muted-foreground mt-6 text-[9px] leading-relaxed">
              {labels.note}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 1.4cm 1.6cm; size: A4 portrait; }
          body { background: white !important; }
          .resume-paper { min-height: 0 !important; }
          .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
          p, li { orphans: 2; widows: 2; }
          h1, h2, h3, h4 { break-after: avoid; page-break-after: avoid; }
        }
      `}</style>
    </div>
  );
}
