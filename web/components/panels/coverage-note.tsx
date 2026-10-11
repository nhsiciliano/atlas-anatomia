'use client';
import { useT } from '@/lib/i18n';
import { STRUCTURES } from '@/data/anatomy-data';
import { SYSTEMS } from '@/data/systems';
import { Info } from 'lucide-react';

export default function CoverageNote() {
  const tr = useT();
  const count = STRUCTURES.length;

  return (
    <div
      className="flex items-start gap-2 rounded-xl bg-foreground/[0.03] p-3"
      title={tr('coverage.note', { count, systems: SYSTEMS.length })}
    >
      <Info size={13} className="text-primary/80 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-medium text-muted-foreground">{tr('coverage.title')}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
          {tr('coverage.short', { count })}{' '}
          <a href="/atribuciones" className="text-primary hover:underline">{tr('nav.atribuciones')}</a>
        </p>
      </div>
    </div>
  );
}
