import { type PublicTableRow, type PublicTableUpdate } from '@/data';
import { updateFamilyData } from '@/data/families';
import { updateHouseData } from '@/data/houses';

export type UpdateResidentFamilyStatusDataArgs = {
  familyId: string;
  payload: Pick<
    PublicTableUpdate<'families'>,
    | 'current_inside_count'
    | 'evacuated_count'
    | 'missing_or_unconfirmed_count'
    | 'needs_assistance'
    | 'notes'
  >;
};

export type UpdateResidentHouseReportDataArgs = {
  houseId: string;
  familyCode: string;
  payload: Pick<PublicTableUpdate<'houses'>, 'current_status' | 'water_level'>;
};

export async function updateResidentFamilyStatusData({
  familyId,
  payload,
}: UpdateResidentFamilyStatusDataArgs): Promise<PublicTableRow<'families'>> {
  return updateFamilyData({
    id: familyId,
    payload,
  });
}

export async function updateResidentHouseReportData({
  houseId,
  familyCode,
  payload,
}: UpdateResidentHouseReportDataArgs): Promise<PublicTableRow<'houses'>> {
  return updateHouseData({
    id: houseId,
    payload: {
      ...payload,
      last_checked_at: new Date().toISOString(),
      last_checked_by: `Resident ${familyCode}`,
    },
  });
}
