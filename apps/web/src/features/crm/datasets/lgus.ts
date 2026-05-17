import {
  createLguData,
  deleteLguData,
  searchLgusData,
  updateLguData,
  type PublicTableInsert,
  type PublicTableUpdate,
} from '@/data';
import type { CrmDataset } from '../types';
import { formatDate, toDatasetResult } from '../utils';

export const lgusDataset: CrmDataset = {
  id: 'lgus',
  label: 'LGUs',
  singularLabel: 'LGU',
  description: 'Municipal and city command records for local response ownership.',
  searchPlaceholder: 'Search LGU, city, municipality, or province',
  metricLabel: 'LGUs',
  columns: [
    { id: 'location', label: 'Location' },
    { id: 'province', label: 'Province' },
    { id: 'updatedAt', label: 'Updated' },
  ],
  formFields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    {
      name: 'city_or_municipality',
      label: 'City or municipality',
      type: 'text',
      required: true,
    },
    { name: 'province', label: 'Province', type: 'text', required: true },
  ],
  createRecord: payload => createLguData({ payload: payload as PublicTableInsert<'lgus'> }),
  updateRecord: (id, payload) =>
    updateLguData({ id, payload: payload as PublicTableUpdate<'lgus'> }),
  deleteRecord: id => deleteLguData({ id }),
  fetchRecords: async searchText => {
    const response = await searchLgusData({
      limit: 25,
      sortBy: 'name',
      orderBy: 'asc',
      filters: searchText ? { searchText } : undefined,
    });

    return toDatasetResult(
      response,
      response.records.map(lgu => ({
        id: lgu.id,
        title: lgu.name,
        subtitle: lgu.city_or_municipality,
        fields: {
          location: lgu.city_or_municipality,
          province: lgu.province,
          updatedAt: formatDate(lgu.updated_at),
        },
        details: [
          { label: 'Name', value: lgu.name },
          { label: 'City or municipality', value: lgu.city_or_municipality },
          { label: 'Province', value: lgu.province },
          { label: 'Created', value: formatDate(lgu.created_at) },
          { label: 'Updated', value: formatDate(lgu.updated_at) },
        ],
        formValues: lgu,
      }))
    );
  },
};
