import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
  X,
} from 'lucide-react';
import { config } from '@/portfolio.config';
import { fadeUpVariants } from '@/lib/animation';
import { ProjectDiagram } from './ProjectDiagram';

const fadeUp = fadeUpVariants(44, 0.75, 0.12);

type Project = (typeof config.projects)[number];

function projectGallery(project: Project): string[] {
  if (project.images?.length) return project.images;
  return project.imageUrl ? [project.imageUrl] : [];
}

interface LightboxState {
  images: string[];
  title: string;
  index: number;
  credit?: string;
}

function Lightbox({
  state,
  onClose,
  onStep,
}: {
  state: LightboxState;
  onClose: () => void;
  onStep: (direction: number) => void;
}) {
  const total = state.images.length;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && total > 1) onStep(1);
      if (event.key === 'ArrowLeft' && total > 1) onStep(-1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onStep, total]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="Close image viewer"
      >
        <X size={18} />
      </button>

      {total > 1 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onStep(-1);
          }}
          className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          aria-label="Previous image"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <figure
        className="flex max-h-[88vh] max-w-[92vw] flex-col items-center gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={state.images[state.index]}
          alt=""
          className="max-h-[80vh] max-w-full rounded-xl object-contain"
        />
        <figcaption className="text-xs text-white/80">
          <span>
            {state.title} · {state.index + 1} / {total}
          </span>
          {state.credit && (
            <span className="mt-1 block text-[11px] text-white/60">
              {state.credit}
            </span>
          )}
        </figcaption>
      </figure>

      {total > 1 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onStep(1);
          }}
          className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          aria-label="Next image"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}

function ProjectMedia({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const imagesAllowed = import.meta.env.DEV || project.publicReady === true;
  const showImage =
    imagesAllowed && Boolean(project.imageUrl) && !failed;
  const gallerySize = projectGallery(project).length;

  return (
    <div className="bg-secondary/50 relative min-h-[200px] md:min-h-full">
      {showImage ? (
        <button
          type="button"
          onClick={onOpen}
          className="absolute inset-0 h-full w-full cursor-zoom-in"
          aria-label={`View ${project.name} images`}
        >
          <img
            src={project.imageUrl}
            alt={project.name}
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
          {gallerySize > 1 && (
            <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
              1 / {gallerySize}
            </span>
          )}
        </button>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
          <ProjectDiagram
            kind={project.diagram}
            className="text-primary/70 h-20 w-28"
          />
          {project.diagramLabel && (
            <p className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
              {project.diagramLabel}
            </p>
          )}
          {project.metrics && project.metrics.length > 0 && (
            <div className="grid w-full grid-cols-3 gap-2">
              {project.metrics.map((metric) => (
                <div key={metric.label} className="text-center">
                  <p className="text-foreground/80 text-xs font-semibold">
                    {metric.value}
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectThumb({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) {
  const [failed, setFailed] = useState(false);
  if (!project.images?.length) return null;
  const imagesAllowed = import.meta.env.DEV || project.publicReady === true;
  const showDiagram = !imagesAllowed || failed;

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={showDiagram}
      className="group/thumb bg-secondary/50 relative mb-1 block aspect-[3/2] w-full cursor-zoom-in overflow-hidden rounded-lg disabled:cursor-default"
      aria-label={`View ${project.name} images`}
    >
      {showDiagram ? (
        <span className="bg-secondary/40 absolute inset-0 flex items-center justify-center">
          <ProjectDiagram
            kind={project.diagram}
            className="text-primary/60 h-12 w-20"
          />
        </span>
      ) : (
        <img
          src={project.images[0]}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
          onError={() => setFailed(true)}
        />
      )}
      {!showDiagram && project.images.length > 1 && (
        <span className="absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
          +{project.images.length - 1}
        </span>
      )}
    </button>
  );
}

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="flex shrink-0 gap-2">
      {project.repoUrl && (
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg p-2 transition-all"
          aria-label="GitHub repo"
        >
          <Github size={16} />
        </a>
      )}
      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg p-2 transition-all"
          aria-label="Live project"
        >
          <ExternalLink size={16} />
        </a>
      )}
    </div>
  );
}

export function Projects() {
  const featured = config.projects.filter((p) => p.featured);
  const others = config.projects.filter((p) => !p.featured);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const openLightbox = (project: Project, index = 0) => {
    if (!(import.meta.env.DEV || project.publicReady === true)) return;
    const images = projectGallery(project);
    if (!images.length) return;
    setLightbox({
      images,
      title: project.name,
      index,
      credit: project.credit,
    });
  };

  const stepLightbox = (direction: number) => {
    setLightbox((current) => {
      if (!current) return current;
      const total = current.images.length;
      return { ...current, index: (current.index + direction + total) % total };
    });
  };

  return (
    <section id="projects" className="bg-secondary/20 px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <motion.p
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-primary mb-4 font-mono text-xs font-medium tracking-widest uppercase"
        >
          Work
        </motion.p>
        <motion.h2
          variants={fadeUp}
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="section-heading text-foreground mb-14 text-4xl md:text-5xl"
        >
          Case Studies
        </motion.h2>

        {/* Featured — full-width horizontal cards with image side */}
        <div className="mb-14 flex flex-col gap-6">
          {featured.map((project, i) => (
            <motion.div
              key={project.name}
              variants={fadeUp}
              custom={i + 2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="border-border bg-card card-hover grid overflow-hidden rounded-2xl border md:grid-cols-3"
              data-testid={`project-featured-${i}`}
            >
              <ProjectMedia
                project={project}
                onOpen={() => openLightbox(project, 0)}
              />
              <div className="flex flex-col justify-center p-7 md:col-span-2">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <h3 className="text-foreground group-hover:text-primary font-serif text-2xl font-light transition-colors">
                    {project.name}
                  </h3>
                  <ProjectLinks project={project} />
                </div>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed font-light">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-secondary text-secondary-foreground border-border rounded-md border px-2.5 py-1 font-mono text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Other projects — compact cards with thumbnail popup */}
        {others.length > 0 && (
          <>
            <motion.h3
              variants={fadeUp}
              custom={featured.length + 2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="text-muted-foreground mb-6 font-mono text-xs font-medium tracking-widest uppercase"
            >
              More Projects
            </motion.h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((project, i) => (
                <motion.div
                  key={project.name}
                  variants={fadeUp}
                  custom={i + featured.length + 3}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  className="border-border bg-card card-hover flex flex-col gap-3 rounded-xl border p-5"
                  data-testid={`project-other-${i}`}
                >
                  <ProjectThumb
                    project={project}
                    onOpen={() => openLightbox(project, 0)}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-foreground group-hover:text-primary font-serif text-lg font-light transition-colors">
                      {project.name}
                    </h4>
                    <div className="flex gap-1">
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
                          aria-label="GitHub"
                        >
                          <Github size={14} />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
                          aria-label="Live"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground flex-1 text-xs leading-relaxed font-light">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-secondary text-secondary-foreground rounded px-2 py-0.5 font-mono text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
      {lightbox && (
        <Lightbox
          state={lightbox}
          onClose={() => setLightbox(null)}
          onStep={stepLightbox}
        />
      )}
    </section>
  );
}
