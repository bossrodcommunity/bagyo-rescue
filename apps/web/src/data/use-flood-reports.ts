import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { addFloodReport, getFloodOutboxSummary, listFloodReports } from '../db/flood-reports';
import { syncOutbox } from '../services/outbox/sync-outbox';

export const floodReportsQueryKey = ['flood-reports'];
export const floodOutboxSummaryQueryKey = ['flood-outbox-summary'];

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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: floodReportsQueryKey }),
        queryClient.invalidateQueries({ queryKey: floodOutboxSummaryQueryKey }),
      ]);
    },
  });
}

export function useFloodOutboxSummary() {
  return useQuery({
    queryKey: floodOutboxSummaryQueryKey,
    queryFn: getFloodOutboxSummary,
  });
}

export function useSyncFloodOutbox() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncOutbox,
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: floodReportsQueryKey }),
        queryClient.invalidateQueries({ queryKey: floodOutboxSummaryQueryKey }),
      ]);
    },
  });
}

export function useFloodOutboxSyncProcessor() {
  const syncFloodOutbox = useSyncFloodOutbox();

  useEffect(() => {
    syncFloodOutbox.mutate();

    const syncOnOnline = () => syncFloodOutbox.mutate();
    const intervalId = window.setInterval(() => syncFloodOutbox.mutate(), 45_000);

    window.addEventListener('online', syncOnOnline);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('online', syncOnOnline);
    };
  }, []);

  return syncFloodOutbox;
}
