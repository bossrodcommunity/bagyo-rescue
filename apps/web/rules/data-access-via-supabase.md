---
description: Guidelines for Data Access Layer via Supabase
globs:
alwaysApply: false
---

# Guidelines for Data Access Layer via Supabase

## Purpose & Overview

These rules define the standard patterns for implementing data access operations using Supabase. Each function should have a single responsibility - performing one specific database operation. Complex operations requiring multiple steps should be handled at the service layer, not in the data access layer.

## File Structure

### Shared Domain

By default, place all data access files in the shared data directory. Only use feature domains when explicitly specified in requirements.

```
src/data/[entity-name]s/
├── create-[entity].ts                              # Create operation
├── get-[entity].ts                                 # Get single entity (base)
├── get-[entity]-with-[relation].ts                 # Get with specific relations
├── get-[entity]-with-[relation]-and-[relation].ts  # Get with multiple relations
├── update-[entity].ts                              # Update operation
├── delete-[entity].ts                              # Delete operation
├── search-[entity]s.ts                             # Search with filters and pagination
├── types.ts                                        # Entity-specific types (optional)
└── __test-utils__/                                 # Test utilities
```

### Feature Domain

When a prompt/requirement explicitly specifies that code should be organized in a feature domain, follow this structure:

```
src/features/[feature-name]/
└── _data/[entity-name]s/     # Feature-specific data access layer
    ├── create-[entity].ts    # Create operation
    ├── get-[entity].ts       # Get single entity
    ├── update-[entity].ts    # Update operation
    ├── delete-[entity].ts    # Delete operation
    ├── search-[entity]s.ts   # Search with filters
    ├── types.ts              # Entity-specific types (optional)
    └── __test-utils__/       # Test utilities
```

## Naming Conventions

### Function Naming

- `create[Entity]Data`: For creating resources
- `get[Entity]Data`: For retrieving a single resource
- `get[Entity]With[Relation]Data`: For retrieving with specific relations
- `update[Entity]Data`: For updating resources
- `delete[Entity]Data`: For deleting resources
- `search[Entity]sData`: For searching with filters and pagination

### Type Naming

- `[Operation][Entity]DataArgs`: Type for function arguments
- `[Operation][Entity]DataResponse`: Type for function return value (using `Awaited<ReturnType<typeof functionName>>`)
- Use Supabase generated types from `Database["public"]["Tables"]["table_name"]["Insert/Update/Row"]`

## Implementation Patterns

### Import Pattern

All files should follow this standard import pattern:

```typescript
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase/types';
import { BadRequestError, NotFoundError } from '@/utils/errors';
```

For search operations that return paginated results:

```typescript
import { transformToPaginatedResponse } from '../transform-to-paginated-response';
```

### Argument Pattern

All data access functions should use a single argument object with consistent naming:

- Create operations: `args` with `payload` property containing the insert data
- Update operations: `args` with `id` and `payload` properties
- Get/Delete operations: destructured `{ id }` or full `args` object
- Search operations: destructured parameters with defaults

### Create Operation

```typescript
// create-[entity].ts
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase/types';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type CreateEntityDataArgs = {
  payload: Database['public']['Tables']['entities']['Insert'];
};

export async function createEntityData(args: CreateEntityDataArgs) {
  const { data, error } = await supabase.from('entities').insert(args.payload).select().single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Entity not found');
    }

    throw new BadRequestError(`Failed to create entity: ${error.message}`);
  }

  return data;
}
```

### Get Single Entity (Base)

```typescript
// get-[entity].ts
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type GetEntityDataArgs = {
  id: string;
};

export async function getEntityData({ id }: GetEntityDataArgs) {
  const { data, error } = await supabase.from('entities').select().eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Entity not found');
    }

    throw new BadRequestError(`Failed to get entity: ${error.message}`);
  }

  return data;
}

export type GetEntityDataResponse = Awaited<ReturnType<typeof getEntityData>>;
```

### Get Single Entity with Relations

```typescript
// get-[entity]-with-[relation].ts
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type GetEntityWithRelationDataArgs = {
  id: string;
};

export async function getEntityWithRelationData({ id }: GetEntityWithRelationDataArgs) {
  const { data, error } = await supabase
    .from('entities')
    .select(
      `*,
      relations (
        id,
        name
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Entity not found');
    }

    throw new BadRequestError(`Failed to get entity: ${error.message}`);
  }

  return data;
}

export type GetEntityWithRelationDataResponse = Awaited<
  ReturnType<typeof getEntityWithRelationData>
>;
```

### Update Operation

```typescript
// update-[entity].ts
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase/types';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type UpdateEntityDataArgs = {
  id: string;
  payload: Database['public']['Tables']['entities']['Update'];
};

