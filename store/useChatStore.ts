import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: Message) => void;
  sendMessage: (text: string) => Promise<void>;
  clearConversation: () => void;
  setIsLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: false,

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  sendMessage: async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Add assistant response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `Réponse simulée pour: "${text}"`,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, assistantMessage],
      isLoading: false,
    }));
  },

  clearConversation: () => {
    set({ messages: [] });
  },

  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
