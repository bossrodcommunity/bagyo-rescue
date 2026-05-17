import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type GetFamilyDataArgs = {
  id: string;
};

export async function getFamilyData({ id }: GetFamilyDataArgs) {
  const { data, error } = await supabase.from('families').select().eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Family not found');
    }

    throw new BadRequestError(`Failed to get family: ${error.message}`);
  }

  return data;
}

export type GetFamilyDataResponse = Awaited<ReturnType<typeof getFamilyData>>;
