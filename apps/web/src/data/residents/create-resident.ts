import { type PublicTableInsert } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type CreateResidentDataArgs = {
  payload: PublicTableInsert<'residents'>;
};

export async function createResidentData(args: CreateResidentDataArgs) {
  const { data, error } = await supabase.from('residents').insert(args.payload).select().single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Resident not found');
    }

    throw new BadRequestError(`Failed to create resident: ${error.message}`);
  }

  return data;
}

export type CreateResidentDataResponse = Awaited<ReturnType<typeof createResidentData>>;
