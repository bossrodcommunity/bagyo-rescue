import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type GetBarangayDataArgs = {
  id: string;
};

export async function getBarangayData({ id }: GetBarangayDataArgs) {
  const { data, error } = await supabase.from('barangays').select().eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Barangay not found');
    }

    throw new BadRequestError(`Failed to get barangay: ${error.message}`);
  }

  return data;
}

export type GetBarangayDataResponse = Awaited<ReturnType<typeof getBarangayData>>;
