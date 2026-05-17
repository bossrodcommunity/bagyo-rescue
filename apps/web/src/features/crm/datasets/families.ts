import {
  createFamilyData,
  deleteFamilyData,
  generateFamilyCodeData,
  searchFamiliesData,
  updateFamilyData,
  type PublicTableInsert,
  type PublicTableUpdate,
} from '@/data';
import type { CrmDataset } from '../types';
import { shortId, toDatasetResult } from '../utils';

export const familiesDataset: CrmDataset = {
  id: 'families',
  label: 'Families',
  singularLabel: 'Family',
  description: 'Family units, member counts, evacuation status, and assistance needs.',
  searchPlaceholder: 'Search family, head, phone, or notes',
  metricLabel: 'Families',
  columns: [
    { id: 'code', label: 'Code' },
    { id: 'head', label: 'Head' },
    { id: 'phone', label: 'Head phone' },
    { id: 'members', label: 'Members' },
    { id: 'status', label: 'Status' },
    { id: 'house', label: 'House ID' },
  ],
  formFields: [
    {
      name: 'family_code',
      label: 'Family code',
      type: 'text',
      autoGenerate: {
        sourceFields: ['family_name'],
        generate: sourceValues => generateFamilyCodeData({ familyName: sourceValues.family_name }),
      },
    },
    { name: 'family_name', label: 'Family name', type: 'text', required: true },
    { name: 'head_of_family', label: 'Head of family', type: 'text', required: true },
    { name: 'head_of_family_phone_number', label: 'Head phone number', type: 'text' },
    { name: 'house_id', label: 'House ID', type: 'text', required: true },
    { name: 'total_members', label: 'Total members', type: 'number', required: true },
    { name: 'current_inside_count', label: 'Inside count', type: 'number', defaultValue: 0 },
    { name: 'evacuated_count', label: 'Evacuated count', type: 'number', defaultValue: 0 },
    {
      name: 'missing_or_unconfirmed_count',
      label: 'Missing or unconfirmed count',
      type: 'number',
      defaultValue: 0,
    },
    { name: 'needs_assistance', label: 'Needs assistance', type: 'checkbox' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
  createRecord: payload => createFamilyData({ payload: payload as PublicTableInsert<'families'> }),
  updateRecord: (id, payload) =>
    updateFamilyData({ id, payload: payload as PublicTableUpdate<'families'> }),
  deleteRecord: id => deleteFamilyData({ id }),
  fetchRecords: async searchText => {
    const response = await searchFamiliesData({
      limit: 25,
      sortBy: 'created_at',
      orderBy: 'desc',
      filters: searchText ? { searchText } : undefined,
    });

    return toDatasetResult(
      response,
      response.records.map(family => ({
        id: family.id,
        title: family.family_name,
        subtitle: family.head_of_family,
        fields: {
          code: family.family_code,
          head: family.head_of_family,
          phone: family.head_of_family_phone_number,
          members: family.total_members,
          status: family.needs_assistance ? 'Needs assistance' : 'Monitored',
          house: shortId(family.house_id),
        },
        tags: [
          {
            label: family.needs_assistance ? 'Needs assistance' : 'Monitored',
            tone: family.needs_assistance ? 'high' : 'success',
          },
        ],
        details: [
          { label: 'Family code', value: family.family_code },
          { label: 'Family', value: family.family_name },
          { label: 'Head of family', value: family.head_of_family },
          { label: 'Head phone number', value: family.head_of_family_phone_number },
          { label: 'Total members', value: family.total_members },
          { label: 'Inside', value: family.current_inside_count },
          { label: 'Evacuated', value: family.evacuated_count },
          { label: 'Missing or unconfirmed', value: family.missing_or_unconfirmed_count },
          { label: 'Needs assistance', value: family.needs_assistance },
          { label: 'House ID', value: family.house_id },
          { label: 'Notes', value: family.notes },
        ],
        formValues: family,
      }))
    );
  },
};
