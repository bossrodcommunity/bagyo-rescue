import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type GetHouseDataArgs = {
  id: string;
};

export async function getHouseData({ id }: GetHouseDataArgs) {
  const { data, error } = await supabase.from('houses').select().eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('House not found');
    }

    throw new BadRequestError(`Failed to get house: ${error.message}`);
  }

  return data;
}

export type GetHouseDataResponse = Awaited<ReturnType<typeof getHouseData>>;
