import { Outlet, createFileRoute } from '@tanstack/react-router';
import { RequireAuth } from '@/components/auth/require-auth';

export const Route = createFileRoute('/records')({
  component: RecordsLayout,
});

function RecordsLayout() {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}
