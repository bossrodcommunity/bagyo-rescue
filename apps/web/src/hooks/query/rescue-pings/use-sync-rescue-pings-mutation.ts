import { type MutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { syncRescuePingsService, type SyncRescuePingsServiceResult } from '@/services/rescue-pings';
import { rescuePingsQueryKey } from './use-rescue-pings-query';

export type UseSyncRescuePingsMutationArgs = MutationOptions<
  SyncRescuePingsServiceResult,
  Error,
  void
>;

export function useSyncRescuePingsMutation(args: UseSyncRescuePingsMutationArgs = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...args,
    mutationFn: () => syncRescuePingsService(),
    onSettled: async (...settledArgs) => {
      await queryClient.invalidateQueries({ queryKey: rescuePingsQueryKey });
      args.onSettled?.(...settledArgs);
    },
  });
}
