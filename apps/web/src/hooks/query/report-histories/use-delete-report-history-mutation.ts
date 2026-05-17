import { type MutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deleteReportHistoryService,
  type DeleteReportHistoryServiceArgs,
  type DeleteReportHistoryServiceResponse,
} from '@/services/report-histories';

export type UseDeleteReportHistoryMutationArgs = MutationOptions<
  DeleteReportHistoryServiceResponse,
  Error,
  DeleteReportHistoryServiceArgs
>;

export function useDeleteReportHistoryMutation(args: UseDeleteReportHistoryMutationArgs = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...args,
    mutationFn: deleteReportHistoryService,
    onSuccess: async (...successArgs) => {
      await queryClient.invalidateQueries({ queryKey: ['/report-histories'] });
      args.onSuccess?.(...successArgs);
    },
  });
}
