import { type PublicTableUpdate } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type UpdateFamilyDataArgs = {
  id: string;
  payload: PublicTableUpdate<'families'>;
};

export async function updateFamilyData(args: UpdateFamilyDataArgs) {
  const { data, error } = await supabase
    .from('families')
    .update({
      ...args.payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', args.id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Family not found');
    }

    throw new BadRequestError(`Failed to update family: ${error.message}`);
  }

  return data;
}

export type UpdateFamilyDataResponse = Awaited<ReturnType<typeof updateFamilyData>>;
