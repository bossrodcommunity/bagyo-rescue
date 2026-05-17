import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type GetContactPersonDataArgs = {
  id: string;
};

export async function getContactPersonData({ id }: GetContactPersonDataArgs) {
  const { data, error } = await supabase.from('contact_persons').select().eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Contact person not found');
    }

    throw new BadRequestError(`Failed to get contact person: ${error.message}`);
  }

  return data;
}

export type GetContactPersonDataResponse = Awaited<ReturnType<typeof getContactPersonData>>;
