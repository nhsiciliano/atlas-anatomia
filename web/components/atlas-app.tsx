'use client';
import { LocaleContext } from '@/lib/i18n';
import AppHeader from '@/components/layout/app-header';
import SidebarDrawer from '@/components/layout/sidebar-drawer';
import AtlasStage from '@/components/atlas/atlas-stage';
import RightPanel from '@/components/layout/right-panel';
import MobileDetailSheet from '@/components/layout/mobile-detail-sheet';
import { useSyncExternalStore } from 'react';

export default function AtlasApp() {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

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
