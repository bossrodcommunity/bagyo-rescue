import { supabase } from '@/lib/supabase';
import { BadRequestError } from '@/utils/errors';

export type DeleteFamilyDataArgs = {
  id: string;
};

export async function deleteFamilyData({ id }: DeleteFamilyDataArgs) {
  const { data, error } = await supabase.from('families').delete().eq('id', id).select().single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw new BadRequestError(`Failed to delete family: ${error.message}`);
  }

  return data;
}

export type DeleteFamilyDataResponse = Awaited<ReturnType<typeof deleteFamilyData>>;
