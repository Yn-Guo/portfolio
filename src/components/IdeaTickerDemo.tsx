import { useEffect, useMemo, useState } from 'react';

/**
 * A live stand-in for the desktop idea ticker, used inside blog posts.
 * The real tool reads ideas.md; this one cycles through a few examples so the
 * interaction can be tried without installing anything.
 */

const DEMO_IDEAS = [
  {
    title: 'Glossary skill, round two',
    body: 'Separate knowledge-base, domain and project-node terms, and let the map grow as the work happens instead of being regenerated afterwards.',
  },
  {
    title: 'A skill for read/write interface files',
    body: 'Survey how other skills handle interface contracts first, then write down my own conventions so the skill follows them instead of inventing its own.',
  },
  {
    title: "Fibre simulation: because life wasn't hard enough",
    body: 'The motto from my doctoral cap, used as the frame for a retrospective: story first, methods second.',
  },
  {
    title: 'Ticker as a music player',
    body: 'Title as the track name, the text as lyrics, a cover image behind it. Purely for the pleasure of it.',
  },
];

const ROTATE_MS = 7000;

export function IdeaTickerDemo() {
  const [index, setIndex] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  const idea = useMemo(() => DEMO_IDEAS[index], [index]);
  const expanded = pinned || hovered;

  const next = () => {
    setIndex((i) => (i + 1) % DEMO_IDEAS.length);
    setPinned(false);
  };

  // Advance on a timer, but stop while the reader is looking at the text.
  useEffect(() => {
    if (expanded) {
      setProgress(0);
      return;
    }
    const started = Date.now();
    const tick = window.setInterval(() => {
      const fraction = Math.min(1, (Date.now() - started) / ROTATE_MS);
      setProgress(fraction);
    }, 80);
    const rotate = window.setTimeout(next, ROTATE_MS);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(rotate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, expanded]);

  return (
    <div
      className="border-border bg-secondary/40 not-prose my-8 cursor-default overflow-hidden rounded-xl border transition-colors select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setPinned((p) => !p)}
      onDoubleClick={next}
      role="button"
      tabIndex={0}
      aria-label="Idea ticker demo: hover to read, click to keep it open, double-click for the next idea"
    >
      <div className="flex">
        <div className="bg-primary w-1 shrink-0" />
        <div className="min-w-0 flex-1 px-5 py-3.5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-foreground text-base font-semibold sm:text-lg">
              {idea.title}
            </p>
            <span className="text-muted-foreground mt-1 shrink-0 text-[11px] tabular-nums">
              {index + 1} / {DEMO_IDEAS.length}
            </span>
          </div>

          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ${
              expanded ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <p className="text-muted-foreground overflow-hidden text-sm leading-relaxed">
              {idea.body}
            </p>
          </div>

          <div className="bg-border mt-3 h-px w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-px transition-[width] duration-100 ease-linear"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>

          <p className="text-muted-foreground/70 mt-2 text-[11px]">
            hover to read &middot; click to keep it open &middot; double-click for the next one
          </p>
        </div>
      </div>
    </div>
  );
}
