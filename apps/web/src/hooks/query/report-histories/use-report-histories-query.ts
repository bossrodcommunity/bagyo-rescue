import { useQuery } from '@tanstack/react-query';
import {
  listReportHistoriesWithOutboxState,
  type ListReportHistoriesWithOutboxStateInput,
} from '@/lib/dexie';

export type UseReportHistoriesQueryArgs = ListReportHistoriesWithOutboxStateInput;

export function useReportHistoriesQuery(args: UseReportHistoriesQueryArgs = {}) {
  return useQuery({
    queryKey: ['/report-histories', args],
    queryFn: () => listReportHistoriesWithOutboxState(args),
  });
}
