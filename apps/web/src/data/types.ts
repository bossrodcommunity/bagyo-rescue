import { type Database } from '@/lib/supabase/types';

export type PublicTableName = keyof Database['public']['Tables'];
export type PublicTableRow<TTableName extends PublicTableName> =
  Database['public']['Tables'][TTableName]['Row'];
export type PublicTableInsert<TTableName extends PublicTableName> =
  Database['public']['Tables'][TTableName]['Insert'];
export type PublicTableUpdate<TTableName extends PublicTableName> =
  Database['public']['Tables'][TTableName]['Update'];

export type SortOrder = 'asc' | 'desc';

export type SearchDataArgs<TTableName extends PublicTableName, TFilters> = {
  limit?: number;
  page?: number;
  sortBy?: keyof PublicTableRow<TTableName>;
  orderBy?: SortOrder;
  filters?: TFilters;
};
