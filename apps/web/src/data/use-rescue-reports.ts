import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addReport, listReports, updateReportStatus, type RescueReport } from '@/lib/dexie';

export const reportsQueryKey = ['rescue-reports'];

export function useRescueReports() {
  return useQuery({
    queryKey: reportsQueryKey,
    queryFn: listReports,
  });
}

export function useAddRescueReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportsQueryKey }),
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: Pick<RescueReport, 'id' | 'status'>) =>
      updateReportStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportsQueryKey }),
  });
}
