import type { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

function normalizeRouterBasepath(baseUrl: string) {
  const trimmed = baseUrl.replace(/\/$/, '');
  return trimmed === '' ? '/' : trimmed;
}

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    basepath: normalizeRouterBasepath(import.meta.env.BASE_URL),
    context: {
      queryClient,
    },
    defaultPreload: 'intent',
    scrollRestoration: true,
  });
}
