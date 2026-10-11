'use client';
import { SYSTEMS } from '@/data/systems';
import { useLocale, t } from '@/lib/i18n';
import { Palette } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ColorLegend() {
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground"
        aria-label={t('legend.title', locale)}
        title={t('legend.title', locale)}
      >
        <Palette size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full right-0 mt-1 glass-panel rounded-lg p-3 z-50 min-w-[180px]"
          >
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {t('legend.title', locale)}
            </h4>
            <div className="space-y-1">
              {(SYSTEMS ?? []).map((sys: any) => (
                <div key={sys?.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: sys?.color }}
                  />
                  <span className="text-xs">
                    {locale === 'es' ? sys?.nombre_es : sys?.nombre_en}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
