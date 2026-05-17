import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addFloodReport, listFloodReports } from '../db/flood-reports';

export const floodReportsQueryKey = ['flood-reports'];

export function useFloodReports() {
  return useQuery({
    queryKey: floodReportsQueryKey,
    queryFn: listFloodReports,
  });
}

export function useAddFloodReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFloodReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: floodReportsQueryKey }),
  });
}
