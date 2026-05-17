import {
  createContactPersonData,
  deleteContactPersonData,
  searchContactPersonsData,
  updateContactPersonData,
  type PublicTableInsert,
  type PublicTableUpdate,
} from '@/data';
import { Constants } from '@/lib/supabase/types';
import type { CrmDataset } from '../types';
import { toDatasetResult } from '../utils';

export const contactPersonsDataset: CrmDataset = {
  id: 'contact-persons',
  label: 'Contacts',
  singularLabel: 'Contact',
  description: 'Contact persons attached to LGUs, barangays, houses, families, and centers.',
  searchPlaceholder: 'Search name, number, or email',
  metricLabel: 'Contacts',
  columns: [
    { id: 'role', label: 'Role' },
    { id: 'entity', label: 'Entity' },
    { id: 'contact', label: 'Contact' },
    { id: 'primary', label: 'Primary' },
  ],
  formFields: [
    { name: 'full_name', label: 'Full name', type: 'text', required: true },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: Constants.public.Enums.contact_role,
    },
    {
      name: 'entity_type',
      label: 'Entity type',
      type: 'select',
      required: true,
      options: Constants.public.Enums.contact_entity_type,
    },
    { name: 'entity_id', label: 'Entity ID', type: 'text', required: true },
    { name: 'contact_number', label: 'Contact number', type: 'text', required: true },
    { name: 'alternate_contact_number', label: 'Alternate number', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'is_primary', label: 'Primary contact', type: 'checkbox' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
  createRecord: payload =>
    createContactPersonData({ payload: payload as PublicTableInsert<'contact_persons'> }),
  updateRecord: (id, payload) =>
    updateContactPersonData({
      id,
      payload: payload as PublicTableUpdate<'contact_persons'>,
    }),
  deleteRecord: id => deleteContactPersonData({ id }),
  fetchRecords: async searchText => {
    const response = await searchContactPersonsData({
      limit: 25,
      sortBy: 'full_name',
      orderBy: 'asc',
      filters: searchText ? { searchText } : undefined,
    });

    return toDatasetResult(
      response,
      response.records.map(contact => ({
        id: contact.id,
        title: contact.full_name,
        subtitle: contact.role,
        fields: {
          role: contact.role,
          entity: contact.entity_type,
          contact: contact.contact_number,
          primary: contact.is_primary ? 'Yes' : 'No',
        },
        tags: [
          {
            label: contact.is_primary ? 'Primary' : contact.entity_type,
            tone: contact.is_primary ? 'success' : 'neutral',
          },
        ],
        details: [
          { label: 'Full name', value: contact.full_name },
          { label: 'Role', value: contact.role },
          { label: 'Entity type', value: contact.entity_type },
          { label: 'Entity ID', value: contact.entity_id },
          { label: 'Contact number', value: contact.contact_number },
          { label: 'Alternate number', value: contact.alternate_contact_number },
          { label: 'Email', value: contact.email },
          { label: 'Primary contact', value: contact.is_primary },
          { label: 'Notes', value: contact.notes },
        ],
        formValues: contact,
      }))
    );
  },
};
