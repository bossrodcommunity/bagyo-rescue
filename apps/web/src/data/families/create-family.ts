import { type PublicTableInsert } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type CreateFamilyDataArgs = {
  payload: PublicTableInsert<'families'>;
};

export async function createFamilyData(args: CreateFamilyDataArgs) {
  const { data, error } = await supabase.from('families').insert(args.payload).select().single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Family not found');
    }

    throw new BadRequestError(`Failed to create family: ${error.message}`);
  }

  return data;
}

export type CreateFamilyDataResponse = Awaited<ReturnType<typeof createFamilyData>>;
