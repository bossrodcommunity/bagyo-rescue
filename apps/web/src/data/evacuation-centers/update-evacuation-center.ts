import { type PublicTableUpdate } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type UpdateEvacuationCenterDataArgs = {
  id: string;
  payload: PublicTableUpdate<'evacuation_centers'>;
};

export async function updateEvacuationCenterData(args: UpdateEvacuationCenterDataArgs) {
  const { data, error } = await supabase
    .from('evacuation_centers')
    .update({
      ...args.payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', args.id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Evacuation center not found');
    }

    throw new BadRequestError(`Failed to update evacuation center: ${error.message}`);
  }

  return data;
}

export type UpdateEvacuationCenterDataResponse = Awaited<
  ReturnType<typeof updateEvacuationCenterData>
>;
