'use client';
import { useDocumentLang, useT } from '@/lib/i18n';
import AppHeader from '@/components/layout/app-header';
import SidebarDrawer from '@/components/layout/sidebar-drawer';
import AtlasStage from '@/components/atlas/atlas-stage';
import RightPanel from '@/components/layout/right-panel';
import MobileDetailSheet from '@/components/layout/mobile-detail-sheet';
import { useProgressHydrated } from '@/lib/store';

export default function AtlasApp() {
  const tr = useT();
  // Children update the store, so they wait for the saved progress (see useProgressHydrated).
  const mounted = useProgressHydrated();
  useDocumentLang();

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-background">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">{tr('app.loading')}</p>
        </div>
      </div>
    );
  }

  return (
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
  );
}
