import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type GetEvacuationCenterAssignmentDataArgs = {
  id: string;
};

export async function getEvacuationCenterAssignmentData({
  id,
}: GetEvacuationCenterAssignmentDataArgs) {
  const { data, error } = await supabase
    .from('evacuation_center_assignments')
    .select()
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Evacuation center assignment not found');
    }

    throw new BadRequestError(`Failed to get evacuation center assignment: ${error.message}`);
  }

  return data;
}

export type GetEvacuationCenterAssignmentDataResponse = Awaited<
  ReturnType<typeof getEvacuationCenterAssignmentData>
>;
