// store/useChatStore.ts
import { create } from 'zustand';

export enum ERole {
 USER= "user",
 ASSISTANT="assistant"
}
export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  // optional file metadata
  role?: ERole;
  file_url?: string;
  model_id?: string;
  uid?: string;
}

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: Partial<Message>) => void;
  clearConversation: () => void;
  setIsLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,

  addMessage: (message: Partial<Message>) => {
    const normalized: Message = {
      id: message.id ?? Date.now().toString(),
      role: message.role ?? ERole.ASSISTANT,
      content: message.content ?? '',
      timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
      file_url: message.file_url,
      model_id: message.model_id,
    };
    set((state) => ({
      messages: [...state.messages, normalized],
    }));
  },

  clearConversation: () => set({ messages: [] }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
}));
