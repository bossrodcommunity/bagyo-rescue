import { type PublicTableInsert } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type CreateContactPersonDataArgs = {
  payload: PublicTableInsert<'contact_persons'>;
};

export async function createContactPersonData(args: CreateContactPersonDataArgs) {
  const { data, error } = await supabase
    .from('contact_persons')
    .insert(args.payload)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Contact person not found');
    }

    throw new BadRequestError(`Failed to create contact person: ${error.message}`);
  }

  return data;
}

export type CreateContactPersonDataResponse = Awaited<ReturnType<typeof createContactPersonData>>;
