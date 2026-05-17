import {
  linkPendingReportHistoriesToAccess,
  type LinkPendingReportHistoriesToAccessInput,
} from '@/lib/dexie';

export type LinkPendingReportHistoriesToAccessServiceArgs = {
  payload: LinkPendingReportHistoriesToAccessInput;
};

export async function linkPendingReportHistoriesToAccessService({
  payload,
}: LinkPendingReportHistoriesToAccessServiceArgs) {
  return linkPendingReportHistoriesToAccess(payload);
}

export type LinkPendingReportHistoriesToAccessServiceResponse = Awaited<
  ReturnType<typeof linkPendingReportHistoriesToAccessService>
>;
