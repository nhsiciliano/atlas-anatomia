'use client';
import { LocaleContext } from '@/lib/i18n';
import AppHeader from '@/components/layout/app-header';
import SidebarDrawer from '@/components/layout/sidebar-drawer';
import AtlasStage from '@/components/atlas/atlas-stage';
import RightPanel from '@/components/layout/right-panel';
import MobileDetailSheet from '@/components/layout/mobile-detail-sheet';
import { useEffect, useSyncExternalStore } from 'react';
import { useAtlasStore } from '@/lib/store';

// Missing when localStorage is unavailable: zustand then skips persistence entirely.
const progressStore = useAtlasStore.persist as typeof useAtlasStore.persist | undefined;

export default function AtlasApp() {
  // Saved progress is loaded after mount (the store uses skipHydration), so the server render
  // and the first client render match. Children wait for it: an update before hydration would
  // overwrite the saved progress with the empty defaults.
  const mounted = useSyncExternalStore(
    (onChange) => progressStore?.onFinishHydration(onChange) ?? (() => {}),
    () => progressStore?.hasHydrated() ?? true,
    () => false,
  );

  useEffect(() => {
    if (progressStore && !progressStore.hasHydrated()) progressStore.rehydrate();
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Cargando atlas…</p>
        </div>
      </div>
    );
  }

  return (
    <LocaleContext.Provider value="es">
      <div className="museum-stage flex flex-col h-dvh overflow-hidden">
        <AppHeader />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <SidebarDrawer />
          <main className="flex-1 relative min-w-0 overflow-hidden">
            <AtlasStage />
          </main>
          {/* Right panel - desktop only, floating glass card */}
          <div className="hidden md:flex w-[330px] lg:w-[376px] flex-shrink-0 overflow-hidden pb-5 pr-5 pt-1">
            <RightPanel />
          </div>
        </div>
        {/* Mobile detail sheet */}
        <MobileDetailSheet />
      </div>
    </LocaleContext.Provider>
  );
}
