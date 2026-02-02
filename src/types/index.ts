export interface BillType {
  id: string;
  name: string;
  icon: string;
  placeholder: string;
  label: string;
}

export interface BillResult {
  success: boolean;
  customerName?: string;
  billAmount?: number;
  dueDate?: string;
  status?: 'paid' | 'unpaid' | 'overdue';
  period?: string;
  details?: {
    item: string;
    amount: number;
  }[];
  message?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Step {
  id: number;
  title: string;
  description: string;
  icon: string;
}
