import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer,
  ArrowLeft,
  Columns2,
  AlignJustify,
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa6';
import { config, type ResumeContent } from '@/portfolio.config';
import { applyThemePalette, hexToPresetPalette } from '@/lib/themes';
import { ShareModal } from '@/components/ShareModal';

/** First sentence of a description, so the full CV stays readable. */
function firstSentence(text: string): string {
  const match = text.match(/^(.+?[.。!?！？])(\s|$)/);
  return (match ? match[1] : text).trim();
}

type Layout = 'two-column' | 'classic';
type ResumeLanguage = 'en' | 'zh';

interface ResumePageProps {
  theme: string;
  onToggleTheme: () => void;
}

const LABELS: Record<
  ResumeLanguage,
  {
    summary: string;
    skills: string;
    experience: string;
    projects: string;
    publications: string;
    education: string;
    languages: string;
  }
> = {
  en: {
    summary: 'Summary',
    skills: 'Skills',
    experience: 'Experience',
    projects: 'Selected Projects',
    publications: 'Selected Publications',
    education: 'Education',
    languages: 'Languages',
  },
  zh: {
    summary: '个人简介',
    skills: '技能',
    experience: '工作经历',
    projects: '代表项目',
    publications: '代表论文',
    education: '教育背景',
    languages: '语言',
  },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-primary mb-2.5 flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.2em] uppercase">
      {children}
      <span className="bg-border h-px flex-1" />
    </p>
  );
}

