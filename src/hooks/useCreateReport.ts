import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import supabase from '../lib/supabase';
import { Report, ReportType } from "./types";

export type CreateReportData = {
  report_type: ReportType;
  reason?: string;
  payload: Record<string, unknown>;
};

export type CreateReportError = {
  message: string;
  code?: string;
};

export const createReport = async (data: CreateReportData): Promise<Report> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be signed in to submit a report');
  }

  const { data: inserted, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      report_type: data.report_type,
      reason: data.reason ?? null,
      payload: data.payload,
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create report: ${error.message}`);
  }

  return inserted as Report;
};

export function useCreateReport(
  mutationOptions?: Partial<UseMutationOptions<Report, CreateReportError, CreateReportData>>,
): UseMutationResult<Report, CreateReportError, CreateReportData> {
  return useMutation<Report, CreateReportError, CreateReportData>({
    mutationFn: createReport,
    ...mutationOptions,
  });
}
