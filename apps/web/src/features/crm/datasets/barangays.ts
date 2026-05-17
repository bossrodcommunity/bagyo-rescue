import {
  createBarangayData,
  deleteBarangayData,
  searchBarangaysData,
  updateBarangayData,
  type PublicTableInsert,
  type PublicTableUpdate,
} from '@/data';
import { Constants } from '@/lib/supabase/types';
import type { CrmDataset } from '../types';
import { formatDate, shortId, toDatasetResult, toneFromRisk } from '../utils';

export const barangaysDataset: CrmDataset = {
  id: 'barangays',
  label: 'Barangays',
  singularLabel: 'Barangay',
  description: 'Area-level records with risk posture and LGU ownership.',
  searchPlaceholder: 'Search barangay or area name',
  metricLabel: 'Barangays',
  columns: [
    { id: 'area', label: 'Area' },
    { id: 'risk', label: 'Risk' },
    { id: 'lgu', label: 'LGU ID' },
    { id: 'updatedAt', label: 'Updated' },
  ],
  formFields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'area_name', label: 'Area name', type: 'text' },
    { name: 'lgu_id', label: 'LGU ID', type: 'text', required: true },
    {
      name: 'risk_level',
      label: 'Risk level',
      type: 'select',
      required: true,
      options: Constants.public.Enums.risk_level,
    },
  ],
  createRecord: payload =>
    createBarangayData({ payload: payload as PublicTableInsert<'barangays'> }),
  updateRecord: (id, payload) =>
    updateBarangayData({ id, payload: payload as PublicTableUpdate<'barangays'> }),
  deleteRecord: id => deleteBarangayData({ id }),
  fetchRecords: async searchText => {
    const response = await searchBarangaysData({
      limit: 25,
      sortBy: 'name',
      orderBy: 'asc',
      filters: searchText ? { searchText } : undefined,
    });

    return toDatasetResult(
      response,
      response.records.map(barangay => ({
        id: barangay.id,
        title: barangay.name,
        subtitle: barangay.area_name ?? 'No area assigned',
        fields: {
          area: barangay.area_name,
          risk: barangay.risk_level,
          lgu: shortId(barangay.lgu_id),
          updatedAt: formatDate(barangay.updated_at),
        },
        tags: [{ label: barangay.risk_level, tone: toneFromRisk(barangay.risk_level) }],
        details: [
          { label: 'Name', value: barangay.name },
          { label: 'Area', value: barangay.area_name },
          { label: 'Risk level', value: barangay.risk_level },
          { label: 'LGU ID', value: barangay.lgu_id },
          { label: 'Created', value: formatDate(barangay.created_at) },
          { label: 'Updated', value: formatDate(barangay.updated_at) },
        ],
        formValues: barangay,
      }))
    );
  },
};
