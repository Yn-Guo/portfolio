import { motion } from 'framer-motion';
import { config } from '@/portfolio.config';
import { fadeUpVariants } from '@/lib/animation';

const fadeUp = fadeUpVariants(40, 0.7, 0.1);

export function Skills() {
  const areas = config.skillAreas ?? [];
  if (!areas.length) return null;

  const renderCard = (area: (typeof areas)[number], i: number) => (
    <motion.div
      key={area.category}
      variants={fadeUp}
      custom={i + 2}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="bg-white/50 rounded-2xl p-6"
      data-testid={`skills-group-${area.category.toLowerCase()}`}
    >
      <p className="text-primary mb-4 font-mono text-xs font-medium tracking-widest uppercase">
        {area.category}
      </p>
      <ul className="space-y-2">
        {area.items.map((skill) => (
          <li
            key={skill}
            className="text-muted-foreground text-xs leading-relaxed"
            data-testid={`skill-${skill.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          >
            {skill}
          </li>
        ))}
      </ul>
    </motion.div>
  );

  return (
    <section id="skills" className="bg-secondary/20 px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <motion.p
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-primary mb-4 font-mono text-xs font-medium tracking-widest uppercase"
        >
          Capabilities
        </motion.p>
        <motion.h2
          variants={fadeUp}
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="section-heading text-foreground mb-14 text-4xl md:text-5xl"
        >
          Skills
        </motion.h2>

        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {areas.slice(0, 2).map((area, i) => renderCard(area, i))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {areas.slice(2).map((area, i) => renderCard(area, i + 2))}
          </div>
        </div>
      </div>
    </section>
  );
}
