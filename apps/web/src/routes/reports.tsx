import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { createFileRoute } from '@tanstack/react-router';
import { FormEvent, useMemo } from 'react';
import {
  useAddRescueReport,
  useRescueReports,
  useUpdateReportStatus,
} from '../data/use-rescue-reports';
import type { RescuePriority, RescueReport } from '../db/schema';

const priorities: RescuePriority[] = ['critical', 'high', 'medium', 'low'];

export const Route = createFileRoute('/reports')({
  component: ReportsPage,
});

function ReportsPage() {
  const reportsQuery = useRescueReports();
  const addReport = useAddRescueReport();
  const updateStatus = useUpdateReportStatus();
  const reports = reportsQuery.data ?? [];

  const columns = useMemo<ColumnDef<RescueReport>[]>(
    () => [
      {
        accessorKey: 'household',
        header: 'Requester',
      },
      {
        accessorKey: 'location',
        header: 'Location',
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: info => (
          <span className={`pill pill--${info.getValue()}`}>{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: 'people',
        header: 'People',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: info => {
          const report = info.row.original;

          return (
            <select
              value={report.status}
              onChange={event =>
                updateStatus.mutate({
                  id: report.id,
                  status: event.target.value as RescueReport['status'],
                })
              }
            >
              <option value="new">New</option>
              <option value="triaged">Triaged</option>
              <option value="responding">Responding</option>
              <option value="resolved">Resolved</option>
            </select>
          );
        },
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
      },
    ],
    [updateStatus]
  );

  const table = useReactTable({
    data: reports,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const household = String(form.get('household') ?? '').trim();
    const location = String(form.get('location') ?? '').trim();
    const notes = String(form.get('notes') ?? '').trim();
    const priority = String(form.get('priority') ?? 'medium') as RescuePriority;
    const people = Number(form.get('people') ?? 1);

    if (!household || !location || !Number.isFinite(people)) {
      return;
    }

    addReport.mutate(
      {
        household,
        location,
        priority,
        people,
        notes,
      },
      {
        onSuccess: () => event.currentTarget.reset(),
      }
    );
  }

  return (
    <main className="page">
      <section className="toolbar">
        <div>
          <p className="eyebrow">IndexedDB reports</p>
          <h1>Rescue queue</h1>
        </div>
        <span className="sync-state">
          {reportsQuery.isFetching ? 'Refreshing' : 'Local data ready'}
        </span>
      </section>

      <form className="report-form" onSubmit={handleSubmit}>
        <input name="household" placeholder="Requester or household" required />
        <input name="location" placeholder="Location" required />
        <select name="priority" defaultValue="medium">
          {priorities.map(priority => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <input name="people" type="number" min="1" defaultValue="1" required />
        <input name="notes" placeholder="Notes" />
        <button type="submit" disabled={addReport.isPending}>
          Add report
        </button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
