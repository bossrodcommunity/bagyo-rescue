import { type PublicTableInsert } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type CreateEvacuationCenterAssignmentDataArgs = {
  payload: PublicTableInsert<'evacuation_center_assignments'>;
};

export async function createEvacuationCenterAssignmentData(
  args: CreateEvacuationCenterAssignmentDataArgs
) {
  const { data, error } = await supabase
    .from('evacuation_center_assignments')
    .insert(args.payload)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Evacuation center assignment not found');
    }

    throw new BadRequestError(`Failed to create evacuation center assignment: ${error.message}`);
  }

  return data;
}

export type CreateEvacuationCenterAssignmentDataResponse = Awaited<
  ReturnType<typeof createEvacuationCenterAssignmentData>
>;
