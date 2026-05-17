import { type PublicTableInsert } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError } from '@/utils/errors';

export type CreateRescuePingDataArgs = {
  payload: PublicTableInsert<'rescue_pings'>;
};

export async function createRescuePingData(args: CreateRescuePingDataArgs) {
  const { error } = await supabase.from('rescue_pings').insert(args.payload);

  if (error) {
    if (error.code === '23505') {
      return args.payload;
    }

    throw new BadRequestError(`Failed to send rescue ping: ${error.message}`);
  }

  return args.payload;
}

export type CreateRescuePingDataResponse = Awaited<ReturnType<typeof createRescuePingData>>;
