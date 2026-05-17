import {
  createEvacuationCenterData,
  deleteEvacuationCenterData,
  searchEvacuationCentersData,
  updateEvacuationCenterData,
  type PublicTableInsert,
  type PublicTableUpdate,
} from '@/data';
import { Constants } from '@/lib/supabase/types';
import type { CrmDataset } from '../types';
import { formatDate, supplySummary, toDatasetResult, toneFromStatus } from '../utils';

export const evacuationCentersDataset: CrmDataset = {
  id: 'evacuation-centers',
  label: 'Evacuation Centers',
  singularLabel: 'Evacuation center',
  description: 'Shelter capacity, occupancy, supplies, and operational status.',
  searchPlaceholder: 'Search center, address, landmark, or notes',
  metricLabel: 'Centers',
  columns: [
    { id: 'status', label: 'Status' },
    { id: 'occupancy', label: 'Occupancy' },
    { id: 'supplies', label: 'Supplies' },
    { id: 'address', label: 'Address' },
  ],
  formFields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'address', label: 'Address', type: 'textarea', required: true },
    { name: 'landmark', label: 'Landmark', type: 'text' },
    { name: 'lgu_id', label: 'LGU ID', type: 'text', required: true },
    { name: 'barangay_id', label: 'Barangay ID', type: 'text' },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      options: Constants.public.Enums.evacuation_center_type,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: Constants.public.Enums.evacuation_center_status,
    },
    { name: 'capacity', label: 'Capacity', type: 'number', required: true },
    { name: 'current_occupancy', label: 'Current occupancy', type: 'number', defaultValue: 0 },
    { name: 'has_food_supply', label: 'Food supply', type: 'checkbox' },
    { name: 'has_water_supply', label: 'Water supply', type: 'checkbox' },
    { name: 'has_medical_support', label: 'Medical support', type: 'checkbox' },
    { name: 'has_power', label: 'Power', type: 'checkbox' },
    { name: 'latitude', label: 'Latitude', type: 'number' },
    { name: 'longitude', label: 'Longitude', type: 'number' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
  createRecord: payload =>
    createEvacuationCenterData({
      payload: payload as PublicTableInsert<'evacuation_centers'>,
    }),
  updateRecord: (id, payload) =>
    updateEvacuationCenterData({
      id,
      payload: payload as PublicTableUpdate<'evacuation_centers'>,
    }),
  deleteRecord: id => deleteEvacuationCenterData({ id }),
  fetchRecords: async searchText => {
    const response = await searchEvacuationCentersData({
      limit: 25,
      sortBy: 'created_at',
      orderBy: 'desc',
      filters: searchText ? { searchText } : undefined,
    });

    return toDatasetResult(
      response,
      response.records.map(center => ({
        id: center.id,
        title: center.name,
        subtitle: center.type,
        fields: {
          status: center.status,
          occupancy: `${center.current_occupancy} / ${center.capacity}`,
          supplies: supplySummary(center),
          address: center.address,
        },
        tags: [{ label: center.status, tone: toneFromStatus(center.status) }],
        details: [
          { label: 'Name', value: center.name },
          { label: 'Type', value: center.type },
          { label: 'Status', value: center.status },
          { label: 'Capacity', value: center.capacity },
          { label: 'Current occupancy', value: center.current_occupancy },
          { label: 'Address', value: center.address },
          { label: 'Landmark', value: center.landmark },
          { label: 'Food supply', value: center.has_food_supply },
          { label: 'Water supply', value: center.has_water_supply },
          { label: 'Medical support', value: center.has_medical_support },
          { label: 'Power', value: center.has_power },
          { label: 'Notes', value: center.notes },
          { label: 'Created', value: formatDate(center.created_at) },
          { label: 'Updated', value: formatDate(center.updated_at) },
        ],
        formValues: center,
      }))
    );
  },
};
