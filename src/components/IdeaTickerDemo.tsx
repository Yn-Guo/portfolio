import { useEffect, useMemo, useState } from 'react';

/**
 * A live stand-in for the desktop idea ticker, used inside blog posts.
 * The real tool reads ideas.md; this one cycles through a few examples so the
 * interaction can be tried without installing anything.
 */

// Invented entries: nothing here is from the real list.
const DEMO_IDEAS = [
  {
    title: 'Learn enough letterpress to set one page',
    body: 'Not a skill I need. Worth doing once, slowly, to remember that type has weight.',
  },
  {
    title: 'A walking route that avoids every main road',
    body: 'Map it once, keep it on paper, and use it on the days when the city is too loud.',
  },
  {
    title: 'Copy the good recipes onto cards by hand',
    body: 'They are scattered across screenshots, messages and page margins. One small box, actually legible.',
  },
  {
    title: 'Model a building that could never be built',
    body: 'No client, no site, no codes to satisfy. Just to see what the geometry wants to do.',
  },
  {
    title: 'Record one song, badly, with friends',
    body: 'One afternoon, one microphone, no second take. The point is the afternoon.',
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
            example entries &middot; hover to read &middot; click to keep it open &middot; double-click
            for the next one
          </p>
        </div>
      </div>
    </div>
  );
}
