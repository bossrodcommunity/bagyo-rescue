import { useQuery } from '@tanstack/react-query';
import { listRescuePings } from '@/lib/dexie';

export const rescuePingsQueryKey = ['/rescue-pings'];

export function useRescuePingsQuery() {
  return useQuery({
    queryKey: rescuePingsQueryKey,
    queryFn: listRescuePings,
  });
}
