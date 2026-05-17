import {
  createEvacuationCenterAssignmentData,
  deleteEvacuationCenterAssignmentData,
  searchEvacuationCenterAssignmentsData,
  updateEvacuationCenterAssignmentData,
  type PublicTableInsert,
  type PublicTableUpdate,
} from '@/data';
import { Constants } from '@/lib/supabase/types';
import type { CrmDataset } from '../types';
import { formatDate, shortId, toDatasetResult, toneFromStatus } from '../utils';

export const evacuationCenterAssignmentsDataset: CrmDataset = {
  id: 'evacuation-center-assignments',
  label: 'Assignments',
  singularLabel: 'Assignment',
  description: 'Family-to-center movement records with check-in and departure state.',
  metricLabel: 'Assignments',
  columns: [
    { id: 'status', label: 'Status' },
    { id: 'people', label: 'People' },
    { id: 'center', label: 'Center ID' },
    { id: 'arrived', label: 'Arrived' },
  ],
  formFields: [
    { name: 'evacuation_center_id', label: 'Evacuation center ID', type: 'text', required: true },
    { name: 'family_id', label: 'Family ID', type: 'text', required: true },
    { name: 'house_id', label: 'House ID', type: 'text', required: true },
    { name: 'number_of_people', label: 'Number of people', type: 'number', required: true },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: Constants.public.Enums.evacuation_assignment_status,
    },
    { name: 'arrived_at', label: 'Arrived at', type: 'datetime' },
    { name: 'left_at', label: 'Left at', type: 'datetime' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
  createRecord: payload =>
    createEvacuationCenterAssignmentData({
      payload: payload as PublicTableInsert<'evacuation_center_assignments'>,
    }),
  updateRecord: (id, payload) =>
    updateEvacuationCenterAssignmentData({
      id,
      payload: payload as PublicTableUpdate<'evacuation_center_assignments'>,
    }),
  deleteRecord: id => deleteEvacuationCenterAssignmentData({ id }),
  fetchRecords: async () => {
    const response = await searchEvacuationCenterAssignmentsData({
      limit: 25,
      sortBy: 'created_at',
      orderBy: 'desc',
    });

    return toDatasetResult(
      response,
      response.records.map(assignment => ({
        id: assignment.id,
        title: `Family ${shortId(assignment.family_id)}`,
        subtitle: assignment.status,
        fields: {
          status: assignment.status,
          people: assignment.number_of_people,
          center: shortId(assignment.evacuation_center_id),
          arrived: formatDate(assignment.arrived_at),
        },
        tags: [{ label: assignment.status, tone: toneFromStatus(assignment.status) }],
        details: [
          { label: 'Status', value: assignment.status },
          { label: 'Number of people', value: assignment.number_of_people },
          { label: 'Family ID', value: assignment.family_id },
          { label: 'House ID', value: assignment.house_id },
          { label: 'Evacuation center ID', value: assignment.evacuation_center_id },
          { label: 'Arrived', value: formatDate(assignment.arrived_at) },
          { label: 'Left', value: formatDate(assignment.left_at) },
          { label: 'Notes', value: assignment.notes },
        ],
        formValues: assignment,
      }))
    );
  },
};
