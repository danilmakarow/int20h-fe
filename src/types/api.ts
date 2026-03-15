import type { Action, ActionRequest, Chat, ChatReport, Ticket, User } from './entities';

// Client-side
export interface CreateChatRequest {
  email: string;
  text: string;
}

export interface CreateChatResponse {
  chat: Chat;
}

export interface SendMessageRequest {
  text: string;
}

export interface SendMessageResponse {
  reply: string;
}

export interface GetChatResponse {
  data: Chat;
}

// Back office
export interface ChatListItem {
  chat: Omit<Chat, 'chat_messages'>;
  report: ChatReport | null;
  first_message: string | null;
}

export interface GetChatsResponse {
  data: ChatListItem[];
}

export interface ChatDetailData {
  chat: Chat;
  report: ChatReport | null;
  open_action: ActionRequest | null;
}

export interface GetChatDetailResponse {
  data: ChatDetailData;
}

export interface PatchActionRequestBody {
  action: 'accepted' | 'rejected';
}

export interface EscalateChatBody {
  escalate_to_human: boolean;
  message: string;
}

export interface GetActionsResponse {
  data: Action[];
}

export interface CreateActionBody {
  action_name: string;
  action_description: string;
  is_allowed: boolean;
}

export interface UpdateActionBody {
  action_id: number;
  action_name?: string;
  action_description?: string;
  is_allowed?: boolean;
}

export interface GetTicketsResponse {
  data: Ticket[];
}

export interface GetActionRequestsResponse {
  data: ActionRequest[];
}

export interface GetUsersResponse {
  data: User[];
}
