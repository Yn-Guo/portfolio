import { useState } from 'react';
import { Check, Copy, ExternalLink, Quote } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Publication } from '@/portfolio.config';
import {
  citationDoi,
  citationSourceUrl,
  citationVenue,
  toBibtex,
  toVancouver,
} from '@/lib/citations';

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard is unavailable outside secure contexts; the text stays selectable. */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all"
      aria-label="Copy citation"
    >
      {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function CitationBlock({ label, value }: { label: string; value: string }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-primary font-mono text-[11px] font-semibold tracking-widest uppercase">
          {label}
        </h3>
        <CopyButton value={value} />
      </div>
      <pre className="border-border bg-secondary/50 text-foreground overflow-x-auto rounded-xl border p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
        {value}
      </pre>
    </section>
  );
}

export function CiteDialog({
  publication,
  onClose,
}: {
  publication: Publication | null;
  onClose: () => void;
}) {
  if (!publication) return null;

  const doi = citationDoi(publication);
  const sourceUrl = citationSourceUrl(publication);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center gap-2 font-mono text-xs font-semibold tracking-widest uppercase">
            <Quote size={13} aria-hidden />
            Cite this article
          </DialogTitle>
          <DialogDescription className="text-foreground pr-6 text-sm leading-snug font-medium">
            {publication.title}
          </DialogDescription>
        </DialogHeader>

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span>{citationVenue(publication)}</span>
          {publication.year && <span aria-hidden>·</span>}
          {publication.year && <span>{publication.year}</span>}
          {publication.citation?.volume && (
            <>
              <span aria-hidden>·</span>
              <span>
                Vol. {publication.citation.volume}
                {publication.citation.issue ? ` (${publication.citation.issue})` : ''}
              </span>
            </>
          )}
          {publication.citation?.pages && (
            <>
              <span aria-hidden>·</span>
              <span>pp. {publication.citation.pages}</span>
            </>
          )}
        </div>

        <CitationBlock label="BibTeX" value={toBibtex(publication)} />
        <CitationBlock label="Vancouver" value={toVancouver(publication)} />

        {(doi || sourceUrl) && (
          <div className="border-border flex flex-wrap items-center gap-3 border-t pt-3 text-xs">
            {doi && (
              <a
                href={`https://doi.org/${doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 inline-flex items-center gap-1 font-mono"
              >
                doi:{doi}
                <ExternalLink size={11} aria-hidden />
              </a>
            )}
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                Open at the publisher
                <ExternalLink size={11} aria-hidden />
              </a>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
