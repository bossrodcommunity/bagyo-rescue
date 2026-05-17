import {
  createHouseData,
  deleteHouseData,
  searchHousesData,
  updateHouseData,
  type PublicTableInsert,
  type PublicTableUpdate,
} from '@/data';
import { Constants } from '@/lib/supabase/types';
import type { CrmDataset } from '../types';
import { formatDate, toDatasetResult, toneFromStatus, toneFromWaterLevel } from '../utils';

export const housesDataset: CrmDataset = {
  id: 'houses',
  label: 'Houses',
  singularLabel: 'House',
  description: 'Household locations with water level and rescue state.',
  searchPlaceholder: 'Search address or landmark',
  metricLabel: 'Houses',
  columns: [
    { id: 'status', label: 'Status' },
    { id: 'waterLevel', label: 'Water' },
    { id: 'address', label: 'Address' },
    { id: 'lastChecked', label: 'Last checked' },
  ],
  formFields: [
    { name: 'address', label: 'Address', type: 'textarea', required: true },
    { name: 'landmark', label: 'Landmark', type: 'text' },
    { name: 'barangay_id', label: 'Barangay ID', type: 'text', required: true },
    {
      name: 'current_status',
      label: 'Current status',
      type: 'select',
      required: true,
      options: Constants.public.Enums.house_status,
    },
    {
      name: 'water_level',
      label: 'Water level',
      type: 'select',
      required: true,
      options: Constants.public.Enums.water_level,
    },
    { name: 'last_checked_at', label: 'Last checked at', type: 'datetime' },
    { name: 'last_checked_by', label: 'Last checked by', type: 'text' },
    { name: 'latitude', label: 'Latitude', type: 'number' },
    { name: 'longitude', label: 'Longitude', type: 'number' },
  ],
  createRecord: payload => createHouseData({ payload: payload as PublicTableInsert<'houses'> }),
  updateRecord: (id, payload) =>
    updateHouseData({ id, payload: payload as PublicTableUpdate<'houses'> }),
  deleteRecord: id => deleteHouseData({ id }),
  fetchRecords: async searchText => {
    const response = await searchHousesData({
      limit: 25,
      sortBy: 'created_at',
      orderBy: 'desc',
      filters: searchText ? { searchText } : undefined,
    });

    return toDatasetResult(
      response,
      response.records.map(house => ({
        id: house.id,
        title: house.address,
        subtitle: house.landmark ?? house.current_status,
        fields: {
          status: house.current_status,
          waterLevel: house.water_level,
          address: house.address,
          lastChecked: formatDate(house.last_checked_at),
        },
        tags: [
          { label: house.current_status, tone: toneFromStatus(house.current_status) },
          { label: house.water_level, tone: toneFromWaterLevel(house.water_level) },
        ],
        details: [
          { label: 'Address', value: house.address },
          { label: 'Landmark', value: house.landmark },
          { label: 'Current status', value: house.current_status },
          { label: 'Water level', value: house.water_level },
          { label: 'Barangay ID', value: house.barangay_id },
          { label: 'Last checked', value: formatDate(house.last_checked_at) },
          { label: 'Last checked by', value: house.last_checked_by },
        ],
        formValues: house,
      }))
    );
  },
};
