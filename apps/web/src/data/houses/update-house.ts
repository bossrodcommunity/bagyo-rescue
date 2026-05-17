import { type PublicTableUpdate } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type UpdateHouseDataArgs = {
  id: string;
  payload: PublicTableUpdate<'houses'>;
};

export async function updateHouseData(args: UpdateHouseDataArgs) {
  const { data, error } = await supabase
    .from('houses')
    .update({
      ...args.payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', args.id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('House not found');
    }

    throw new BadRequestError(`Failed to update house: ${error.message}`);
  }

  return data;
}

export type UpdateHouseDataResponse = Awaited<ReturnType<typeof updateHouseData>>;
