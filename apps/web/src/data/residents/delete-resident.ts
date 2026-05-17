import { supabase } from '@/lib/supabase';
import { BadRequestError } from '@/utils/errors';

export type DeleteResidentDataArgs = {
  id: string;
};

export async function deleteResidentData({ id }: DeleteResidentDataArgs) {
  const { data, error } = await supabase.from('residents').delete().eq('id', id).select().single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw new BadRequestError(`Failed to delete resident: ${error.message}`);
  }

  return data;
}

export type DeleteResidentDataResponse = Awaited<ReturnType<typeof deleteResidentData>>;
