import { type PublicTableInsert } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type CreateEvacuationCenterDataArgs = {
  payload: PublicTableInsert<'evacuation_centers'>;
};

export async function createEvacuationCenterData(args: CreateEvacuationCenterDataArgs) {
  const { data, error } = await supabase
    .from('evacuation_centers')
    .insert(args.payload)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Evacuation center not found');
    }

    throw new BadRequestError(`Failed to create evacuation center: ${error.message}`);
  }

  return data;
}

export type CreateEvacuationCenterDataResponse = Awaited<
  ReturnType<typeof createEvacuationCenterData>
>;
