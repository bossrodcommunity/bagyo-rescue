import { supabase } from '@/lib/supabase';
import { BadRequestError } from '@/utils/errors';

export type DeleteBarangayDataArgs = {
  id: string;
};

export async function deleteBarangayData({ id }: DeleteBarangayDataArgs) {
  const { data, error } = await supabase.from('barangays').delete().eq('id', id).select().single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw new BadRequestError(`Failed to delete barangay: ${error.message}`);
  }

  return data;
}

export type DeleteBarangayDataResponse = Awaited<ReturnType<typeof deleteBarangayData>>;
