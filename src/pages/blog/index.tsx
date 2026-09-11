import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Tag, ArrowLeft, Rss } from 'lucide-react';
import { allPosts, allTags } from '@/lib/blog';
import { config } from '@/portfolio.config';

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function BlogListPage() {
  const categories = config.blog?.categories ?? [];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = allPosts.filter(
    (p) =>
      (!activeCategory || p.category === activeCategory) &&
      (!activeTag || p.tags.includes(activeTag))
  );
  const activeCategoryMeta = categories.find(
    (category) => category.slug === activeCategory
  );

  const blogTitle = config.blog?.title ?? 'Blog';
  const blogDescription =
    config.blog?.description ?? 'Thoughts, stories and ideas.';

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Top bar */}
      <div className="bg-background/85 border-border/60 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <a
            href="#/"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft size={15} />
            Back to portfolio
          </a>
          <a
            href="#/blog"
            className="text-primary flex items-center gap-1.5 text-xs font-medium tracking-widest uppercase"
          >
            <Rss size={13} />
            {blogTitle}
          </a>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-foreground mb-3 font-serif text-4xl font-medium sm:text-5xl">
            {blogTitle}
          </h1>
          <p className="text-muted-foreground text-base">{blogDescription}</p>
        </motion.div>

        {/* Category filter */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  activeCategory === null
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() =>
                    setActiveCategory(
                      activeCategory === category.slug ? null : category.slug
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    activeCategory === category.slug
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            {activeCategoryMeta?.description && (
              <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                {activeCategoryMeta.description}
              </p>
            )}
          </motion.div>
        )}

        {/* Tag filter */}
        {allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-10 flex flex-wrap gap-2"
          >
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                  activeTag === tag
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        )}

        {/* Posts */}
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">No posts found.</p>
        ) : (
          <div className="space-y-8">
            {filtered.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.45 }}
              >
                <a
                  href={`#/blog/${post.slug}`}
                  className="group border-border hover:border-primary/30 hover:bg-secondary/30 block rounded-2xl border p-6 transition-all"
                >
                  {/* Cover image */}
                  {post.cover && (
                    <div className="mb-4 aspect-[2/1] overflow-hidden rounded-xl">
                      <img
                        src={post.cover}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Category + tags */}
                  {(post.category || post.tags.length > 0) && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {post.category && (
                        <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
                          {categories.find((c) => c.slug === post.category)
                            ?.name ?? post.category}
                        </span>
                      )}
                      {post.tags.map((t) => (
                        <span
                          key={t}
                          className="bg-accent text-accent-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                        >
                          <Tag size={9} />
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-foreground group-hover:text-primary mb-2 font-serif text-xl leading-snug font-medium transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-muted-foreground mb-4 line-clamp-3 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="text-muted-foreground flex items-center gap-4 text-xs">
                    {post.date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={11} />
                        {formatDate(post.date)}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} />
                      {post.readingTime} min read
                    </span>
                    <span className="text-primary ml-auto text-xs font-medium group-hover:underline">
                      Read →
                    </span>
                  </div>
                </a>
              </motion.article>
            ))}
          </div>
        )}

        {/* Empty blog hint */}
        {allPosts.length === 0 && (
          <div className="mt-16 text-center">
            <p className="mb-4 text-4xl">✍️</p>
            <p className="text-muted-foreground text-sm">
              No posts yet. Categories are ready — add a{' '}
              <span className="bg-secondary text-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                .md
              </span>{' '}
              file to your{' '}
              <span className="bg-secondary text-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                blog/
              </span>{' '}
              folder with a{' '}
              <span className="bg-secondary text-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                category
              </span>{' '}
              to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
