import { type PublicTableInsert } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type CreateHouseDataArgs = {
  payload: PublicTableInsert<'houses'>;
};

export async function createHouseData(args: CreateHouseDataArgs) {
  const { data, error } = await supabase.from('houses').insert(args.payload).select().single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('House not found');
    }

    throw new BadRequestError(`Failed to create house: ${error.message}`);
  }

  return data;
}

export type CreateHouseDataResponse = Awaited<ReturnType<typeof createHouseData>>;
