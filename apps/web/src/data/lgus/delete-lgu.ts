import { supabase } from '@/lib/supabase';
import { BadRequestError } from '@/utils/errors';

export type DeleteLguDataArgs = {
  id: string;
};

export async function deleteLguData({ id }: DeleteLguDataArgs) {
  const { data, error } = await supabase.from('lgus').delete().eq('id', id).select().single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw new BadRequestError(`Failed to delete LGU: ${error.message}`);
  }

  return data;
}

export type DeleteLguDataResponse = Awaited<ReturnType<typeof deleteLguData>>;
