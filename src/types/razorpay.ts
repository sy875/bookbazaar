export interface RazorpayError {
  statusCode?: number;
  description?: string;
  source?: string;
  reason?: string;
  field?: string;
  error:{
    reason:string
  }
}

export interface RazorpayOrderType {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  status: string;
  attempts: number;
  notes?: Record<string, string>;
  created_at: number;
}