import { transformToPaginatedResponse } from '@/data/transform-to-paginated-response';
import { type SearchDataArgs } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { type Database } from '@/lib/supabase/types';
import { BadRequestError } from '@/utils/errors';

export type SearchContactPersonsFilters = {
  searchText?: string;
  entityType?: Database['public']['Enums']['contact_entity_type'];
  entityId?: string;
  role?: Database['public']['Enums']['contact_role'];
  isPrimary?: boolean;
};

export type SearchContactPersonsDataArgs = SearchDataArgs<
  'contact_persons',
  SearchContactPersonsFilters
>;

export async function searchContactPersonsData({
  limit = 25,
  page = 1,
  sortBy = 'created_at',
  orderBy = 'desc',
  filters,
}: SearchContactPersonsDataArgs = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('contact_persons')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: orderBy === 'asc' });

  if (filters?.searchText) {
    query = query.or(
      `full_name.ilike.%${filters.searchText}%,contact_number.ilike.%${filters.searchText}%,alternate_contact_number.ilike.%${filters.searchText}%,email.ilike.%${filters.searchText}%`
    );
  }

  if (filters?.entityType) {
    query = query.eq('entity_type', filters.entityType);
  }

  if (filters?.entityId) {
    query = query.eq('entity_id', filters.entityId);
  }

  if (filters?.role) {
    query = query.eq('role', filters.role);
  }

  if (filters?.isPrimary !== undefined) {
    query = query.eq('is_primary', filters.isPrimary);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new BadRequestError(`Failed to search contact persons: ${error.message}`);
  }

  return transformToPaginatedResponse({
    records: data || [],
    totalRecords: count || 0,
    limit,
    page,
  });
}

export type SearchContactPersonsDataResponse = Awaited<ReturnType<typeof searchContactPersonsData>>;
