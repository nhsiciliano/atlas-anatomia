'use client';
import { useLocale, t } from '@/lib/i18n';
import { STRUCTURES } from '@/data/anatomy-data';
import { Info } from 'lucide-react';

export default function CoverageNote() {
  const locale = useLocale();
  const count = STRUCTURES?.length ?? 0;

  return (
    <div className="flex items-start gap-2 rounded-xl bg-foreground/[0.03] p-3">
      <Info size={13} className="text-primary/80 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-medium text-muted-foreground">{t('coverage.title', locale)}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
          {count} estructuras · modelo 3D basado en BodyParts3D (CC BY-SA).{' '}
          <a href="/atribuciones" className="text-primary hover:underline">Atribuciones</a>
        </p>
      </div>
    </div>
  );
}
