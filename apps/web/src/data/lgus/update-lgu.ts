import { supabase } from '@/lib/supabase';
import { type PublicTableUpdate } from '@/data/types';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type UpdateLguDataArgs = {
  id: string;
  payload: PublicTableUpdate<'lgus'>;
};

export async function updateLguData(args: UpdateLguDataArgs) {
  const { data, error } = await supabase
    .from('lgus')
    .update({
      ...args.payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', args.id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('LGU not found');
    }

    throw new BadRequestError(`Failed to update LGU: ${error.message}`);
  }

  return data;
}

export type UpdateLguDataResponse = Awaited<ReturnType<typeof updateLguData>>;
