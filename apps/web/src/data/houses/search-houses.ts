import { transformToPaginatedResponse } from '@/data/transform-to-paginated-response';
import { type SearchDataArgs } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { type Database } from '@/lib/supabase/types';
import { BadRequestError } from '@/utils/errors';

export type SearchHousesFilters = {
  searchText?: string;
  barangayId?: string;
  currentStatus?: Database['public']['Enums']['house_status'];
  waterLevel?: Database['public']['Enums']['water_level'];
};

export type SearchHousesDataArgs = SearchDataArgs<'houses', SearchHousesFilters>;

export async function searchHousesData({
  limit = 25,
  page = 1,
  sortBy = 'created_at',
  orderBy = 'desc',
  filters,
}: SearchHousesDataArgs = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('houses')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: orderBy === 'asc' });

  if (filters?.searchText) {
    query = query.or(
      `address.ilike.%${filters.searchText}%,landmark.ilike.%${filters.searchText}%`
    );
  }

  if (filters?.barangayId) {
    query = query.eq('barangay_id', filters.barangayId);
  }

  if (filters?.currentStatus) {
    query = query.eq('current_status', filters.currentStatus);
  }

  if (filters?.waterLevel) {
    query = query.eq('water_level', filters.waterLevel);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new BadRequestError(`Failed to search houses: ${error.message}`);
  }

  return transformToPaginatedResponse({
    records: data || [],
    totalRecords: count || 0,
    limit,
    page,
  });
}

export type SearchHousesDataResponse = Awaited<ReturnType<typeof searchHousesData>>;
