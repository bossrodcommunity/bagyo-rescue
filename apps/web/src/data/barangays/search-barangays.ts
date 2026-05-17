import { transformToPaginatedResponse } from '@/data/transform-to-paginated-response';
import { type SearchDataArgs } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { type Database } from '@/lib/supabase/types';
import { BadRequestError } from '@/utils/errors';

export type SearchBarangaysFilters = {
  searchText?: string;
  lguId?: string;
  riskLevel?: Database['public']['Enums']['risk_level'];
};

export type SearchBarangaysDataArgs = SearchDataArgs<'barangays', SearchBarangaysFilters>;

export async function searchBarangaysData({
  limit = 25,
  page = 1,
  sortBy = 'created_at',
  orderBy = 'desc',
  filters,
}: SearchBarangaysDataArgs = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('barangays')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: orderBy === 'asc' });

  if (filters?.searchText) {
    query = query.or(`name.ilike.%${filters.searchText}%,area_name.ilike.%${filters.searchText}%`);
  }

  if (filters?.lguId) {
    query = query.eq('lgu_id', filters.lguId);
  }

  if (filters?.riskLevel) {
    query = query.eq('risk_level', filters.riskLevel);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new BadRequestError(`Failed to search barangays: ${error.message}`);
  }

  return transformToPaginatedResponse({
    records: data || [],
    totalRecords: count || 0,
    limit,
    page,
  });
}

export type SearchBarangaysDataResponse = Awaited<ReturnType<typeof searchBarangaysData>>;
