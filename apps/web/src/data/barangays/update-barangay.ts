import { supabase } from '@/lib/supabase';
import { type PublicTableUpdate } from '@/data/types';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type UpdateBarangayDataArgs = {
  id: string;
  payload: PublicTableUpdate<'barangays'>;
};

export async function updateBarangayData(args: UpdateBarangayDataArgs) {
  const { data, error } = await supabase
    .from('barangays')
    .update({
      ...args.payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', args.id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Barangay not found');
    }

    throw new BadRequestError(`Failed to update barangay: ${error.message}`);
  }

  return data;
}

export type UpdateBarangayDataResponse = Awaited<ReturnType<typeof updateBarangayData>>;
