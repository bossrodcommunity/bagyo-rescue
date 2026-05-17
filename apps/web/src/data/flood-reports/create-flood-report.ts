import { supabase } from '@/lib/supabase';
import { type Database } from '@/lib/supabase/types';
import { BadRequestError } from '@/utils/errors';

export type CreateFloodReportDataArgs = {
  payload: Database['public']['Tables']['flood_reports']['Insert'];
};

export async function createFloodReportData(args: CreateFloodReportDataArgs) {
  const { data, error } = await supabase
    .from('flood_reports')
    .upsert(args.payload, { onConflict: 'client_report_id' })
    .select()
    .single();

  if (error) {
    throw new BadRequestError(`Failed to sync flood report: ${error.message}`);
  }

  return data;
}

export type CreateFloodReportDataResponse = Awaited<ReturnType<typeof createFloodReportData>>;
