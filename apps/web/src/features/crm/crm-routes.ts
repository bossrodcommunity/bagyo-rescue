export const crmRoutes = [
  {
    datasetId: 'lgus',
    label: 'LGUs',
    description: 'Municipal and city command records.',
    to: '/records/lgus',
  },
  {
    datasetId: 'barangays',
    label: 'Barangays',
    description: 'Area-level risk and LGU ownership records.',
    to: '/records/barangays',
  },
  {
    datasetId: 'houses',
    label: 'Houses',
    description: 'Household location, water level, and rescue state.',
    to: '/records/houses',
  },
  {
    datasetId: 'families',
    label: 'Families',
    description: 'Family units, member counts, and assistance needs.',
    to: '/records/families',
  },
  {
    datasetId: 'residents',
    label: 'Residents',
    description: 'Individual resident status and vulnerability flags.',
    to: '/records/residents',
  },
  {
    datasetId: 'evacuation-centers',
    label: 'Evacuation Centers',
    description: 'Shelter capacity, occupancy, supplies, and status.',
    to: '/records/evacuation-centers',
  },
  {
    datasetId: 'evacuation-center-assignments',
    label: 'Assignments',
    description: 'Family-to-center movement and check-in records.',
    to: '/records/evacuation-center-assignments',
  },
  {
    datasetId: 'contact-persons',
    label: 'Contacts',
    description: 'Contact persons attached to operational entities.',
    to: '/records/contact-persons',
  },
] as const;

export type CrmRoute = (typeof crmRoutes)[number];
