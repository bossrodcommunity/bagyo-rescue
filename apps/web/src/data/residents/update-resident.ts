import { type PublicTableUpdate } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type UpdateResidentDataArgs = {
  id: string;
  payload: PublicTableUpdate<'residents'>;
};

export async function updateResidentData(args: UpdateResidentDataArgs) {
  const { data, error } = await supabase
    .from('residents')
    .update({
      ...args.payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', args.id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Resident not found');
    }

    throw new BadRequestError(`Failed to update resident: ${error.message}`);
  }

  return data;
}

export type UpdateResidentDataResponse = Awaited<ReturnType<typeof updateResidentData>>;
