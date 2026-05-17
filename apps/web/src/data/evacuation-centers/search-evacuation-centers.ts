import { transformToPaginatedResponse } from '@/data/transform-to-paginated-response';
import { type SearchDataArgs } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { type Database } from '@/lib/supabase/types';
import { BadRequestError } from '@/utils/errors';

export type SearchEvacuationCentersFilters = {
  searchText?: string;
  lguId?: string;
  barangayId?: string;
  status?: Database['public']['Enums']['evacuation_center_status'];
  type?: Database['public']['Enums']['evacuation_center_type'];
  hasFoodSupply?: boolean;
  hasWaterSupply?: boolean;
  hasMedicalSupport?: boolean;
  hasPower?: boolean;
};

export type SearchEvacuationCentersDataArgs = SearchDataArgs<
  'evacuation_centers',
  SearchEvacuationCentersFilters
>;

export async function searchEvacuationCentersData({
  limit = 25,
  page = 1,
  sortBy = 'created_at',
  orderBy = 'desc',
  filters,
}: SearchEvacuationCentersDataArgs = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('evacuation_centers')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: orderBy === 'asc' });

  if (filters?.searchText) {
    query = query.or(
      `name.ilike.%${filters.searchText}%,address.ilike.%${filters.searchText}%,landmark.ilike.%${filters.searchText}%,notes.ilike.%${filters.searchText}%`
    );
  }

  if (filters?.lguId) {
    query = query.eq('lgu_id', filters.lguId);
  }

  if (filters?.barangayId) {
    query = query.eq('barangay_id', filters.barangayId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.hasFoodSupply !== undefined) {
    query = query.eq('has_food_supply', filters.hasFoodSupply);
  }

  if (filters?.hasWaterSupply !== undefined) {
    query = query.eq('has_water_supply', filters.hasWaterSupply);
  }

  if (filters?.hasMedicalSupport !== undefined) {
    query = query.eq('has_medical_support', filters.hasMedicalSupport);
  }

  if (filters?.hasPower !== undefined) {
    query = query.eq('has_power', filters.hasPower);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new BadRequestError(`Failed to search evacuation centers: ${error.message}`);
  }

  return transformToPaginatedResponse({
    records: data || [],
    totalRecords: count || 0,
    limit,
    page,
  });
}

export type SearchEvacuationCentersDataResponse = Awaited<
  ReturnType<typeof searchEvacuationCentersData>
>;
