import type {
  CrmDatasetResult,
  CrmDisplayRow,
  CrmField,
  CrmPayload,
  CrmTagTone,
  CrmValue,
} from './types';

export type PaginatedResponse<TRecord> = {
  records: TRecord[];
  total_records: number;
  total_pages: number;
};

export function toDatasetResult<TRecord>(
  response: PaginatedResponse<TRecord>,
  records: CrmDisplayRow[]
): CrmDatasetResult {
  return {
    records,
    totalRecords: response.total_records,
    totalPages: response.total_pages,
  };
}

export function readPayloadFromForm(formData: FormData, fields: CrmField[]) {
  return fields.reduce<CrmPayload>((payload, field) => {
    if (field.type === 'checkbox') {
      payload[field.name] = formData.get(field.name) === 'on';
      return payload;
    }

    const rawValue = String(formData.get(field.name) ?? '').trim();

    if (rawValue === '') {
      payload[field.name] = field.required ? '' : null;
      return payload;
    }

    if (field.type === 'number') {
      payload[field.name] = Number(rawValue);
      return payload;
    }

    if (field.type === 'datetime') {
      payload[field.name] = new Date(rawValue).toISOString();
      return payload;
    }

    payload[field.name] = rawValue;
    return payload;
  }, {});
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatValue(value: CrmValue) {
  if (value === null || value === undefined || value === '') {
    return 'Not set';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

export function shortId(value: string) {
  return value.slice(0, 8);
}

export function supplySummary(center: {
  has_food_supply: boolean;
  has_water_supply: boolean;
  has_medical_support: boolean;
  has_power: boolean;
}) {
  const supplies = [
    center.has_food_supply ? 'Food' : null,
    center.has_water_supply ? 'Water' : null,
    center.has_medical_support ? 'Medical' : null,
    center.has_power ? 'Power' : null,
  ].filter(Boolean);

  return supplies.length ? supplies.join(', ') : 'No supplies tagged';
}

export function toDatetimeInputValue(value: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 16);
}

export function toneFromRisk(value: string): CrmTagTone {
  if (value === 'Critical') return 'critical';
  if (value === 'High') return 'high';
  if (value === 'Medium') return 'medium';
  if (value === 'Low') return 'low';
  return 'neutral';
}

export function toneFromWaterLevel(value: string): CrmTagTone {
  if (['Chest', 'Roof'].includes(value)) return 'critical';
  if (['Waist'].includes(value)) return 'high';
  if (['Ankle', 'Knee', 'Unknown'].includes(value)) return 'medium';
  return 'low';
}

export function toneFromStatus(value: string): CrmTagTone {
  if (['Needs Rescue', 'Full', 'Missing / Unconfirmed'].includes(value)) return 'critical';
  if (['Needs Assistance', 'Near Capacity', 'Transferred'].includes(value)) return 'high';
  if (['Assigned', 'Checked In', 'Open', 'Inside House'].includes(value)) return 'medium';
  if (['Safe', 'Evacuated', 'Left'].includes(value)) return 'success';
  return 'neutral';
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unable to load records.';
}
