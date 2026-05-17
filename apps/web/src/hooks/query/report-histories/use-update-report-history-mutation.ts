import { type MutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateReportHistoryService,
  type UpdateReportHistoryServiceArgs,
  type UpdateReportHistoryServiceResponse,
} from '@/services/report-histories';

export type UseUpdateReportHistoryMutationArgs = MutationOptions<
  UpdateReportHistoryServiceResponse,
  Error,
  UpdateReportHistoryServiceArgs
>;

export function useUpdateReportHistoryMutation(args: UseUpdateReportHistoryMutationArgs = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...args,
    mutationFn: updateReportHistoryService,
    onSuccess: async (...successArgs) => {
      await queryClient.invalidateQueries({ queryKey: ['/report-histories'] });
      args.onSuccess?.(...successArgs);
    },
  });
}
