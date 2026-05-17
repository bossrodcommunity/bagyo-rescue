import { supabase } from '@/lib/supabase';
import { type PublicTableInsert } from '@/data/types';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type CreateBarangayDataArgs = {
  payload: PublicTableInsert<'barangays'>;
};

export async function createBarangayData(args: CreateBarangayDataArgs) {
  const { data, error } = await supabase.from('barangays').insert(args.payload).select().single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Barangay not found');
    }

    throw new BadRequestError(`Failed to create barangay: ${error.message}`);
  }

  return data;
}

export type CreateBarangayDataResponse = Awaited<ReturnType<typeof createBarangayData>>;
