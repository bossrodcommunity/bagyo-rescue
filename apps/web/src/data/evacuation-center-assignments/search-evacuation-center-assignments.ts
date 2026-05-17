import { transformToPaginatedResponse } from '@/data/transform-to-paginated-response';
import { type SearchDataArgs } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { type Database } from '@/lib/supabase/types';
import { BadRequestError } from '@/utils/errors';

export type SearchEvacuationCenterAssignmentsFilters = {
  evacuationCenterId?: string;
  familyId?: string;
  houseId?: string;
  status?: Database['public']['Enums']['evacuation_assignment_status'];
};

export type SearchEvacuationCenterAssignmentsDataArgs = SearchDataArgs<
  'evacuation_center_assignments',
  SearchEvacuationCenterAssignmentsFilters
>;

export async function searchEvacuationCenterAssignmentsData({
  limit = 25,
  page = 1,
  sortBy = 'created_at',
  orderBy = 'desc',
  filters,
}: SearchEvacuationCenterAssignmentsDataArgs = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('evacuation_center_assignments')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: orderBy === 'asc' });

  if (filters?.evacuationCenterId) {
    query = query.eq('evacuation_center_id', filters.evacuationCenterId);
  }

  if (filters?.familyId) {
    query = query.eq('family_id', filters.familyId);
  }

  if (filters?.houseId) {
    query = query.eq('house_id', filters.houseId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new BadRequestError(`Failed to search evacuation center assignments: ${error.message}`);
  }

  return transformToPaginatedResponse({
    records: data || [],
    totalRecords: count || 0,
    limit,
    page,
  });
}

export type SearchEvacuationCenterAssignmentsDataResponse = Awaited<
  ReturnType<typeof searchEvacuationCenterAssignmentsData>
>;
