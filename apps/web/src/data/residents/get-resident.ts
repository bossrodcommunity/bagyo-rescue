import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type GetResidentDataArgs = {
  id: string;
};

export async function getResidentData({ id }: GetResidentDataArgs) {
  const { data, error } = await supabase.from('residents').select().eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Resident not found');
    }

    throw new BadRequestError(`Failed to get resident: ${error.message}`);
  }

  return data;
}

export type GetResidentDataResponse = Awaited<ReturnType<typeof getResidentData>>;
