import { ConversationState } from "../types.js";

const sessions = new Map<string, ConversationState>();

export function getConversationState(customerPhone: string): ConversationState | undefined {
  return sessions.get(customerPhone);
}

export function saveConversationState(state: ConversationState): void {
  sessions.set(state.customerPhone, {
    ...state,
    lastUpdatedAt: new Date().toISOString()
  });
}

export function resetConversationState(customerPhone: string): void {
  sessions.delete(customerPhone);
}
