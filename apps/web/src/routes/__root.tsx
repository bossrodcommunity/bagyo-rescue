import { Link, Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import {
  IconAlertTriangle,
  IconLifebuoy,
  IconLock,
  IconLogout,
  IconMenu2,
  IconPhoneCall,
  IconShieldCheck,
  IconTableOptions,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { Wordmark } from '@/components/brand/wordmark';
import { OfflineBadge, useOnlineStatus } from '@/components/ui/offline-badge';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/ui/page';
import { AuthPanel } from '@/components/auth/auth-panel';
import { ResidentAccessPanel } from '@/features/resident/resident-access-gate';
import { useResidentAccessSession } from '@/features/resident/resident-access-session';
import {
  useLinkPendingReportHistoriesToAccessMutation,
  useSyncReportHistoriesMutation,
} from '@/hooks/query/report-histories';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => (
    <Page width="narrow" className="flex flex-col gap-5">
      <h1 className="text-display-lg text-foreground">Hindi mahanap ang pahina</h1>
      <p className="text-body-md text-muted-foreground">We couldn&rsquo;t find that page.</p>
      <Button asChild size="md" className="self-start">
        <Link to="/">Bumalik sa dashboard</Link>
      </Button>
    </Page>
  ),
});

function RootLayout() {
  return (
    <div className="min-h-dvh bg-bg pb-24 text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-5 py-3 sm:px-6">
          <Link to="/" aria-label="Bagyo Rescue" className="flex items-center">
            <Wordmark />
          </Link>
          <OfflineBadge />
        </div>
      </header>
      <Outlet />
      <FloatingTabBar />
    </div>
  );
}

function FloatingTabBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 shadow-lg backdrop-blur"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 rounded-lg border border-border bg-surface p-1 shadow-raised">
          <TabBarLink to="/report-flood" label="Flood" icon={IconAlertTriangle} />
          <TabBarLink to="/request-rescue" label="Rescue" icon={IconLifebuoy} />
          <TabBarLink to="/hotlines" label="Emergency" icon={IconPhoneCall} />
          <button
            type="button"
            className={cn(
              'flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-caption font-semibold transition-colors',
              isMenuOpen
                ? 'bg-primary text-text-on-primary shadow-sm hover:bg-primary hover:text-text-on-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <IconMenu2 aria-hidden="true" className="size-5" />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {isMenuOpen ? <MenuSheet onClose={() => setIsMenuOpen(false)} /> : null}
    </>
  );
}

function TabBarLink({
  to,
  label,
  icon: Icon,
}: {
  to: '/report-flood' | '/request-rescue' | '/hotlines';
  label: string;
  icon: typeof IconAlertTriangle;
}) {
  const baseClasses =
    'flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-caption font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';
  const activeClasses = `${baseClasses} bg-primary text-text-on-primary shadow-sm hover:bg-primary hover:text-text-on-primary`;

  return (
    <Link
      to={to}
      className={baseClasses}
      activeProps={{ className: activeClasses, 'aria-current': 'page' }}
    >
      <Icon aria-hidden="true" className="size-5" />
      <span>{label}</span>
    </Link>
  );
}

