import { supabase } from '@/lib/supabase';
import { type PublicTableInsert } from '@/data/types';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type CreateLguDataArgs = {
  payload: PublicTableInsert<'lgus'>;
};

export async function createLguData(args: CreateLguDataArgs) {
  const { data, error } = await supabase.from('lgus').insert(args.payload).select().single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('LGU not found');
    }

    throw new BadRequestError(`Failed to create LGU: ${error.message}`);
  }

  return data;
}

export type CreateLguDataResponse = Awaited<ReturnType<typeof createLguData>>;
