'use client';
import { useAtlasStore } from '@/lib/store';
import { useT, type Locale } from '@/lib/i18n';

const OPTIONS: { value: Locale; label: string }[] = [
  { value: 'es', label: 'ES' },
  { value: 'en', label: 'EN' },
];

export default function LanguageToggle() {
  const locale = useAtlasStore(s => s.locale);
  const setLocale = useAtlasStore(s => s.setLocale);
  const tr = useT();

  return (
    <div className="inline-flex rounded-full bg-foreground/[0.05] p-0.5" role="group" aria-label={tr('settings.language')}>
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setLocale(value)}
          aria-pressed={locale === value}
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
            locale === value ? 'bg-foreground/90 text-background' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
