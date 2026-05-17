import {
  createResidentData,
  deleteResidentData,
  searchResidentsData,
  updateResidentData,
  type PublicTableInsert,
  type PublicTableUpdate,
} from '@/data';
import { Constants } from '@/lib/supabase/types';
import type { CrmDataset } from '../types';
import { shortId, toDatasetResult, toneFromStatus } from '../utils';

export const residentsDataset: CrmDataset = {
  id: 'residents',
  label: 'Residents',
  singularLabel: 'Resident',
  description: 'Individual resident records with status and vulnerable-person flags.',
  searchPlaceholder: 'Search name or phone',
  metricLabel: 'Residents',
  columns: [
    { id: 'status', label: 'Status' },
    { id: 'phone', label: 'Phone' },
    { id: 'ageSex', label: 'Age / sex' },
    { id: 'flags', label: 'Flags' },
    { id: 'family', label: 'Family ID' },
  ],
  formFields: [
    { name: 'first_name', label: 'First name', type: 'text', required: true },
    { name: 'last_name', label: 'Last name', type: 'text', required: true },
    { name: 'phone_number', label: 'Phone number', type: 'text' },
    { name: 'family_id', label: 'Family ID', type: 'text', required: true },
    { name: 'age', label: 'Age', type: 'number' },
    {
      name: 'sex',
      label: 'Sex',
      type: 'select',
      required: true,
      options: Constants.public.Enums.sex,
    },
    {
      name: 'current_status',
      label: 'Current status',
      type: 'select',
      required: true,
      options: Constants.public.Enums.resident_status,
    },
    { name: 'is_child', label: 'Child', type: 'checkbox' },
    { name: 'is_senior', label: 'Senior', type: 'checkbox' },
    { name: 'is_pwd', label: 'PWD', type: 'checkbox' },
    { name: 'is_pregnant', label: 'Pregnant', type: 'checkbox' },
  ],
  createRecord: payload =>
    createResidentData({ payload: payload as PublicTableInsert<'residents'> }),
  updateRecord: (id, payload) =>
    updateResidentData({ id, payload: payload as PublicTableUpdate<'residents'> }),
  deleteRecord: id => deleteResidentData({ id }),
  fetchRecords: async searchText => {
    const response = await searchResidentsData({
      limit: 25,
      sortBy: 'last_name',
      orderBy: 'asc',
      filters: searchText ? { searchText } : undefined,
    });

    return toDatasetResult(
      response,
      response.records.map(resident => {
        const flags = [
          resident.is_child ? 'Child' : null,
          resident.is_senior ? 'Senior' : null,
          resident.is_pwd ? 'PWD' : null,
          resident.is_pregnant ? 'Pregnant' : null,
        ].filter(Boolean);

        return {
          id: resident.id,
          title: `${resident.first_name} ${resident.last_name}`,
          subtitle: resident.current_status,
          fields: {
            status: resident.current_status,
            phone: resident.phone_number,
            ageSex: [resident.age ?? 'Age unknown', resident.sex].join(' / '),
            flags: flags.length ? flags.join(', ') : 'None',
            family: shortId(resident.family_id),
          },
          tags: [
            {
              label: resident.current_status,
              tone: toneFromStatus(resident.current_status),
            },
          ],
          details: [
            { label: 'First name', value: resident.first_name },
            { label: 'Last name', value: resident.last_name },
            { label: 'Phone number', value: resident.phone_number },
            { label: 'Age', value: resident.age },
            { label: 'Sex', value: resident.sex },
            { label: 'Current status', value: resident.current_status },
            { label: 'Family ID', value: resident.family_id },
            { label: 'Child', value: resident.is_child },
            { label: 'Senior', value: resident.is_senior },
            { label: 'PWD', value: resident.is_pwd },
            { label: 'Pregnant', value: resident.is_pregnant },
          ],
          formValues: resident,
        };
      })
    );
  },
};
