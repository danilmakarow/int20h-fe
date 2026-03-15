import { apiClient } from './client';
import type { CreateChatRequest, CreateChatResponse, GetChatResponse, SendMessageRequest, SendMessageResponse } from '@/types/api';

/** Create a new chat with initial message */
export const createChat = (body: CreateChatRequest): Promise<CreateChatResponse> => {
  return apiClient.post<CreateChatResponse>('/chat', body);
};

/** Get chat by ID with messages */
export const getChat = (chatId: number): Promise<GetChatResponse> => {
  return apiClient.get<GetChatResponse>(`/chat/${chatId}`);
};

/** Send a message to an existing chat, returns AI reply */
export const sendMessage = (chatId: number, body: SendMessageRequest): Promise<SendMessageResponse> => {
  return apiClient.post<SendMessageResponse>(`/chat/${chatId}`, body);
};
