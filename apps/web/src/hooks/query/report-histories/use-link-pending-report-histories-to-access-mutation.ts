import { type MutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  linkPendingReportHistoriesToAccessService,
  type LinkPendingReportHistoriesToAccessServiceArgs,
  type LinkPendingReportHistoriesToAccessServiceResponse,
} from '@/services/report-histories';

export type UseLinkPendingReportHistoriesToAccessMutationArgs = MutationOptions<
  LinkPendingReportHistoriesToAccessServiceResponse,
  Error,
  LinkPendingReportHistoriesToAccessServiceArgs
>;

export function useLinkPendingReportHistoriesToAccessMutation(
  args: UseLinkPendingReportHistoriesToAccessMutationArgs = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...args,
    mutationFn: linkPendingReportHistoriesToAccessService,
    onSuccess: async (...successArgs) => {
      await queryClient.invalidateQueries({ queryKey: ['/report-histories'] });
      args.onSuccess?.(...successArgs);
    },
  });
}
