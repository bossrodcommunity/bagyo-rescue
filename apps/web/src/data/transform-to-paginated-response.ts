export type TransformToPaginatedResponseArgs<TRecord> = {
  records: TRecord[];
  totalRecords: number;
  limit: number;
  page: number;
};

export function transformToPaginatedResponse<TRecord>({
  records,
  totalRecords,
  limit,
  page,
}: TransformToPaginatedResponseArgs<TRecord>) {
  const totalPages = Math.ceil(totalRecords / limit);
  const nextPage = page < totalPages ? page + 1 : null;
  const previousPage = page > 1 ? page - 1 : null;

  return {
    records,
    total_records: totalRecords,
    total_pages: totalPages,
    page,
    limit,
    next_page: nextPage,
    previous_page: previousPage,
  };
}
