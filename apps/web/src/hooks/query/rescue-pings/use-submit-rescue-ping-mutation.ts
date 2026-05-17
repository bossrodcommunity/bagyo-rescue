import { type MutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitRescuePingService,
  type SubmitRescuePingServiceArgs,
  type SubmitRescuePingServiceResponse,
} from '@/services/rescue-pings';
import { rescuePingsQueryKey } from './use-rescue-pings-query';

export type UseSubmitRescuePingMutationArgs = MutationOptions<
  SubmitRescuePingServiceResponse,
  Error,
  SubmitRescuePingServiceArgs
>;

export function useSubmitRescuePingMutation(args: UseSubmitRescuePingMutationArgs = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    ...args,
    mutationFn: submitRescuePingService,
    onSuccess: async (...successArgs) => {
      await queryClient.invalidateQueries({ queryKey: rescuePingsQueryKey });
      args.onSuccess?.(...successArgs);
    },
  });
}
