import { type PublicTableInsert } from '@/data/types';
import { supabase } from '@/lib/supabase';
import { BadRequestError } from '@/utils/errors';

export type CreateReportHistoryDataArgs = {
  payload: PublicTableInsert<'report_histories'>;
};

export async function createReportHistoryData(args: CreateReportHistoryDataArgs) {
  const { error } = await supabase.from('report_histories').insert(args.payload);

  if (error) {
    if (error.code === '23505') {
      return args.payload;
    }

    throw new BadRequestError(`Failed to send report: ${error.message}`);
  }

  return args.payload;
}

export type CreateReportHistoryDataResponse = Awaited<ReturnType<typeof createReportHistoryData>>;
