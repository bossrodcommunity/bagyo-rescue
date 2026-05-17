import { supabase } from '@/lib/supabase';
import { BadRequestError } from '@/utils/errors';

export type DeleteEvacuationCenterDataArgs = {
  id: string;
};

export async function deleteEvacuationCenterData({ id }: DeleteEvacuationCenterDataArgs) {
  const { data, error } = await supabase
    .from('evacuation_centers')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw new BadRequestError(`Failed to delete evacuation center: ${error.message}`);
  }

  return data;
}

export type DeleteEvacuationCenterDataResponse = Awaited<
  ReturnType<typeof deleteEvacuationCenterData>
>;
