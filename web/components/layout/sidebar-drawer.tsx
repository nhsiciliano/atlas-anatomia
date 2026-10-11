'use client';
import { useAtlasStore } from '@/lib/store';
import { useLocale, t } from '@/lib/i18n';
import SystemSidebar from '@/components/atlas/system-sidebar';
import CoverageNote from '@/components/panels/coverage-note';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SidebarDrawer() {
  const locale = useLocale();
  const sidebarOpen = useAtlasStore(s => s.sidebarOpen);
  const setSidebarOpen = useAtlasStore(s => s.setSidebarOpen);

  return (
    <>
      {/* Desktop sidebar - always visible */}
      <aside className="hidden md:flex flex-col w-[236px] overflow-y-auto flex-shrink-0 scrollbar-none">
        <SystemSidebar />
        <div className="mt-auto p-2">
          <CoverageNote />
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[300px] max-w-[85vw] overflow-y-auto rounded-r-[24px] bg-card pb-[env(safe-area-inset-bottom)] shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="font-display text-lg font-light">{t('sidebar.title', locale)}</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="-mr-2 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                  aria-label="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>
              <SystemSidebar />
              <div className="p-2">
                <CoverageNote />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
