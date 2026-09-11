import { useRef, useEffect, useState, Fragment } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { config } from '@/portfolio.config';
import { fadeUpVariants } from '@/lib/animation';

const fadeUp = fadeUpVariants(48, 0.8, 0.12);

// ── Animated counter card ───────────────────────────────────────────────────

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

function StatCard({
  stat,
  delay,
  compact = false,
}: {
  stat: {
    label: string;
    value: number | string;
    prefix?: string;
    suffix?: string;
  };
  delay: number;
  compact?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [displayed, setDisplayed] = useState<number | string>(
    typeof stat.value === 'number' ? 0 : stat.value
  );
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated || typeof stat.value !== 'number') return;

    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated) return;
        setHasAnimated(true);
        observer.disconnect();

        const target = stat.value as number;
        const duration = 1600; // ms
        let start: number | null = null;

        const step = (timestamp: number) => {
          if (start === null) start = timestamp;
          const elapsed = timestamp - start;
          const progress = Math.min(elapsed / duration, 1);
          setDisplayed(Math.round(easeOutQuart(progress) * target));
          if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, stat.value]);

  return (
    <motion.div
      ref={cardRef}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={`rounded-2xl ${
        compact
          ? 'bg-white/50 p-3 text-center'
          : 'border-border bg-card card-hover border p-6'
      }`}
      data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <p
        className={`gradient-text mb-1 font-serif font-light ${
          compact ? 'text-3xl' : 'text-4xl'
        }`}
      >
        {stat.prefix ?? ''}
        {displayed}
        {stat.suffix ?? ''}
      </p>
      <p
        className={`text-muted-foreground tracking-wide ${
          compact ? 'text-[11px]' : 'text-xs'
        }`}
      >
        {stat.label}
      </p>
    </motion.div>
  );
}

// ── About section ───────────────────────────────────────────────────────────

export function About() {
  const ref = useRef<HTMLElement>(null);

  const emails = [config.email, ...config.extraEmails].filter(
    (v): v is string => Boolean(v)
  );

  const stats = config.stats.slice(0, 4);
  const languages = config.languages ?? [];
  const skillGroups = config.skills.filter(
    (group) => (group.items?.length ?? 0) > 0
  );

  return (
    <section
      id="about"
      ref={ref}
      className="relative overflow-hidden px-6 py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-16 md:grid-cols-2">
          {/* Left col */}
          <div>
            <motion.p
              variants={fadeUp}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="text-primary mb-4 font-mono text-xs font-medium tracking-widest uppercase"
            >
              About Me
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="section-heading text-foreground mb-6 text-4xl leading-tight md:text-5xl"
            >
              The person behind
              <br />
              <em className="font-light not-italic">the keyboard.</em>
            </motion.h2>
            <motion.div
              variants={fadeUp}
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="mb-8 h-px w-12"
              style={{
                background:
                  'linear-gradient(90deg, hsl(var(--primary)), transparent)',
              }}
            />
            <motion.p
              variants={fadeUp}
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="text-muted-foreground text-base leading-relaxed font-light whitespace-pre-line"
            >
              {config.about}
            </motion.p>

            {emails.length > 0 && (
              <motion.div
                variants={fadeUp}
                custom={4}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                className="text-muted-foreground mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium tracking-wide"
              >
                {emails.map((emailAddress, idx) => (
                  <Fragment key={emailAddress}>
                    {idx > 0 && <span className="opacity-40">·</span>}
                    <a
                      href={`mailto:${emailAddress}`}
                      className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                      {...(idx === 0 ? { 'data-testid': 'link-email' } : {})}
                    >
                      <Mail size={12} />
                      {emailAddress}
                    </a>
                  </Fragment>
                ))}
              </motion.div>
            )}
          </div>

          {/* Right col — numeric highlights + method cards + languages */}
          {(stats.length > 0 ||
            skillGroups.length > 0 ||
            languages.length > 0) && (
            <div className="flex flex-col gap-4">
              {stats.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {stats.map((stat, i) => (
                    <StatCard
                      key={stat.label}
                      stat={stat}
                      delay={i + 1}
                      compact
                    />
                  ))}
                </div>
              )}

              {skillGroups.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {skillGroups.map((group, i) => (
                    <motion.div
                      key={group.category}
                      variants={fadeUp}
                      custom={stats.length + i + 1}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-60px' }}
                      className="bg-white/50 flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-2xl p-4"
                    >
                      <p className="text-primary text-center font-mono text-xs font-medium tracking-widest uppercase">
                        {group.category}
                      </p>
                      <ul className="flex flex-col items-center gap-1">
                        {group.items.map((item) => (
                          <li
                            key={item}
                            className="text-foreground/80 text-center text-[11px]"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              )}

              {languages.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {languages.map((lang, i) => (
                    <motion.div
                      key={lang.name}
                      variants={fadeUp}
                      custom={stats.length + skillGroups.length + i + 1}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-60px' }}
                      className="bg-white/50 flex min-h-[64px] flex-col items-center justify-center gap-0.5 rounded-2xl p-3"
                    >
                      <p className="text-foreground/90 text-xs font-semibold tracking-wide">
                        {lang.name}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {lang.level}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
