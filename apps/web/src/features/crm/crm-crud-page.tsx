import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { Link } from '@tanstack/react-router';
import { IconArrowsSort, IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import { type ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { crmRoutes } from './crm-routes';
import type {
  CrmDataset,
  CrmDisplayRow,
  CrmField,
  CrmMode,
  CrmPayload,
  CrmTagTone,
  CrmValue,
  RecordFormSubmitHandler,
} from './types';
import { formatValue, getErrorMessage, readPayloadFromForm, toDatetimeInputValue } from './utils';
import { Page, PageHeader, PageTitle, PageDescription } from '@/components/ui/page';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea, Checkbox } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertBody } from '@/components/ui/alert';
import {
  TableWrap,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/data-table';
import { cn } from '@/lib/utils';

export const crmQueryKey = ['/records'];

export type CrmCrudPageProps = {
  dataset: CrmDataset;
};

export function CrmCrudPage({ dataset }: CrmCrudPageProps) {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [mode, setMode] = useState<CrmMode>('view');
  const [formError, setFormError] = useState<string | null>(null);

  const recordsQuery = useQuery({
    queryKey: [...crmQueryKey, dataset.id, searchText],
    queryFn: () => dataset.fetchRecords(searchText.trim()),
  });

  const rows = recordsQuery.data?.records ?? [];
  const selectedRow = useMemo(() => {
    return rows.find(row => row.id === selectedRowId) ?? rows[0] ?? null;
  }, [rows, selectedRowId]);

  const createMutation = useMutation({
    mutationFn: (payload: CrmPayload) => dataset.createRecord(payload),
    onSuccess: () => handleMutationSuccess(queryClient, setMode, setFormError),
    onError: error => setFormError(getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CrmPayload }) =>
      dataset.updateRecord(id, payload),
    onSuccess: () => handleMutationSuccess(queryClient, setMode, setFormError),
    onError: error => setFormError(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataset.deleteRecord(id),
    onSuccess: () => {
      setSelectedRowId(null);
      handleMutationSuccess(queryClient, setMode, setFormError);
    },
    onError: error => setFormError(getErrorMessage(error)),
  });

  const isMutating =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const formInitialValues = mode === 'edit' ? selectedRow?.formValues : undefined;
  const totalRecords = recordsQuery.data?.totalRecords ?? 0;

  useEffect(() => {
    setSelectedRowId(null);
    setMode('view');
    setFormError(null);
  }, [dataset.id, searchText]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const payload = readPayloadFromForm(new FormData(event.currentTarget), dataset.formFields);

    if (mode === 'create') {
      createMutation.mutate(payload);
      return;
    }

    if (mode === 'edit' && selectedRow) {
      updateMutation.mutate({ id: selectedRow.id, payload });
    }
  }

  function handleDelete() {
    if (!selectedRow) return;

    const confirmed = window.confirm(`Delete ${dataset.singularLabel} "${selectedRow.title}"?`);
    if (!confirmed) return;

    setFormError(null);
    deleteMutation.mutate(selectedRow.id);
  }

  return (
    <Page width="wide" className="flex flex-col gap-8">
      <PageHeader>
        <PageTitle>{dataset.label}</PageTitle>
        <PageDescription>
          {dataset.description} <span className="text-muted-foreground">·</span>{' '}
          <span className="text-foreground">{totalRecords}</span> records
        </PageDescription>
      </PageHeader>

      <section
        aria-label={`${dataset.label} data access`}
        className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]"
      >
        <CrmNavigation activeDatasetId={dataset.id} />

        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {dataset.searchPlaceholder ? (
              <Input
                value={searchText}
                onChange={event => setSearchText(event.target.value)}
                placeholder={dataset.searchPlaceholder}
                className="max-w-sm"
                aria-label={`Search ${dataset.label}`}
              />
            ) : (
              <span />
            )}
            <Button
              variant="primary"
              size="md"
              type="button"
              onClick={() => {
                setMode('create');
                setFormError(null);
              }}
            >
              New {dataset.singularLabel}
            </Button>
          </div>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <CrmTable
              columns={dataset.columns}
              isLoading={recordsQuery.isLoading}
              label={dataset.label}
              rows={rows}
              selectedRowId={selectedRow?.id ?? null}
              onSelect={row => {
                setSelectedRowId(row.id);
                setMode('view');
                setFormError(null);
              }}
            />

            <aside
              aria-label="Selected record"
              className="sticky top-20 flex min-h-72 flex-col gap-4 rounded-md border border-border bg-surface p-5"
            >
              {mode === 'create' || (mode === 'edit' && selectedRow) ? (
                <RecordForm
                  dataset={dataset}
                  error={formError}
                  initialValues={formInitialValues}
                  isSubmitting={isMutating}
                  mode={mode}
                  onCancel={() => {
                    setMode('view');
                    setFormError(null);
                  }}
                  onSubmit={handleSubmit}
                />
              ) : recordsQuery.isLoading ? (
                <p className="text-body-md text-muted-foreground">Loading records.</p>
              ) : selectedRow ? (
                <RecordProfile
                  dataset={dataset}
                  isDeleting={deleteMutation.isPending}
                  row={selectedRow}
                  onDelete={handleDelete}
                  onEdit={() => {
                    setMode('edit');
                    setFormError(null);
                  }}
                />
              ) : (
                <p className="text-body-md text-muted-foreground">Select a record to inspect it.</p>
              )}
            </aside>
          </div>

          {recordsQuery.isError ? (
            <Alert tone="danger">
              <AlertBody>{getErrorMessage(recordsQuery.error)}</AlertBody>
            </Alert>
          ) : null}
          {mode === 'view' && formError ? (
            <Alert tone="danger">
              <AlertBody>{formError}</AlertBody>
            </Alert>
          ) : null}
        </section>
      </section>
    </Page>
  );
}

