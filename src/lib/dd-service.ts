import { supabase } from '@/integrations/supabase/client';
import { RawTransaction, DDResult } from './dd-types';

export async function runDueDiligence(transactions: RawTransaction[]): Promise<DDResult> {
  const { data, error } = await supabase.functions.invoke('due-diligence', {
    body: { transactions },
  });

  if (error) {
    throw new Error(`Due diligence analysis failed: ${error.message}`);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as DDResult;
}
