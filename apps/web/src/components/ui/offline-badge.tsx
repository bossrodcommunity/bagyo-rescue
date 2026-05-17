import { useEffect, useState } from 'react';
import { IconCloudCheck, IconCloudOff } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

type OfflineBadgeProps = {
  className?: string;
  /** When true, render even while online. Default false: only show when offline. */
  showOnline?: boolean;
};

function OfflineBadge({ className, showOnline = false }: OfflineBadgeProps) {
  const isOnline = useOnlineStatus();

  if (isOnline && !showOnline) return null;

  return (
    <span
      role="status"
      aria-live="polite"
      data-online={isOnline}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-label-md',
        isOnline ? 'border-border text-muted-foreground' : 'border-signal/40 text-foreground',
        className
      )}
    >
      {isOnline ? (
        <IconCloudCheck className="size-3.5 text-safe" aria-hidden="true" />
      ) : (
        <IconCloudOff className="size-3.5 text-signal" aria-hidden="true" />
      )}
      <span>{isOnline ? 'Online' : 'Naka-offline'}</span>
    </span>
  );
}

export { OfflineBadge, useOnlineStatus };
