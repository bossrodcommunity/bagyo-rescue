import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type GetEvacuationCenterDataArgs = {
  id: string;
};

export async function getEvacuationCenterData({ id }: GetEvacuationCenterDataArgs) {
  const { data, error } = await supabase.from('evacuation_centers').select().eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Evacuation center not found');
    }

    throw new BadRequestError(`Failed to get evacuation center: ${error.message}`);
  }

  return data;
}

export type GetEvacuationCenterDataResponse = Awaited<ReturnType<typeof getEvacuationCenterData>>;
