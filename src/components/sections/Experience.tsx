import { motion } from 'framer-motion';
import { Building2, Landmark } from 'lucide-react';
import { config } from '@/portfolio.config';
import { fadeUpVariants } from '@/lib/animation';

const fadeUp = fadeUpVariants(40, 0.75, 0.13);

export function Experience() {
  return (
    <section id="experience" className="px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <motion.p
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-primary mb-4 font-mono text-xs font-medium tracking-widest uppercase"
        >
          Career
        </motion.p>
        <motion.h2
          variants={fadeUp}
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="section-heading text-foreground mb-14 text-4xl md:text-5xl"
        >
          Work Experience
        </motion.h2>

        <div className="flex flex-col gap-4">
          {config.experience.map((job, i) => (
            <motion.div
              key={`${job.company}-${i}`}
              variants={fadeUp}
              custom={i + 2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="border-border bg-card card-hover rounded-2xl border p-6"
              data-testid={`experience-${i}`}
            >
              <div className="flex items-start gap-6">
                <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                  {/universit/i.test(job.company) ? (
                    <Landmark size={20} />
                  ) : (
                    <Building2 size={20} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-foreground font-serif text-xl font-light">
                        {job.role}
                      </h3>
                      <p className="text-muted-foreground mt-0.5 text-sm tracking-wide">
                        {job.company}
                      </p>
                    </div>
                    <span className="text-muted-foreground bg-secondary border-border shrink-0 rounded-full border px-3 py-1 text-xs whitespace-nowrap">
                      {job.period}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-4 text-sm leading-relaxed font-light">
                    {job.description}
                  </p>
                  {job.highlights && job.highlights.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {job.highlights.map((h) => (
                        <li
                          key={h}
                          className="text-muted-foreground text-xs leading-relaxed"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
