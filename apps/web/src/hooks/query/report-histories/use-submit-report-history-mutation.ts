import { type MutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitReportHistoryService,
  type SubmitReportHistoryServiceArgs,
  type SubmitReportHistoryServiceResponse,
} from '@/services/report-histories';

export type UseSubmitReportHistoryMutationArgs = MutationOptions<
  SubmitReportHistoryServiceResponse,
  Error,
  SubmitReportHistoryServiceArgs
>;

export function useSubmitReportHistoryMutation(args: UseSubmitReportHistoryMutationArgs = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...args,
    mutationFn: submitReportHistoryService,
    onSuccess: (...successArgs) => {
      void queryClient.invalidateQueries({ queryKey: ['/report-histories'] });
      args.onSuccess?.(...successArgs);
    },
  });
}
