import type { FormEvent } from 'react';

export type CrmValue = boolean | number | string | null | undefined;
export type CrmPayload = Record<string, boolean | number | string | null>;
export type CrmMode = 'create' | 'edit' | 'view';
export type CrmTagTone = 'critical' | 'high' | 'medium' | 'low' | 'neutral' | 'success';

export type CrmTag = {
  label: string;
  tone: CrmTagTone;
};

export type CrmDetail = {
  label: string;
  value: CrmValue;
};

export type CrmDisplayRow = {
  id: string;
  title: string;
  subtitle?: string;
  fields: Record<string, CrmValue>;
  tags?: CrmTag[];
  details: CrmDetail[];
  formValues: Record<string, CrmValue>;
};

export type CrmColumn = {
  id: string;
  label: string;
};

export type CrmField = {
  name: string;
  label: string;
  type: 'checkbox' | 'datetime' | 'number' | 'select' | 'text' | 'textarea';
  defaultValue?: boolean | number | string;
  required?: boolean;
  options?: readonly string[];
  autoGenerate?: {
    sourceFields: string[];
    generate: (sourceValues: Record<string, string>) => Promise<string>;
  };
};

export type CrmDatasetResult = {
  records: CrmDisplayRow[];
  totalRecords: number;
  totalPages: number;
};

export type CrmDataset = {
  id: string;
  label: string;
  singularLabel: string;
  description: string;
  searchPlaceholder?: string;
  metricLabel: string;
  columns: CrmColumn[];
  formFields: CrmField[];
  fetchRecords: (searchText: string) => Promise<CrmDatasetResult>;
  createRecord: (payload: CrmPayload) => Promise<unknown>;
  updateRecord: (id: string, payload: CrmPayload) => Promise<unknown>;
  deleteRecord: (id: string) => Promise<unknown>;
};

export type RecordFormSubmitHandler = (event: FormEvent<HTMLFormElement>) => void;