type CrmNavigationProps = {
  activeDatasetId?: string;
};

export function CrmNavigation({ activeDatasetId }: CrmNavigationProps) {
  return (
    <aside aria-label="Record types" className="flex flex-col gap-0.5 lg:sticky lg:top-20">
      {crmRoutes.map(route => {
        const isActive = route.datasetId === activeDatasetId;
        const className = cn(
          'flex min-h-10 items-center border-l-2 px-3 py-2 text-label-md transition-colors',
          isActive
            ? 'border-primary text-foreground font-semibold'
            : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
        );

        return (
          <Link
            key={route.datasetId}
            to={route.to}
            className={className}
            activeProps={{
              className:
                'flex min-h-10 items-center border-l-2 px-3 py-2 text-label-md border-primary text-foreground font-semibold',
            }}
          >
            <span>{route.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}

type CrmTableProps = {
  columns: CrmDataset['columns'];
  isLoading: boolean;
  label: string;
  rows: CrmDisplayRow[];
  selectedRowId: string | null;
  onSelect: (row: CrmDisplayRow) => void;
};

function CrmTable({ columns, isLoading, label, rows, selectedRowId, onSelect }: CrmTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const tableColumns = useMemo<ColumnDef<CrmDisplayRow>[]>(
    () => [
      {
        id: 'record',
        accessorFn: row => row.title,
        header: label,
        cell: info => {
          const row = info.row.original;

          return (
            <button
              type="button"
              onClick={() => onSelect(row)}
              className="flex flex-col items-start gap-0.5 text-left"
            >
              <strong className="text-body-md font-medium text-foreground">{row.title}</strong>
              {row.subtitle ? (
                <span className="text-label-md text-muted-foreground">{row.subtitle}</span>
              ) : null}
            </button>
          );
        },
      },
      ...columns.map<ColumnDef<CrmDisplayRow>>(column => ({
        id: column.id,
        accessorFn: row => formatValue(row.fields[column.id]),
        header: column.label,
        cell: info => formatValue(info.row.original.fields[column.id]),
      })),
    ],
    [columns, label, onSelect]
  );
  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <TableWrap>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHeaderCell key={header.id}>
                  {header.isPlaceholder ? null : (
                    <button
                      type="button"
                      disabled={!header.column.getCanSort()}
                      onClick={header.column.getToggleSortingHandler()}
                      className="inline-flex items-center gap-1.5 text-label-md font-medium text-muted-foreground hover:text-foreground"
                    >
                      <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      {header.column.getCanSort() ? (
                        <span aria-hidden="true">
                          {header.column.getIsSorted() === 'asc' ? (
                            <IconSortAscending className="size-3.5" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <IconSortDescending className="size-3.5" />
                          ) : (
                            <IconArrowsSort className="size-3.5 opacity-40" />
                          )}
                        </span>
                      ) : null}
                    </button>
                  )}
                </TableHeaderCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map(tableRow => (
            <TableRow
              key={tableRow.id}
              selected={tableRow.original.id === selectedRowId}
              onClick={() => onSelect(tableRow.original)}
              className="cursor-pointer"
            >
              {tableRow.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={table.getAllLeafColumns().length}>
                <span className="text-body-md text-muted-foreground">Loading records.</span>
              </TableCell>
            </TableRow>
          ) : null}
          {!isLoading && table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={table.getAllLeafColumns().length}>
                <span className="text-body-md text-muted-foreground">No records found.</span>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TableWrap>
  );
}

type RecordProfileProps = {
  dataset: CrmDataset;
  isDeleting: boolean;
  row: CrmDisplayRow;
  onDelete: () => void;
  onEdit: () => void;
};

function RecordProfile({ dataset, isDeleting, row, onDelete, onEdit }: RecordProfileProps) {
  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-heading-md font-semibold text-foreground">{row.title}</h3>
          {row.subtitle ? (
            <p className="text-label-md text-muted-foreground">{row.subtitle}</p>
          ) : null}
        </div>
        {row.tags?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {row.tags.map(tag => (
              <Badge key={`${tag.label}-${tag.tone}`} tone={mapCrmToneToBadgeTone(tag.tone)}>
                {tag.label}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" type="button" onClick={onEdit}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            isLoading={isDeleting}
            onClick={onDelete}
            className="text-danger hover:bg-danger-soft"
          >
            Delete {dataset.singularLabel}
          </Button>
        </div>
      </div>

      <dl className="flex flex-col">
        {row.details.map(detail => (
          <div
            key={detail.label}
            className="flex flex-col gap-0.5 border-t border-border py-3 first:border-t-0"
          >
            <dt className="text-caption font-medium uppercase tracking-wide text-muted-foreground">
              {detail.label}
            </dt>
            <dd className="m-0 break-words text-body-md text-foreground">
              {formatValue(detail.value)}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function mapCrmToneToBadgeTone(tone: CrmTagTone) {
  switch (tone) {
    case 'critical':
      return 'danger' as const;
    case 'high':
      return 'signal' as const;
    case 'success':
      return 'safe' as const;
    case 'medium':
    case 'low':
    case 'neutral':
    default:
      return 'neutral' as const;
  }
}

type RecordFormProps = {
  dataset: CrmDataset;
  error: string | null;
  initialValues?: Record<string, CrmValue>;
  isSubmitting: boolean;
  mode: CrmMode;
  onCancel: () => void;
  onSubmit: RecordFormSubmitHandler;
};

function RecordForm({
  dataset,
  error,
  initialValues,
  isSubmitting,
  mode,
  onCancel,
  onSubmit,
}: RecordFormProps) {
  const [values, setValues] = useState<Record<string, CrmValue>>(() =>
    getInitialFormValues(dataset.formFields, initialValues)
  );
  const [editedGeneratedFields, setEditedGeneratedFields] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const [generatingFieldName, setGeneratingFieldName] = useState<string | null>(null);
  const lastGenerationKeyRef = useRef<Record<string, string>>({});

  useEffect(() => {
    setValues(getInitialFormValues(dataset.formFields, initialValues));
    setEditedGeneratedFields(new Set());
    setGeneratingFieldName(null);
    lastGenerationKeyRef.current = {};
  }, [dataset.id, dataset.formFields, initialValues, mode]);

  useEffect(() => {
    if (mode !== 'create') return;

    const autoGeneratedField = dataset.formFields.find(field => field.autoGenerate);
    if (!autoGeneratedField?.autoGenerate) return;
    if (editedGeneratedFields.has(autoGeneratedField.name)) return;

    const sourceValues = autoGeneratedField.autoGenerate.sourceFields.reduce<
      Record<string, string>
    >((nextSourceValues, sourceField) => {
      nextSourceValues[sourceField] = String(values[sourceField] ?? '').trim();
      return nextSourceValues;
    }, {});

    if (!Object.values(sourceValues).every(Boolean)) {
      return;
    }

    const generationKey = JSON.stringify(sourceValues);
    if (lastGenerationKeyRef.current[autoGeneratedField.name] === generationKey) {
      return;
    }

    const codeValueAtRequest = values[autoGeneratedField.name];

    const timeoutId = window.setTimeout(() => {
      lastGenerationKeyRef.current[autoGeneratedField.name] = generationKey;
      setGeneratingFieldName(autoGeneratedField.name);

      autoGeneratedField.autoGenerate
        ?.generate(sourceValues)
        .then(code => {
          setValues(currentValues => {
            if (
              editedGeneratedFields.has(autoGeneratedField.name) ||
              lastGenerationKeyRef.current[autoGeneratedField.name] !== generationKey ||
              currentValues[autoGeneratedField.name] !== codeValueAtRequest
            ) {
              return currentValues;
            }

            return {
              ...currentValues,
              [autoGeneratedField.name]: code,
            };
          });
        })
        .finally(() => {
          setGeneratingFieldName(currentFieldName =>
            currentFieldName === autoGeneratedField.name ? null : currentFieldName
          );
        });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [dataset.formFields, editedGeneratedFields, mode, values]);

  function handleFieldChange(field: CrmField, event: ChangeEvent<HTMLInputElement>) {
    const nextValue = field.type === 'checkbox' ? event.currentTarget.checked : event.target.value;

    setValues(currentValues => ({
      ...currentValues,
      [field.name]: nextValue,
    }));

    if (field.autoGenerate) {
      setEditedGeneratedFields(currentEditedFields => new Set(currentEditedFields).add(field.name));
    }
  }

  function handleSelectChange(field: CrmField, event: ChangeEvent<HTMLSelectElement>) {
    setValues(currentValues => ({
      ...currentValues,
      [field.name]: event.target.value,
    }));
  }

  function handleTextareaChange(field: CrmField, event: ChangeEvent<HTMLTextAreaElement>) {
    setValues(currentValues => ({
      ...currentValues,
      [field.name]: event.target.value,
    }));
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-heading-md font-semibold text-foreground">
          {mode === 'create' ? `New ${dataset.singularLabel}` : `Edit ${dataset.singularLabel}`}
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {dataset.formFields.map(field => (
          <RecordField
            key={field.name}
            field={field}
            isGenerating={generatingFieldName === field.name}
            value={values[field.name]}
            onChange={handleFieldChange}
            onSelectChange={handleSelectChange}
            onTextareaChange={handleTextareaChange}
          />
        ))}
      </div>

      {error ? (
        <Alert tone="danger">
          <AlertBody>{error}</AlertBody>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="md" isLoading={isSubmitting}>
          {mode === 'create' ? 'Create' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" size="md" disabled={isSubmitting} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

type RecordFieldProps = {
  field: CrmField;
  isGenerating: boolean;
  value: CrmValue;
  onChange: (field: CrmField, event: ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (field: CrmField, event: ChangeEvent<HTMLSelectElement>) => void;
  onTextareaChange: (field: CrmField, event: ChangeEvent<HTMLTextAreaElement>) => void;
};

function RecordField({
  field,
  isGenerating,
  value,
  onChange,
  onSelectChange,
  onTextareaChange,
}: RecordFieldProps) {
  const resolvedValue = value === null || value === undefined ? field.defaultValue : value;
  const valueAsString =
    resolvedValue === null || resolvedValue === undefined ? '' : String(resolvedValue);

  if (field.type === 'checkbox') {
    return (
      <label className="flex min-h-10 items-center gap-2.5 text-label-md text-foreground">
        <Checkbox
          name={field.name}
          checked={Boolean(resolvedValue)}
          onChange={event => onChange(field, event)}
        />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <Label htmlFor={`field-${field.name}`}>
        {field.label}
        <Select
          id={`field-${field.name}`}
          name={field.name}
          value={valueAsString || field.options?.[0] || ''}
          required={field.required}
          onChange={event => onSelectChange(field, event)}
        >
          {field.options?.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Label>
    );
  }

  if (field.type === 'textarea') {
    return (
      <Label htmlFor={`field-${field.name}`}>
        {field.label}
        <Textarea
          id={`field-${field.name}`}
          name={field.name}
          value={valueAsString}
          required={field.required}
          onChange={event => onTextareaChange(field, event)}
        />
      </Label>
    );
  }

  return (
    <Label htmlFor={`field-${field.name}`} hint={isGenerating ? 'Generating…' : undefined}>
      {field.label}
      <Input
        id={`field-${field.name}`}
        name={field.name}
        type={field.type === 'datetime' ? 'datetime-local' : field.type}
        value={field.type === 'datetime' ? toDatetimeInputValue(valueAsString) : valueAsString}
        required={field.required}
        step={field.type === 'number' ? 'any' : undefined}
        onChange={event => onChange(field, event)}
      />
    </Label>
  );
}

function getInitialFormValues(fields: CrmField[], initialValues?: Record<string, CrmValue>) {
  return fields.reduce<Record<string, CrmValue>>((nextValues, field) => {
    nextValues[field.name] = initialValues?.[field.name] ?? field.defaultValue ?? '';
    return nextValues;
  }, {});
}

async function handleMutationSuccess(
  queryClient: QueryClient,
  setMode: (mode: CrmMode) => void,
  setFormError: (error: string | null) => void
) {
  await queryClient.invalidateQueries({ queryKey: crmQueryKey });
  setMode('view');
  setFormError(null);
}
