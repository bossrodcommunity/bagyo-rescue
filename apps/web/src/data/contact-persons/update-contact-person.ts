import { type PublicTableUpdate } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type UpdateContactPersonDataArgs = {
  id: string;
  payload: PublicTableUpdate<'contact_persons'>;
};

export async function updateContactPersonData(args: UpdateContactPersonDataArgs) {
  const { data, error } = await supabase
    .from('contact_persons')
    .update({
      ...args.payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', args.id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Contact person not found');
    }

    throw new BadRequestError(`Failed to update contact person: ${error.message}`);
  }

  return data;
}

export type UpdateContactPersonDataResponse = Awaited<ReturnType<typeof updateContactPersonData>>;
