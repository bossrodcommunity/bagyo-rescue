import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type GetLguDataArgs = {
  id: string;
};

export async function getLguData({ id }: GetLguDataArgs) {
  const { data, error } = await supabase.from('lgus').select().eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('LGU not found');
    }

    throw new BadRequestError(`Failed to get LGU: ${error.message}`);
  }

  return data;
}

export type GetLguDataResponse = Awaited<ReturnType<typeof getLguData>>;