function ResumeHeader({
  data,
  language,
  compact = false,
}: {
  data: ResumeContent;
  language: ResumeLanguage;
  compact?: boolean;
}) {
  // Phone number and location are deliberately absent from the published config,
  // so they never reach the public bundle. The PDF export injects them via the URL.
  const params = new URLSearchParams(window.location.search);
  const phone = params.get('phone') ?? '';
  const location = params.get('location') ?? '';
  const linkedin = config.social.linkedin?.replace(
    /^https?:\/\/(www\.)?linkedin\.com\/in\//,
    ''
  );

  return (
    <div className={`${compact ? 'mb-4' : 'mb-8'}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="sm:w-[400px] sm:shrink-0">
          <h1 className="text-foreground font-serif text-3xl leading-none font-light tracking-tight">
            {data.name}
          </h1>
          {language === 'zh' ? (
            <p className="text-primary mt-1 text-[13px] font-medium tracking-[0.08em] whitespace-nowrap">
              {data.title}
            </p>
          ) : (
            <p className="text-primary mt-1 text-[11px] leading-snug font-medium tracking-[0.08em] uppercase">
              {data.title.split(' · ').map((part) => (
                <span key={part} className="block">
                  {part}
                </span>
              ))}
            </p>
          )}
        </div>

        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs sm:w-[280px] sm:shrink-0 sm:justify-end sm:text-right">
          <a
            href={`mailto:${data.contact.email}`}
            className="hover:text-primary flex items-center gap-1 transition-colors"
          >
            <Mail size={11} /> {data.contact.email}
          </a>
          {phone && (
            <span className="flex items-center gap-1">
              <Phone size={11} /> {phone}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {location}
            </span>
          )}
          {config.social.linkedin && (
            <a
              href={config.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary flex items-center gap-1 transition-colors"
            >
              <FaLinkedin size={11} /> {linkedin}
            </a>
          )}
        </div>
      </div>
      <div className="from-primary via-primary/30 mt-4 h-px bg-gradient-to-r to-transparent" />
    </div>
  );
}

function SummaryBlock({
  data,
  label,
}: {
  data: ResumeContent;
  label: string;
}) {
  return (
    <div className="mb-6">
      <SectionLabel>{label}</SectionLabel>
      <p className="text-muted-foreground text-justify text-xs leading-relaxed whitespace-pre-line">
        {data.summary}
      </p>
    </div>
  );
}

function SkillsBlock({
  data,
  label,
}: {
  data: ResumeContent;
  label: string;
}) {
  return (
    <div className="mb-5">
      <SectionLabel>{label}</SectionLabel>
      <div className="space-y-2">
        {data.skills.map((group) => (
          <div key={group.category}>
            <p className="text-foreground text-[11px] font-semibold">
              {group.category}
            </p>
            <p className="text-muted-foreground text-[10px] leading-relaxed">
              {group.items.join(' · ')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExperienceBlock({
  data,
  label,
}: {
  data: ResumeContent;
  label: string;
}) {
  return (
    <div className="mb-6">
      <SectionLabel>{label}</SectionLabel>
      <div className="space-y-4">
        {data.experience.map((job, i) => (
          <div key={i} className="break-inside-avoid">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="text-foreground text-sm font-semibold">
                  {job.role}
                </span>
                <span className="text-muted-foreground text-xs">
                  {' '}
                  · {job.company}
                </span>
              </div>
              <span className="text-muted-foreground shrink-0 font-mono text-[10px] whitespace-nowrap">
                {job.period}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              {job.description}
            </p>
            {(job.highlights ?? []).length > 0 && (
              <ul className="mt-1.5 space-y-0.5">
                {(job.highlights ?? []).map((highlight) => (
                  <li
                    key={highlight}
                    className="text-muted-foreground text-[10px] leading-relaxed"
                  >
                    • {highlight}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsBlock({
  data,
  label,
}: {
  data: ResumeContent;
  label: string;
}) {
  return (
    <div className="mb-6">
      <SectionLabel>{label}</SectionLabel>
      <div className="space-y-3">
        {data.projects.map((project, i) => (
          <div key={i} className="break-inside-avoid">
            <p className="text-foreground text-xs font-semibold">
              {project.name}
            </p>
            <p className="text-muted-foreground mt-0.5 text-[10px] leading-relaxed">
              {project.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PublicationsBlock({
  data,
  label,
}: {
  data: ResumeContent;
  label: string;
}) {
  return (
    <div className="mb-6">
      <SectionLabel>{label}</SectionLabel>
      <div className="space-y-3">
        {data.publications.map((pub, i) => (
          <div key={i} className="break-inside-avoid">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-[11px] leading-snug font-semibold">
                  {pub.url ? (
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      {pub.title}
                    </a>
                  ) : (
                    pub.title
                  )}
                </p>
                <p className="text-muted-foreground mt-0.5 text-[10px] leading-relaxed">
                  {pub.authors} · <span className="italic">{pub.venue}</span>
                  {pub.year ? `, ${pub.year}` : ''}
                </p>
              </div>
              {pub.url && (
                <a
                  href={pub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary mt-0.5 flex-shrink-0 hover:opacity-70"
                >
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationBlock({
  data,
  label,
}: {
  data: ResumeContent;
  label: string;
}) {
  return (
    <div className="mb-5">
      <SectionLabel>{label}</SectionLabel>
      <div className="space-y-2">
        {data.education.map((edu, i) => (
          <div key={i} className="break-inside-avoid">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-foreground text-[11px] font-semibold">
                {edu.degree}
              </span>
              <span className="text-muted-foreground font-mono text-[10px]">
                {edu.period}
              </span>
            </div>
            <p className="text-muted-foreground text-[10px]">
              {edu.institution}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LanguagesBlock({
  data,
  label,
}: {
  data: ResumeContent;
  label: string;
}) {
  return (
    <div className="mb-5">
      <SectionLabel>{label}</SectionLabel>
      <div className="space-y-1">
        {data.languages.map((language) => (
          <div
            key={language.name}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-foreground font-medium">
              {language.name}
            </span>
            <span className="text-muted-foreground">{language.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TwoColumnLayout({
  data,
  language,
}: {
  data: ResumeContent;
  language: ResumeLanguage;
}) {
  const labels = LABELS[language];
  return (
    <div>
      <ResumeHeader data={data} language={language} />
      <div className="grid grid-cols-[200px_1fr] gap-8">
        <aside className="border-border border-r pr-6">
          <SkillsBlock data={data} label={labels.skills} />
          <LanguagesBlock data={data} label={labels.languages} />
          <EducationBlock data={data} label={labels.education} />
        </aside>
        <main className="min-w-0">
          <SummaryBlock data={data} label={labels.summary} />
          <ExperienceBlock data={data} label={labels.experience} />
          <ProjectsBlock data={data} label={labels.projects} />
          <PublicationsBlock data={data} label={labels.publications} />
        </main>
      </div>
    </div>
  );
}

function ClassicLayout({
  data,
  language,
}: {
  data: ResumeContent;
  language: ResumeLanguage;
}) {
  const labels = LABELS[language];
  return (
    <div>
      <ResumeHeader data={data} language={language} compact />
      <SummaryBlock data={data} label={labels.summary} />
      <ExperienceBlock data={data} label={labels.experience} />
      <ProjectsBlock data={data} label={labels.projects} />
      <PublicationsBlock data={data} label={labels.publications} />
      <div className="grid grid-cols-2 gap-6">
        <div>
          <SkillsBlock data={data} label={labels.skills} />
          <LanguagesBlock data={data} label={labels.languages} />
        </div>
        <div>
          <EducationBlock data={data} label={labels.education} />
        </div>
      </div>
    </div>
  );
}

export function ResumePage({ theme, onToggleTheme }: ResumePageProps) {
  const [layout, setLayout] = useState<Layout>(() => {
    // ?layout=classic|two-column overrides the stored preference (used by the
    // PDF export, which has no localStorage to read).
    const queryLayout = new URLSearchParams(window.location.search).get('layout');
    if (queryLayout === 'classic' || queryLayout === 'two-column') return queryLayout;
    return (localStorage.getItem('resume-layout') as Layout) ?? 'two-column';
  });
  const [language, setLanguage] = useState<ResumeLanguage>(() => {
    const queryLang = new URLSearchParams(window.location.search).get('lang');
    if (queryLang === 'en' || queryLang === 'zh') return queryLang;
    return (localStorage.getItem('resume-lang') as ResumeLanguage) ?? 'en';
  });
  const [shareOpen, setShareOpen] = useState(false);

  const resumeData =
    config.resume?.[language] ?? config.resume?.en ?? undefined;

  // Full CV (?full=1, used by pnpm pdf:cv-full): same layout and the same
  // curated summary, skills and experience, but every project and every
  // publication from the site configuration — the long version is never
  // maintained twice.
  const isFull = new URLSearchParams(window.location.search).get('full') === '1';
  const activeData = useMemo(() => {
    if (!isFull || !resumeData) return resumeData;
    const zh = language === 'zh';
    const pick = (en?: string, zhText?: string) =>
      zh ? (zhText ?? en ?? '') : (en ?? '');

    return {
      ...resumeData,
      projects: config.projects.map((project) => ({
        name: pick(project.name, project.nameZh),
        description: firstSentence(pick(project.description, project.descriptionZh)),
      })),
      publications: config.publications.map((publication) => ({
        authors: publication.authors,
        title: publication.title,
        venue: publication.venue,
        year: publication.year,
        url: publication.url,
      })),
    } satisfies ResumeContent;
  }, [isFull, language, resumeData]);

  const setAndStoreLayout = (next: Layout) => {
    setLayout(next);
    localStorage.setItem('resume-layout', next);
  };

  const setAndStoreLanguage = (next: ResumeLanguage) => {
    setLanguage(next);
    localStorage.setItem('resume-lang', next);
  };

  useEffect(() => {
    const preset =
      layout === 'two-column'
        ? config.resumeTheme.twoColumn
        : config.resumeTheme.classic;
    applyThemePalette(preset, theme === 'dark', config.customColors);
    return () => {
      const palette = config.primaryColor
        ? hexToPresetPalette(config.primaryColor)
        : config.customColors;
      applyThemePalette(
        config.primaryColor ? 'custom' : (config.colorPreset as any),
        theme === 'dark',
        palette
      );
    };
  }, [layout, theme]);

  if (!resumeData) {
    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center text-sm">
        Resume configuration is missing.
      </div>
    );
  }

  const data = activeData ?? resumeData;

  return (
    <div
      className={`bg-muted/40 min-h-screen print:min-h-0 print:bg-white ${
        language === 'zh' ? 'resume-zh' : ''
      }`}
    >
      <div className="bg-background/90 border-border sticky top-0 z-50 flex items-center justify-between gap-4 border-b px-6 py-3 backdrop-blur print:hidden">
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
              onClick={() => setAndStoreLayout('two-column')}
              aria-label="Two-column layout"
              aria-pressed={layout === 'two-column'}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                layout === 'two-column'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Columns2 size={13} />
              <span className="hidden sm:inline">Two Column</span>
            </button>
            <button
              onClick={() => setAndStoreLayout('classic')}
              aria-label="Classic layout"
              aria-pressed={layout === 'classic'}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                layout === 'classic'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AlignJustify size={13} />
              <span className="hidden sm:inline">Classic</span>
            </button>
          </div>

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
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShareOpen(true)}
            aria-label="Share resume"
            className="border-border text-muted-foreground hover:text-foreground hover:border-primary/40 flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all"
          >
            <Share2 size={13} />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={() => window.print()}
            className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium tracking-wide transition-opacity hover:opacity-90"
          >
            <Printer size={13} />
            Save PDF
          </button>
        </div>
      </div>

      <div className="flex justify-center px-4 py-8 print:px-0 print:py-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${layout}-${language}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="resume-paper bg-background min-h-[1123px] w-full max-w-[794px] rounded-xl p-10 shadow-xl print:min-h-0 print:rounded-none print:bg-white print:p-8 print:shadow-none"
          >
            {layout === 'two-column' ? (
              <TwoColumnLayout data={data} language={language} />
            ) : (
              <ClassicLayout data={data} language={language} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @media print {
          @page { margin: 1.4cm 1.6cm; size: A4 portrait; }
          body { background: white !important; }
          [data-framer-component-type],
          [style*="transform"],
          [style*="opacity"] {
            transform: none !important;
            opacity: 1 !important;
          }
          .resume-paper { min-height: 0 !important; }
          .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
          p, li { orphans: 2; widows: 2; }
          h1, h2, h3, h4 { break-after: avoid; page-break-after: avoid; }
        }
      `}</style>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
