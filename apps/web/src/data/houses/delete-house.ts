import { supabase } from '@/lib/supabase';
import { BadRequestError } from '@/utils/errors';

export type DeleteHouseDataArgs = {
  id: string;
};

export async function deleteHouseData({ id }: DeleteHouseDataArgs) {
  const { data, error } = await supabase.from('houses').delete().eq('id', id).select().single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw new BadRequestError(`Failed to delete house: ${error.message}`);
  }

  return data;
}

export type DeleteHouseDataResponse = Awaited<ReturnType<typeof deleteHouseData>>;