function MenuSheet({ onClose }: { onClose: () => void }) {
  const { access, setAccess, endSession } = useResidentAccessSession();
  const { user, isAuthenticated, logout } = useAuth();
  const linkPendingReportHistories = useLinkPendingReportHistoriesToAccessMutation();
  const syncReportHistories = useSyncReportHistoriesMutation();
  const [isFamilyAccessOpen, setIsFamilyAccessOpen] = useState(false);
  const syncedAccessFamilyCodeRef = useRef<string | null>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!access) {
      syncedAccessFamilyCodeRef.current = null;
      return;
    }

    if (!isOnline) {
      syncedAccessFamilyCodeRef.current = null;
      return;
    }

    if (
      syncedAccessFamilyCodeRef.current === access.session.family.family_code ||
      linkPendingReportHistories.isPending ||
      syncReportHistories.isPending
    ) {
      return;
    }

    syncedAccessFamilyCodeRef.current = access.session.family.family_code;
    linkPendingReportHistories.mutate(
      {
        payload: {
          family_id: access.session.family.id,
          house_id: access.session.house.id,
          family_code: access.session.family.family_code,
          access_method: access.accessMethod,
          phone_number: access.session.family.head_of_family_phone_number,
          people_count: access.session.family.total_members,
        },
      },
      {
        onSuccess: () => {
          syncReportHistories.mutate({ family_code: access.session.family.family_code });
        },
      }
    );
  }, [access, isOnline, linkPendingReportHistories, syncReportHistories]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const isSyncing = linkPendingReportHistories.isPending || syncReportHistories.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-slate-900/35"
        onClick={onClose}
      />
      <section className="relative flex h-[min(88dvh,44rem)] w-full flex-col overflow-hidden rounded-t-lg border border-border bg-surface shadow-lg sm:max-w-lg sm:rounded-lg">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-heading-md text-foreground">Menu</h2>
              <p className="text-label-md text-muted-foreground">
                Manage family access and coordinator tools.
              </p>
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
              <IconX aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-4 sm:px-5">
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-body-md font-semibold text-foreground">Family code</h3>
                <p className="text-label-md text-muted-foreground">
                  Link a family code and PIN to sync pending local reports.
                </p>
              </div>
              {access && !isFamilyAccessOpen ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsFamilyAccessOpen(true)}
                >
                  Change
                </Button>
              ) : null}
            </div>

            {access && !isFamilyAccessOpen ? (
              <div className="flex flex-col gap-4 rounded-md border border-border bg-safe-soft p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-safe text-text-on-safe">
                    <IconShieldCheck aria-hidden="true" className="size-5" />
                  </span>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-body-md font-semibold text-foreground">
                      {access.session.family.family_code}
                    </span>
                    <span className="truncate text-label-md text-muted-foreground">
                      {access.session.family.family_name}
                    </span>
                    <span className="text-caption text-muted-foreground">
                      {isSyncing ? 'Syncing pending reports...' : 'Linked on this device.'}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  className="self-start"
                  onClick={() => {
                    endSession();
                    setIsFamilyAccessOpen(false);
                  }}
                >
                  Unlink family
                </Button>
              </div>
            ) : isFamilyAccessOpen || !access ? (
              <ResidentAccessPanel
                title="Link family"
                description="Scan QR, upload QR, or enter family code and PIN."
                onAuthenticated={nextAccess => {
                  setAccess(nextAccess);
                  setIsFamilyAccessOpen(false);
                }}
              />
            ) : null}
          </section>

          <section className="flex flex-col gap-3 border-t border-border pt-5">
            <div className="flex flex-col gap-1">
              <h3 className="text-body-md font-semibold text-foreground">CRM admin</h3>
              <p className="text-label-md text-muted-foreground">
                Sign in or register for coordinator records and CRM tools.
              </p>
            </div>

            {isAuthenticated ? (
              <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-sunken p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                    <IconTableOptions aria-hidden="true" className="size-5" />
                  </span>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-body-md font-semibold text-foreground">
                      {user?.username ?? 'Coordinator'}
                    </span>
                    <span className="text-label-md text-muted-foreground">Signed in for CRM.</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild size="md">
                    <Link to="/admin" onClick={onClose}>
                      <IconTableOptions aria-hidden="true" />
                      Admin
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      void logout();
                      onClose();
                    }}
                  >
                    <IconLogout aria-hidden="true" />
                    Sign out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-border bg-surface-sunken p-3">
                <div className="mb-3 flex items-center gap-2 text-label-md font-semibold text-foreground">
                  <IconLock aria-hidden="true" className="size-4" />
                  Login/register for CRM
                </div>
                <AuthPanel onAuthenticated={onClose} />
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
