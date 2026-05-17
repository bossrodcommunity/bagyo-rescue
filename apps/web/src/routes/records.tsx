import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/records')({
  component: RecordsLayout,
});

function RecordsLayout() {
  return <Outlet />;
}
