export interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  has_subscription: boolean;
  subscription_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Log {
  log_id: number;
  user_id: number | null;
  log_message: string;
  log_type: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionType {
  subscription_type_id: number;
  subscription_type_name: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  subscription_id: number;
  user_id: number;
  subscription_type_id: number;
  last_paid_time: string;
  created_at: string;
  updated_at: string;
}

export interface Anomaly {
  anomaly_id: number;
  anomaly_name: string;
  anomaly_description: string;
  first_message: string;
}

export interface Chat {
  chat_id: number;
  user_id: number | null;
  chat_messages: ChatMessage[] | null;
  chat_status_id: number;
  created_by_llm: boolean;
  anomaly_id: number | null;
  priority_level_id: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface PriorityLevel {
  priority_level_id: number;
  priority_level_name: string | null;
}

export interface ChatStatus {
  chat_status_id: number;
  chat_status_name: string;
  created_at: string;
  updated_at: string;
}

export interface ChatReport {
  id: number;
  chat_id: number;
  report_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ActionRequest {
  id: number;
  chat_id: number;
  action_id: number;
  is_approved: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Action {
  action_id: number;
  action_name: string;
  action_description: string;
  is_allowed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: number;
  ticket_name: string;
  ticket_description: string;
  created_at: string;
  updated_at: string;
}
