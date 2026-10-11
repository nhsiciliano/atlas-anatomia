'use client';
import { useAtlasStore, type ReproSex } from '@/lib/store';
import { useLocale, t } from '@/lib/i18n';
import { SYSTEM_MAP } from '@/data/systems';

export default function ReproToggle() {
  const locale = useLocale();
  const reproSex = useAtlasStore(s => s.reproSex);
  const setReproSex = useAtlasStore(s => s.setReproSex);
  const visible = useAtlasStore(s => s.visibleSystems?.reproductor);

  if (!visible) return null;

  return (
    <div className="flex items-center gap-2 px-2">
      <span className="text-[10px] text-muted-foreground">{t('sexo.toggle', locale)}:</span>
      {(['femenino', 'masculino'] as ReproSex[]).map((s) => (
        <button
          key={s}
          onClick={() => setReproSex(s)}
          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
            reproSex === s
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          {t(`sexo.${s}`, locale)}
        </button>
      ))}
    </div>
  );
}
