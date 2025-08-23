import axiosInstance from './axiosInstance';

export interface ChatbotMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatbotRequest {
  message: string;
  sessionId?: string;
  context?: {
    courseId?: string;
    currentPage?: string;
  };
}

export interface ChatbotResponse {
  sessionId: string;
  response: string;
  context?: any;
}

export interface ConversationHistory {
  sessionId: string;
  messages: ChatbotMessage[];
}

// Send a message to the chatbot
export const sendChatbotMessage = async (request: ChatbotRequest): Promise<ChatbotResponse> => {
  try {
    const response = await axiosInstance.post('/chatbot/message', request);
    return response.data.data;
  } catch (error: any) {
    console.error('Error sending chatbot message:', error);
    throw new Error(error.response?.data?.error || 'Failed to send message');
  }
};

// Get conversation history
export const getConversationHistory = async (sessionId: string): Promise<ChatbotMessage[]> => {
  try {
    const response = await axiosInstance.get(`/chatbot/conversations/${sessionId}/history`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching conversation history:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch conversation history');
  }
};

// End a conversation
export const endConversation = async (sessionId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/chatbot/conversations/${sessionId}`);
  } catch (error: any) {
    console.error('Error ending conversation:', error);
    throw new Error(error.response?.data?.error || 'Failed to end conversation');
  }
};

// Get user conversations
export const getUserConversations = async (limit?: number): Promise<ConversationHistory[]> => {
  try {
    const response = await axiosInstance.get('/chatbot/conversations', {
      params: { limit }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching user conversations:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch conversations');
  }
};

// Admin only - Clean up old conversations
export const cleanupOldConversations = async (days: number = 30): Promise<any> => {
  try {
    const response = await axiosInstance.delete('/chatbot/admin/cleanup', {
      params: { days }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error cleaning up conversations:', error);
    throw new Error(error.response?.data?.error || 'Failed to cleanup conversations');
  }
};

// Admin only - Get chatbot analytics
export const getChatbotAnalytics = async (days: number = 30): Promise<any> => {
  try {
    const response = await axiosInstance.get('/chatbot/admin/analytics', {
      params: { days }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching chatbot analytics:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch analytics');
  }
};
