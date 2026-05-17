import { type PublicTableUpdate } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type UpdateEvacuationCenterAssignmentDataArgs = {
  id: string;
  payload: PublicTableUpdate<'evacuation_center_assignments'>;
};

export async function updateEvacuationCenterAssignmentData(
  args: UpdateEvacuationCenterAssignmentDataArgs
) {
  const { data, error } = await supabase
    .from('evacuation_center_assignments')
    .update({
      ...args.payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', args.id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Evacuation center assignment not found');
    }

    throw new BadRequestError(`Failed to update evacuation center assignment: ${error.message}`);
  }

  return data;
}

export type UpdateEvacuationCenterAssignmentDataResponse = Awaited<
  ReturnType<typeof updateEvacuationCenterAssignmentData>
>;
