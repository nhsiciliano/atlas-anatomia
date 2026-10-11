'use client';
import { REFERENCES } from '@/data/references';
import { STRUCTURES } from '@/data/anatomy-data';
import { SYSTEMS } from '@/data/systems';
import { ArrowLeft, BookOpen, Box, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useDocumentLang, useLocale, useT } from '@/lib/i18n';
import { pick } from '@/lib/l10n';
import { useProgressHydrated } from '@/lib/store';

export default function AtribucionesContent() {
  // Nothing here writes to the store, so the page renders right away (in Spanish on the server)
  // and switches to the saved language once the progress is loaded.
  useProgressHydrated();
  useDocumentLang();
  const locale = useLocale();
  const tr = useT();
  return (
    <div className="min-h-dvh bg-background">
      <div className="max-w-[800px] mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          {tr('attrib.back')}
        </Link>

        <h1 className="font-display text-3xl font-light tracking-tight mb-2">{tr('attrib.title')}</h1>
        <p className="text-sm text-muted-foreground mb-8">{tr('attrib.intro')}</p>

        <h2 className="font-display text-lg font-light mb-3">{tr('attrib.model_title')}</h2>
        <div className="bg-card rounded-lg border border-border p-4 mb-8 space-y-2">
          <div className="flex items-start gap-2">
            <Box size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">BodyParts3D</h3>
              <p className="text-xs text-muted-foreground">
                {tr('attrib.license_lead')}{' '}
                <a href={`https://creativecommons.org/licenses/by-sa/2.1/jp/deed.${locale}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {tr('attrib.license_name')}
                </a>.
              </p>
              <p className="text-xs text-muted-foreground">{tr('attrib.modifications')}</p>
              <p className="text-xs text-muted-foreground">{tr('attrib.male_model')}</p>
              <a
                href="https://lifesciencedb.jp/bp3d/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink size={10} />
                https://lifesciencedb.jp/bp3d/
              </a>
            </div>
          </div>
        </div>

        <h2 className="font-display text-lg font-light mb-3">{tr('attrib.sources_title')}</h2>
        <div className="space-y-4">
          {(REFERENCES ?? []).map((ref: any) => (
            <div key={ref?.id} className="bg-card rounded-lg border border-border p-4 space-y-1">
              <div className="flex items-start gap-2">
                <BookOpen size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold">{ref?.nombre}</h2>
                  <p className="text-xs text-muted-foreground font-mono">{ref?.shortName}</p>
                  {ref?.isbn && (
                    <p className="text-xs text-muted-foreground font-mono">ISBN {ref.isbn}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{pick(ref, 'descripcion', locale)}</p>
                  {ref?.url && !/^https?:\/\//.test(ref.url) && (
                    <p className="text-xs text-muted-foreground font-mono mt-1">{ref.url}</p>
                  )}
                  {ref?.url && /^https?:\/\//.test(ref.url) && (
                    <a
                      href={ref?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                    >
                      <ExternalLink size={10} />
                      {ref?.url}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-accent/30 rounded-lg border border-border/30">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>{tr('attrib.note_label')}</strong> {tr('attrib.note', { count: STRUCTURES.length, systems: SYSTEMS.length })}
          </p>
        </div>
      </div>
    </div>
  );
}
