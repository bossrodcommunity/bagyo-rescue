import { addRescuePing, getRescuePing, type AddRescuePingInput } from '@/lib/dexie';
import { syncRescuePingsService } from './sync-rescue-pings';

export type SubmitRescuePingServiceArgs = {
  payload: AddRescuePingInput;
};

export async function submitRescuePingService({ payload }: SubmitRescuePingServiceArgs) {
  const rescuePing = await addRescuePing(payload);

  if (typeof navigator === 'undefined' || navigator.onLine) {
    await syncRescuePingsService();
  }

  return (await getRescuePing(rescuePing.id)) ?? rescuePing;
}

export type SubmitRescuePingServiceResponse = Awaited<ReturnType<typeof submitRescuePingService>>;
