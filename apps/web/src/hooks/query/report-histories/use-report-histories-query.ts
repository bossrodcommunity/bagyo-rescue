import { useQuery } from '@tanstack/react-query';
import { listReportHistories, type ReportHistoryType } from '@/lib/dexie';

export function useReportHistoriesQuery(type?: ReportHistoryType) {
  return useQuery({
    queryKey: ['/report-histories', type],
    queryFn: () => listReportHistories(type),
  });
}
