import { type MutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  syncReportHistoriesService,
  type SyncReportHistoriesServiceArgs,
  type SyncReportHistoriesServiceResult,
} from '@/services/report-histories';

export type UseSyncReportHistoriesMutationArgs = MutationOptions<
  SyncReportHistoriesServiceResult,
  Error,
  SyncReportHistoriesServiceArgs | void
>;

export function useSyncReportHistoriesMutation(args: UseSyncReportHistoriesMutationArgs = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...args,
    mutationFn: payload => syncReportHistoriesService(payload ?? {}),
    onSettled: async (...settledArgs) => {
      await queryClient.invalidateQueries({ queryKey: ['/report-histories'] });
      args.onSettled?.(...settledArgs);
    },
  });
}
