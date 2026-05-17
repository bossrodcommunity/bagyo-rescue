import { searchFamiliesData } from './search-families';
import { buildUniqueAccessCode } from '@/utils/access-codes/build-access-code';

export type GenerateFamilyCodeDataArgs = {
  familyName: string;
};

export async function generateFamilyCodeData({ familyName }: GenerateFamilyCodeDataArgs) {
  return buildUniqueAccessCode({
    prefix: 'FAM',
    sourceText: familyName,
    isCodeAvailable: async code => {
      const response = await searchFamiliesData({
        limit: 1,
        filters: { familyCode: code },
      });

      return response.total_records === 0;
    },
  });
}

export type GenerateFamilyCodeDataResponse = Awaited<ReturnType<typeof generateFamilyCodeData>>;
