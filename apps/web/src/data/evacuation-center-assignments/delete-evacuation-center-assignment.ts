import { supabase } from '@/lib/supabase';
import { BadRequestError } from '@/utils/errors';

export type DeleteEvacuationCenterAssignmentDataArgs = {
  id: string;
};

export async function deleteEvacuationCenterAssignmentData({
  id,
}: DeleteEvacuationCenterAssignmentDataArgs) {
  const { data, error } = await supabase
    .from('evacuation_center_assignments')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw new BadRequestError(`Failed to delete evacuation center assignment: ${error.message}`);
  }

  return data;
}

export type DeleteEvacuationCenterAssignmentDataResponse = Awaited<
  ReturnType<typeof deleteEvacuationCenterAssignmentData>
>;
