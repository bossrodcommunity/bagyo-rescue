import { transformToPaginatedResponse } from '@/data/transform-to-paginated-response';
import { type SearchDataArgs } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError } from '@/utils/errors';

export type SearchLgusFilters = {
  searchText?: string;
  province?: string;
  cityOrMunicipality?: string;
};

export type SearchLgusDataArgs = SearchDataArgs<'lgus', SearchLgusFilters>;

export async function searchLgusData({
  limit = 25,
  page = 1,
  sortBy = 'created_at',
  orderBy = 'desc',
  filters,
}: SearchLgusDataArgs = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('lgus')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: orderBy === 'asc' });

  if (filters?.searchText) {
    query = query.or(
      `name.ilike.%${filters.searchText}%,province.ilike.%${filters.searchText}%,city_or_municipality.ilike.%${filters.searchText}%`
    );
  }

  if (filters?.province) {
    query = query.eq('province', filters.province);
  }

  if (filters?.cityOrMunicipality) {
    query = query.eq('city_or_municipality', filters.cityOrMunicipality);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new BadRequestError(`Failed to search LGUs: ${error.message}`);
  }

  return transformToPaginatedResponse({
    records: data || [],
    totalRecords: count || 0,
    limit,
    page,
  });
}

export type SearchLgusDataResponse = Awaited<ReturnType<typeof searchLgusData>>;
