import { type PublicTableRow } from '@/data';
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type GetResidentFamilyAccessDataArgs = {
  familyCode: string;
};

export type ResidentFamilyAccessData = Pick<
  PublicTableRow<'families'>,
  'id' | 'family_code' | 'family_name' | 'head_of_family'
>;

export async function getResidentFamilyAccessData({
  familyCode,
}: GetResidentFamilyAccessDataArgs): Promise<ResidentFamilyAccessData> {
  const normalizedFamilyCode = familyCode.trim().toUpperCase();

  const { data, error } = await supabase
    .from('families')
    .select('id, family_code, family_name, head_of_family')
    .ilike('family_code', normalizedFamilyCode)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Family code was not found.');
    }

    throw new BadRequestError(`Failed to validate family code: ${error.message}`);
  }

  if (!data) {
    throw new NotFoundError('Family code was not found.');
  }

  return data;
}
