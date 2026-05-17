import { transformToPaginatedResponse } from '@/data/transform-to-paginated-response';
import { type SearchDataArgs } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError } from '@/utils/errors';

export type SearchFamiliesFilters = {
  searchText?: string;
  houseId?: string;
  familyCode?: string;
  needsAssistance?: boolean;
};

export type SearchFamiliesDataArgs = SearchDataArgs<'families', SearchFamiliesFilters>;

export async function searchFamiliesData({
  limit = 25,
  page = 1,
  sortBy = 'created_at',
  orderBy = 'desc',
  filters,
}: SearchFamiliesDataArgs = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('families')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: orderBy === 'asc' });

  if (filters?.searchText) {
    query = query.or(
      `family_code.ilike.%${filters.searchText}%,family_name.ilike.%${filters.searchText}%,head_of_family.ilike.%${filters.searchText}%,head_of_family_phone_number.ilike.%${filters.searchText}%,notes.ilike.%${filters.searchText}%`
    );
  }

  if (filters?.houseId) {
    query = query.eq('house_id', filters.houseId);
  }

  if (filters?.familyCode) {
    query = query.eq('family_code', filters.familyCode);
  }

  if (filters?.needsAssistance !== undefined) {
    query = query.eq('needs_assistance', filters.needsAssistance);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new BadRequestError(`Failed to search families: ${error.message}`);
  }

  return transformToPaginatedResponse({
    records: data || [],
    totalRecords: count || 0,
    limit,
    page,
  });
}

export type SearchFamiliesDataResponse = Awaited<ReturnType<typeof searchFamiliesData>>;
