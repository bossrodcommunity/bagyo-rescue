import { supabase } from '@/lib/supabase';
import { BadRequestError } from '@/utils/errors';

export type DeleteContactPersonDataArgs = {
  id: string;
};

export async function deleteContactPersonData({ id }: DeleteContactPersonDataArgs) {
  const { data, error } = await supabase
    .from('contact_persons')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw new BadRequestError(`Failed to delete contact person: ${error.message}`);
  }

  return data;
}

export type DeleteContactPersonDataResponse = Awaited<ReturnType<typeof deleteContactPersonData>>;