export async function updateEntityData(args: UpdateEntityDataArgs) {
  const { data: updatedEntity, error } = await supabase
    .from('entities')
    .update({
      ...args.payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', args.id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Entity not found');
    }

    throw new BadRequestError(`Failed to update entity: ${error.message}`);
  }

  return updatedEntity;
}
```

### Delete Operation

```typescript
// delete-[entity].ts
import { supabase } from '@/lib/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export type DeleteEntityDataArgs = {
  id: string;
};

export async function deleteEntityData({ id }: DeleteEntityDataArgs) {
  const { data, error } = await supabase.from('entities').delete().eq('id', id).select().single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw new BadRequestError(`Failed to delete entity: ${error.message}`);
  }

  return data;
}
```

### Search Operation

```typescript
// search-[entity]s.ts
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase/types';
import { BadRequestError, NotFoundError } from '@/utils/errors';
import { transformToPaginatedResponse } from '../transform-to-paginated-response';

export type SearchEntitiesFilters = {
  searchText?: string;
  // Add other filter properties specific to your entity
  status?: string;
  categoryId?: string;
  isActive?: boolean;
};

export type SearchEntitiesDataArgs = {
  limit?: number;
  page?: number;
  sortBy?: keyof Database['public']['Tables']['entities']['Row'];
  orderBy?: 'asc' | 'desc';
  filters?: SearchEntitiesFilters;
};

export async function searchEntitiesData({
  limit = 25,
  page = 1,
  sortBy = 'created_at',
  orderBy = 'desc',
  filters,
}: SearchEntitiesDataArgs) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('entities')
    .select(
      `
      *,
      related_table (
        id,
        name
      )
    `,
      { count: 'exact' }
    )
    .range(from, to)
    .order(sortBy, { ascending: orderBy === 'asc' });

  // Apply text search across multiple fields if provided
  if (filters?.searchText) {
    query = query.or(
      `name.ilike.%${filters.searchText}%,description.ilike.%${filters.searchText}%`
    );
  }

  // Apply individual filters
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  const { data, error, count } = await query;

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Entity not found');
    }

    throw new BadRequestError(`Failed to search entities: ${error.message}`);
  }

  return transformToPaginatedResponse({
    records: data || [],
    totalRecords: count || 0,
    limit,
    page,
  });
}

export type SearchEntitiesDataResponse = Awaited<ReturnType<typeof searchEntitiesData>>;
```

## Error Handling

### Standard Error Pattern

- Use custom error classes (`BadRequestError`, `NotFoundError`) for consistent error handling
- Check for specific Supabase error codes and throw appropriate errors
- Always include descriptive error messages with context

### Common Error Codes

- `PGRST116`: Row not found → Throw `NotFoundError`
- `23505`: Unique constraint violation → Throw `BadRequestError`
- `23503`: Foreign key constraint violation → Throw `BadRequestError`
- `42501`: Insufficient privileges → Throw `BadRequestError`

### Error Import

```typescript
import { BadRequestError, NotFoundError } from '@/utils/errors';
```

## Key Principles

### Single Responsibility

Each data access function should do ONE thing only:

- ❌ DON'T: Handle complex business logic or multiple operations
- ✅ DO: Perform a single database operation

### Type Safety

- Use Supabase generated types from `Database["public"]["Tables"]["table_name"]["Insert/Update/Row"]`
- Export response types using `Awaited<ReturnType<typeof functionName>>`
- Never manually define database schema types

### Consistency

- All functions follow the same naming pattern: `[operation][Entity]Data`
- All argument types end with `DataArgs`
- All response types end with `DataResponse`
- Use consistent argument patterns:
  - Create: `args.payload`
  - Update: `args.id` and `args.payload`
  - Delete: returns the deleted entity data (not void)

### Pagination

- Use `.range(from, to)` for pagination (NOT `.limit()` with `.range()`)
- Calculate indices correctly: `from = (page - 1) * limit`, `to = from + limit - 1`
- Always include `{ count: "exact" }` in search operations for total count

### Relations

- Create separate functions for different relation combinations
- Name files clearly: `get-[entity]-with-[relation].ts`
- Only select the fields needed from related tables

## Examples of What NOT to Do

```typescript
// ❌ BAD: Multiple responsibilities
export async function updateJobAndQuestions(jobData, questions) {
  // Updates job
  // Deletes old questions
  // Creates new questions
  // Returns updated job with questions
}

// ✅ GOOD: Single responsibility
export async function updateJobData(args) {
  // Only updates job
}
```

```typescript
// ❌ BAD: Business logic in data layer
export async function createJobData(args) {
  // Validate business rules
  // Transform data
  // Create job
  // Send notifications
}

// ✅ GOOD: Just data access
export async function createJobData(args) {
  // Only creates job in database
}
```
