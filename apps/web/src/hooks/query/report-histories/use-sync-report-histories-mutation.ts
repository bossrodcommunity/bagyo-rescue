import { type MutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  syncReportHistoriesService,
  type SyncReportHistoriesServiceResult,
} from '@/services/report-histories';

export type UseSyncReportHistoriesMutationArgs = MutationOptions<
  SyncReportHistoriesServiceResult,
  Error,
  void
>;

export function useSyncReportHistoriesMutation(args: UseSyncReportHistoriesMutationArgs = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...args,
    mutationFn: () => syncReportHistoriesService(),
    onSettled: async (...settledArgs) => {
      await queryClient.invalidateQueries({ queryKey: ['/report-histories'] });
      args.onSettled?.(...settledArgs);
    },
  });
}
