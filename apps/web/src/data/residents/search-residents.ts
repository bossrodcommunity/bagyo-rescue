import { transformToPaginatedResponse } from '@/data/transform-to-paginated-response';
import { type SearchDataArgs } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { type Database } from '@/lib/supabase/types';
import { BadRequestError } from '@/utils/errors';

export type SearchResidentsFilters = {
  searchText?: string;
  familyId?: string;
  currentStatus?: Database['public']['Enums']['resident_status'];
  sex?: Database['public']['Enums']['sex'];
  isSenior?: boolean;
  isChild?: boolean;
  isPwd?: boolean;
  isPregnant?: boolean;
};

export type SearchResidentsDataArgs = SearchDataArgs<'residents', SearchResidentsFilters>;

export async function searchResidentsData({
  limit = 25,
  page = 1,
  sortBy = 'created_at',
  orderBy = 'desc',
  filters,
}: SearchResidentsDataArgs = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('residents')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: orderBy === 'asc' });

  if (filters?.searchText) {
    query = query.or(
      `first_name.ilike.%${filters.searchText}%,last_name.ilike.%${filters.searchText}%`
    );
  }

  if (filters?.familyId) {
    query = query.eq('family_id', filters.familyId);
  }

  if (filters?.currentStatus) {
    query = query.eq('current_status', filters.currentStatus);
  }

  if (filters?.sex) {
    query = query.eq('sex', filters.sex);
  }

  if (filters?.isSenior !== undefined) {
    query = query.eq('is_senior', filters.isSenior);
  }

  if (filters?.isChild !== undefined) {
    query = query.eq('is_child', filters.isChild);
  }

  if (filters?.isPwd !== undefined) {
    query = query.eq('is_pwd', filters.isPwd);
  }

  if (filters?.isPregnant !== undefined) {
    query = query.eq('is_pregnant', filters.isPregnant);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new BadRequestError(`Failed to search residents: ${error.message}`);
  }

  return transformToPaginatedResponse({
    records: data || [],
    totalRecords: count || 0,
    limit,
    page,
  });
}

export type SearchResidentsDataResponse = Awaited<ReturnType<typeof searchResidentsData>>;
