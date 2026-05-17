import { type PublicTableRow } from '@/data';
import { searchContactPersonsData } from '@/data/contact-persons';
import { searchEvacuationCentersData } from '@/data/evacuation-centers';
import { searchResidentsData } from '@/data/residents';
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type GetResidentSessionDataArgs = {
  familyCode: string;
  pinCode: string;
};

export type ResidentSessionData = {
  lgu: PublicTableRow<'lgus'>;
  barangay: PublicTableRow<'barangays'>;
  house: PublicTableRow<'houses'>;
  family: PublicTableRow<'families'>;
  residents: PublicTableRow<'residents'>[];
  evacuationCenters: PublicTableRow<'evacuation_centers'>[];
  emergencyContacts: {
    lgu: PublicTableRow<'contact_persons'>[];
    barangay: PublicTableRow<'contact_persons'>[];
  };
};

export async function getResidentSessionData(
  args: GetResidentSessionDataArgs
): Promise<ResidentSessionData> {
  const familyCode = normalizeAccessCode(args.familyCode);
  const pinCode = args.pinCode.trim();

  const family = await getRequiredRecord<PublicTableRow<'families'>>(
    supabase
      .from('families')
      .select('*')
      .ilike('family_code', familyCode)
      .eq('pin_code', pinCode)
      .single(),
    'Family code or PIN was not recognized.'
  );
  const house = await getRequiredRecord<PublicTableRow<'houses'>>(
    supabase.from('houses').select('*').eq('id', family.house_id).single(),
    'House linked to this family was not found.'
  );
  const barangay = await getRequiredRecord<PublicTableRow<'barangays'>>(
    supabase.from('barangays').select('*').eq('id', house.barangay_id).single(),
    'Barangay linked to this family was not found.'
  );
  const lgu = await getRequiredRecord<PublicTableRow<'lgus'>>(
    supabase.from('lgus').select('*').eq('id', barangay.lgu_id).single(),
    'LGU linked to this family was not found.'
  );
  const [
    residentsResponse,
    evacuationCentersResponse,
    lguContactsResponse,
    barangayContactsResponse,
  ] = await Promise.all([
    searchResidentsData({
      limit: 100,
      sortBy: 'last_name',
      orderBy: 'asc',
      filters: { familyId: family.id },
    }),
    searchEvacuationCentersData({
      limit: 100,
      sortBy: 'name',
      orderBy: 'asc',
      filters: { lguId: lgu.id },
    }),
    searchContactPersonsData({
      limit: 10,
      sortBy: 'is_primary',
      orderBy: 'desc',
      filters: { entityType: 'LGU', entityId: lgu.id },
    }),
    searchContactPersonsData({
      limit: 10,
      sortBy: 'is_primary',
      orderBy: 'desc',
      filters: { entityType: 'Barangay', entityId: barangay.id },
    }),
  ]);

  return {
    lgu,
    barangay,
    house,
    family,
    residents: residentsResponse.records,
    evacuationCenters: evacuationCentersResponse.records,
    emergencyContacts: {
      lgu: lguContactsResponse.records,
      barangay: barangayContactsResponse.records,
    },
  };
}

function normalizeAccessCode(value: string) {
  return value.trim().toUpperCase();
}

async function getRequiredRecord<TRecord>(
  request: PromiseLike<{ data: TRecord | null; error: { code?: string; message: string } | null }>,
  notFoundMessage: string
) {
  const { data, error } = await request;

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError(notFoundMessage);
    }

    throw new BadRequestError(error.message);
  }

  if (!data) {
    throw new NotFoundError(notFoundMessage);
  }

  return data;
}
